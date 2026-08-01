import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from "sharp";
import crypto from "crypto";
import { saveMedicalImageAsset } from "@/lib/medicalImageAssets";
import type { ImageCategory } from "@/lib/medicalImagePrompts";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !url.startsWith("http")) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export const maxDuration = 60;

// Dedicated bucket for reusable, clinically-reviewed knee illustrations — kept
// separate from "content-pipeline-images" (ad-hoc per-run blog/social images)
// since these are long-lived assets meant to be reused across pages. Objects
// are stored at "[category]/[filename].webp", mirroring the folder/naming
// convention in web/docs/medical-imagery-guidelines.md even though the physical
// backend is Supabase Storage rather than /public/images (writing to /public
// at runtime doesn't persist on this Hostinger deployment — see
// content-pipeline/upload/route.ts's fallback path, which exists for the same
// reason and is explicitly flagged there as a last resort, not a pattern to copy).
const BUCKET = "medical-illustrations";

const FORMAT_HINT: Record<string, string> = {
  "1:1": "a square (1:1) composition",
  "3:4": "a portrait tablet (3:4) composition",
  "4:3": "a landscape tablet (4:3) composition",
  "9:16": "a tall vertical mobile (9:16) composition",
  "16:9": "a wide landscape desktop (16:9) composition",
};

async function generateWithFallback(
  genAI: GoogleGenerativeAI,
  prompt: string,
  aspectRatio: string,
  negativePrompt: string | undefined
): Promise<{ imageBytesBase64: string; mimeType: string; model: string }> {
  // The dedicated Imagen `generateImages`/predict API (which supports real
  // aspectRatio/negativePrompt config) isn't available on this project's plain
  // Gemini Developer API key (imagen-4.0-generate-001 404s as "no longer
  // available to new users"; imagen-3.0-generate-002 doesn't exist for this API
  // version at all). The `generateContent()`-based image models are what's
  // actually provisioned here, so aspect ratio and the negative prompt are
  // folded into the prompt text instead of passed as API config.
  const models = ["gemini-3-pro-image", "gemini-2.5-flash-image"];
  let lastError: any = null;

  const formatHint = FORMAT_HINT[aspectRatio] || `a ${aspectRatio} composition`;
  const fullPrompt = [
    prompt,
    `Compose the image for ${formatHint}.`,
    negativePrompt?.trim() ? `Avoid the following: ${negativePrompt.trim()}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  for (const modelName of models) {
    try {
      console.log(`[Medical Image Gen] Attempting generation with ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(fullPrompt);
      const parts = result.response.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p: any) => p.inlineData?.data);
      if (imagePart?.inlineData?.data) {
        console.log(`[Medical Image Gen] Success with ${modelName}`);
        return {
          imageBytesBase64: imagePart.inlineData.data,
          mimeType: imagePart.inlineData.mimeType || "image/png",
          model: modelName,
        };
      }
    } catch (err) {
      console.warn(`[Medical Image Gen] ${modelName} failed:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("The AI did not return an image for this description.");
}

export async function POST(request: Request) {
  try {
    const {
      prompt,
      negativePrompt,
      aspectRatio,
      category,
      subjectTitle,
      filename,
      altText,
      page,
      section,
      transparentBackground,
      confirmOverwrite,
    } = await request.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ success: false, error: "A description of the image is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY is missing from environment variables." }, { status: 500 });
    }

    const config = getSupabaseConfig();
    if (!config) {
      return NextResponse.json({ success: false, error: "Image storage is not configured (Supabase missing)." }, { status: 500 });
    }

    const safeCategory: ImageCategory = category || "anatomy";
    const rawFilename = (typeof filename === "string" && filename.trim()) || `${safeCategory}-generated-${Date.now()}`;
    const safeFilename = rawFilename.endsWith(".webp") ? rawFilename : `${rawFilename}.webp`;
    const storagePath = `${safeCategory}/${safeFilename}`;
    const publicUrl = `${config.url}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(storagePath)}`;

    if (!confirmOverwrite) {
      const existsRes = await fetch(publicUrl, { method: "HEAD" }).catch(() => null);
      if (existsRes?.ok) {
        return NextResponse.json(
          {
            success: false,
            overwriteNeeded: true,
            existingUrl: publicUrl,
            error: `An image named "${safeFilename}" already exists in ${safeCategory}. Confirm overwrite or choose a different filename.`,
          },
          { status: 409 }
        );
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let imageBytesBase64: string;
    let modelUsed: string;
    try {
      const generated = await generateWithFallback(genAI, prompt.trim(), aspectRatio || "1:1", negativePrompt);
      imageBytesBase64 = generated.imageBytesBase64;
      modelUsed = generated.model;
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: `Image generation failed: ${err.message || "Unknown error"}` },
        { status: 502 }
      );
    }

    const sourceBuffer = Buffer.from(imageBytesBase64, "base64");
    const webpBuffer = await sharp(sourceBuffer).webp({ quality: 90 }).toBuffer();

    try {
      await fetch(`${config.url}/storage/v1/bucket`, {
        method: "POST",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
      });
    } catch {
      // Bucket likely already exists
    }

    const uploadUrl = `${config.url}/storage/v1/object/${BUCKET}/${encodeURIComponent(storagePath)}`;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "image/webp",
        "x-upsert": "true",
      },
      body: webpBuffer,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("Supabase Storage upload error (medical image):", uploadRes.status, errorText);
      return NextResponse.json(
        { success: false, error: `Failed to store the generated image (${uploadRes.status}).` },
        { status: 500 }
      );
    }

    const assetId = crypto.randomUUID();
    await saveMedicalImageAsset({
      id: assetId,
      filename: safeFilename,
      storagePath,
      url: publicUrl,
      category: safeCategory,
      subjectTitle: subjectTitle || "",
      promptUsed: prompt.trim(),
      negativePrompt: negativePrompt || "",
      aspectRatio: aspectRatio || "1:1",
      transparentBackground: !!transparentBackground,
      altText: altText || "",
      page: page || undefined,
      section: section || undefined,
      provider: "google-genai",
      model: modelUsed,
      generatedAt: new Date().toISOString(),
      clinicalReviewStatus: "required",
    });

    return NextResponse.json({ success: true, url: publicUrl, assetId, storagePath });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/generate-image:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
