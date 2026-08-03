import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { execFile } from "child_process";
import ffmpegPath from "ffmpeg-static";

const REEL_VIDEOS_BUCKET = "reel-videos";

/**
 * Re-encodes an uploaded video to a web-reasonable bitrate before storing it —
 * the exact same settings used to fix the 117MB Arthrosamid video (which was
 * never actually deployable at its original size). CRF-based H.264 Baseline
 * (maximum device compatibility) with +faststart (required for reliable
 * progressive playback on mobile Safari). Falls back to the original buffer
 * if ffmpeg fails for any reason — a slightly larger upload beats a broken one.
 */
async function compressVideo(inputBuffer: Buffer): Promise<{ buffer: Buffer; reencoded: boolean }> {
  if (!ffmpegPath) return { buffer: inputBuffer, reencoded: false };
  const ffmpegBin: string = ffmpegPath;

  const tmpDir = os.tmpdir();
  const id = crypto.randomUUID();
  const inputPath = path.join(tmpDir, `${id}-in.mp4`);
  const outputPath = path.join(tmpDir, `${id}-out.mp4`);

  try {
    fs.writeFileSync(inputPath, inputBuffer);

    await new Promise<void>((resolve, reject) => {
      execFile(
        ffmpegBin,
        [
          "-y",
          "-i", inputPath,
          "-c:v", "libx264",
          "-preset", "veryfast",
          "-crf", "26",
          "-profile:v", "baseline",
          "-level", "3.1",
          "-pix_fmt", "yuv420p",
          "-c:a", "aac",
          "-b:a", "128k",
          "-movflags", "+faststart",
          outputPath,
        ],
        { timeout: 90_000 },
        (error: Error | null) => (error ? reject(error) : resolve())
      );
    });

    const compressed = fs.readFileSync(outputPath);
    // Only use the compressed version if it's genuinely smaller — a very
    // short/low-bitrate source could re-encode larger than the original.
    if (compressed.length < inputBuffer.length) return { buffer: compressed, reencoded: true };
    return { buffer: inputBuffer, reencoded: false };
  } catch (error) {
    console.error("Video compression failed, uploading original file instead:", error);
    return { buffer: inputBuffer, reencoded: false };
  } finally {
    fs.unlink(inputPath, () => {});
    fs.unlink(outputPath, () => {});
  }
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !url.startsWith("http")) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!file.type || !file.type.startsWith("video/")) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only video files (e.g. video/mp4, video/quicktime) are allowed." },
        { status: 400 }
      );
    }

    const SUPABASE_STORAGE_LIMIT = 50 * 1024 * 1024; // 50MB — matches this Supabase project's storage limit
    // Raw phone-recorded clips routinely exceed 50MB but compress down well
    // under it — only reject outright if the file is implausibly large even
    // for that (guards against resource exhaustion, not a real use case).
    const MAX_RAW_UPLOAD_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_RAW_UPLOAD_SIZE) {
      return NextResponse.json(
        { success: false, error: "File is too large to process (max 500MB before compression)." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);
    const { buffer, reencoded } = await compressVideo(rawBuffer);

    if (buffer.length > SUPABASE_STORAGE_LIMIT) {
      return NextResponse.json(
        { success: false, error: "Video is still over 50MB after compression. Please upload a shorter clip." },
        { status: 400 }
      );
    }

    // A re-encode always produces an MP4 container regardless of the source
    // format (e.g. a .mov upload), so the content-type must follow suit —
    // otherwise a video/quicktime header would be paired with real MP4 bytes.
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = reencoded ? `${Date.now()}-${safeName.replace(/\.[^.]+$/, "")}.mp4` : `${Date.now()}-${safeName}`;
    const contentType = reencoded ? "video/mp4" : file.type || "video/mp4";

    const config = getSupabaseConfig();

    if (config) {
      try {
        // Ensure bucket exists
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
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: new Uint8Array(buffer),
      });

      if (uploadRes.ok) {
        const publicUrl = `${config.url}/storage/v1/object/public/${REEL_VIDEOS_BUCKET}/${encodeURIComponent(fileName)}`;
        return NextResponse.json({
          success: true,
          url: publicUrl,
          fileName,
        });
      } else {
        const errorText = await uploadRes.text();
        console.error("Supabase Storage video upload error:", uploadRes.status, errorText);
        return NextResponse.json(
          { success: false, error: `Supabase Storage upload failed (${uploadRes.status}): ${errorText || "Unknown error"}` },
          { status: 500 }
        );
      }
    }

    // Local filesystem fallback — only activates when Supabase genuinely isn't configured
    console.warn(
      `Video ${fileName} saved to local fallback directory — Supabase is not configured. Investigate before this happens in production.`
    );

    const uploadDir = path.join(process.cwd(), "public", "uploads", "reel-videos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `/uploads/reel-videos/${fileName}`;
    return NextResponse.json({
      success: true,
      url: localUrl,
      fileName,
    });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/upload-video:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload video" },
      { status: 500 }
    );
  }
}
