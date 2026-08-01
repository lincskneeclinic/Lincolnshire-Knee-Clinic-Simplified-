import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";
import ffmpegPath from "ffmpeg-static";

export const maxDuration = 300;

const execFileAsync = promisify(execFile);

const REEL_VIDEOS_BUCKET = "reel-videos";
const VEO_MODEL = "veo-3.1-fast-generate-preview";
const POLL_INTERVAL_MS = 8000;
const MAX_WAIT_MS = 240000;
const MAX_SEGMENTS = 5; // matches the typical hook + 3 points + CTA reel script structure
const MAX_WORDS_PER_SEGMENT = 17; // ~7-8s of speech at a natural narration pace — Veo's per-clip cap

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !url.startsWith("http")) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function truncateToWordLimit(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ").replace(/[,;:—-]+$/, "")}.`;
}

// Greedily packs sentences into up to maxSegments chunks, each targeting maxWordsPerSegment —
// used only as a fallback when a script has no structured "Voiceover:" markup to lift lines from.
function splitBySentenceIntoChunks(text: string, maxSegments: number, maxWordsPerSegment: number): string[] {
  const sentences = (text.match(/[^.!?]+[.!?]*/g) || [text]).map((s) => s.trim()).filter(Boolean);
  if (sentences.length === 0) return [text.trim()].filter(Boolean);

  const segments: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (segments.length === maxSegments - 1) {
      current = current ? `${current} ${sentence}` : sentence;
      continue;
    }
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (current && candidate.split(/\s+/).length > maxWordsPerSegment) {
      segments.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current) segments.push(current);
  return segments.slice(0, maxSegments);
}

// Reel scripts are AI-written with one "Voiceover:" line per timed beat (Hook, Point 1-3, CTA) —
// each already scoped to roughly one 8-second Veo clip. Lift those lines directly rather than
// re-splitting the whole script, since they're already the intended per-beat narration.
function extractVoiceoverSegments(script?: string, fallbackTopic?: string): string[] {
  const raw = (script || "").trim();
  if (!raw) return [fallbackTopic || ""].filter(Boolean);

  const matches = [...raw.matchAll(/voiceover[^:]*:[\s*"'“]*([^\n"”]+)/gi)];
  let segments = matches.map((m) => m[1].replace(/[*"'“”]+$/, "").trim()).filter(Boolean);

  if (segments.length === 0) {
    const hookMatch = raw.match(/Hook:\s*([\s\S]*?)(?:\n\n|$)/i);
    const fallbackText = (hookMatch && hookMatch[1].trim()) || raw;
    segments = splitBySentenceIntoChunks(fallbackText, MAX_SEGMENTS, MAX_WORDS_PER_SEGMENT);
  }

  if (segments.length > MAX_SEGMENTS) {
    const kept = segments.slice(0, MAX_SEGMENTS - 1);
    const merged = segments.slice(MAX_SEGMENTS - 1).join(" ");
    segments = [...kept, merged];
  }

  return segments.map((s) => truncateToWordLimit(s, MAX_WORDS_PER_SEGMENT));
}

function buildSegmentPrompt(topic: string, segmentText: string, segmentIndex: number, totalSegments: number): string {
  return `Abstract, calming motion graphics — part ${segmentIndex + 1} of ${totalSegments} of a background video for a short healthcare social media video about: "${topic}".

Style: elegant, slow-moving abstract visuals in a premium orthopaedic clinic's navy blue and teal colour palette, consistent across all parts of this sequence. Soft gradients, gentle particle or light motion, smooth blurred bokeh, or gentle abstract camera drift over out-of-focus clinical shapes. Calm, professional, reassuring mood.

Strict visual requirements: no people, no faces, no hands, no realistic human figures, no readable text, no logos, no watermarks, no graphic or distressing medical imagery, no anatomically literal depictions. Purely abstract and non-representational. Vertical 9:16 format.

Audio: a warm, clear, professional female British voiceover narrator (voice only — no visible speaker or mouth on screen) speaking exactly this line: "${segmentText}"`;
}

async function generateSegmentBuffer(ai: GoogleGenAI, apiKey: string, prompt: string): Promise<Buffer> {
  let operation = await ai.models.generateVideos({
    model: VEO_MODEL,
    prompt,
    config: { aspectRatio: "9:16" },
  });

  const start = Date.now();
  while (!operation.done) {
    if (Date.now() - start > MAX_WAIT_MS) {
      throw new Error("Video generation timed out.");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
    const errorMessage = (operation as any).error?.message || "The AI did not return a video segment.";
    throw new Error(errorMessage);
  }

  const downloadRes = await fetch(videoUri, { headers: { "x-goog-api-key": apiKey } });
  if (!downloadRes.ok) {
    throw new Error(`Failed to download a generated video segment (${downloadRes.status}).`);
  }
  return Buffer.from(await downloadRes.arrayBuffer());
}

async function concatenateSegments(buffers: Buffer[]): Promise<Buffer> {
  if (buffers.length === 1) return buffers[0];
  if (!ffmpegPath) throw new Error("ffmpeg binary is not available on this server.");

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "reel-broll-"));
  try {
    const inputPaths: string[] = [];
    for (let i = 0; i < buffers.length; i++) {
      const p = path.join(workDir, `segment-${i}.mp4`);
      await fs.writeFile(p, buffers[i]);
      inputPaths.push(p);
    }

    const outputPath = path.join(workDir, "combined.mp4");
    const filterInputs = inputPaths.map((_, i) => `[${i}:v:0][${i}:a:0]`).join("");
    const filterComplex = `${filterInputs}concat=n=${inputPaths.length}:v=1:a=1[outv][outa]`;

    const args: string[] = [];
    for (const p of inputPaths) {
      args.push("-i", p);
    }
    args.push(
      "-filter_complex", filterComplex,
      "-map", "[outv]",
      "-map", "[outa]",
      "-y",
      outputPath
    );

    await execFileAsync(ffmpegPath as unknown as string, args, { maxBuffer: 1024 * 1024 * 50 });
    return await fs.readFile(outputPath);
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, script } = body as { topic?: string; script?: string };

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "A topic is required to generate b-roll footage." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is missing from environment variables." },
        { status: 500 }
      );
    }

    const config = getSupabaseConfig();
    if (!config) {
      return NextResponse.json(
        { success: false, error: "Supabase Storage is not configured — cannot persist the generated video." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const segments = extractVoiceoverSegments(script, topic);

    const buffers = await Promise.all(
      segments.map((segmentText, i) =>
        generateSegmentBuffer(ai, apiKey, buildSegmentPrompt(topic, segmentText, i, segments.length))
      )
    );

    const finalBuffer = await concatenateSegments(buffers);

    const topicSlug = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "reel";
    const uniqueSuffix = Date.now().toString(36).slice(-6);
    const fileName = `ai-broll-${topicSlug}-${uniqueSuffix}.mp4`;

    try {
      await fetch(`${config.url}/storage/v1/bucket`, {
        method: "POST",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: REEL_VIDEOS_BUCKET,
          name: REEL_VIDEOS_BUCKET,
          public: true,
        }),
      });
    } catch {
      // Bucket might already exist
    }

    const uploadUrl = `${config.url}/storage/v1/object/${REEL_VIDEOS_BUCKET}/${encodeURIComponent(fileName)}`;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "video/mp4",
        "x-upsert": "true",
      },
      body: new Uint8Array(finalBuffer),
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("Supabase Storage b-roll upload error:", uploadRes.status, errorText);
      return NextResponse.json(
        { success: false, error: `Supabase Storage upload failed (${uploadRes.status}): ${errorText || "Unknown error"}` },
        { status: 500 }
      );
    }

    const publicUrl = `${config.url}/storage/v1/object/public/${REEL_VIDEOS_BUCKET}/${encodeURIComponent(fileName)}`;
    return NextResponse.json({ success: true, url: publicUrl, fileName, segments: segments.length });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/generate-reel-video:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate the b-roll video" },
      { status: 500 }
    );
  }
}
