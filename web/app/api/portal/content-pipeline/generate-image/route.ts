import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from "sharp";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { saveMedicalImageAsset } from "@/lib/medicalImageAssets";
import type { ImageCategory } from "@/lib/medicalImagePrompts";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !url.startsWith("http")) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export const maxDuration = 60;

// public/ is a standard Next.js convention, always included in whatever gets
// deployed (unlike the ad-hoc repo-root docs/ folder that caused the earlier
// Hostinger path bug) — safe to read directly at runtime.
const LOGO_PATH = path.join(process.cwd(), "public", "brand", "lkc-logo-k-transparent.png");
let cachedLogoBuffer: Buffer | null = null;

function getLogoBuffer(): Buffer {
  if (!cachedLogoBuffer) {
    cachedLogoBuffer = fs.readFileSync(LOGO_PATH);
  }
  return cachedLogoBuffer;
}

// Composites the clinic logo onto the top-right corner as a clean post-
// processing step, rather than asking the AI model to draw one — AI-drawn
// logos/text come out garbled (the exact problem the reference docs already
// warn about for embedded labels). Sized relative to the image's shorter
// dimension so it stays proportionate across square/portrait/landscape formats.
async function compositeLogo(imageBuffer: Buffer, format: string): Promise<Buffer> {
  const base = sharp(imageBuffer);
  const metadata = await base.metadata();
  const imgWidth = metadata.width || 1024;
  const imgHeight = metadata.height || 1024;
  const shorterSide = Math.min(imgWidth, imgHeight);

  const logoTargetWidth = Math.round(shorterSide * 0.07);
  const logoBuffer = await sharp(getLogoBuffer()).resize({ width: logoTargetWidth }).toBuffer();
  const logoMetadata = await sharp(logoBuffer).metadata();
  const logoWidth = logoMetadata.width || logoTargetWidth;

  const margin = Math.round(shorterSide * 0.04);
  const left = Math.max(0, imgWidth - logoWidth - margin);
  const top = margin;

  const baseWithComposite = base.composite([{ input: logoBuffer, left, top }]);
  if (format === "png") {
    return baseWithComposite.png().toBuffer();
  } else if (format === "jpeg" || format === "jpg") {
    return baseWithComposite.jpeg({ quality: 90 }).toBuffer();
  } else {
    return baseWithComposite.webp({ quality: 90 }).toBuffer();
  }
}

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
  "4:5": "a portrait Instagram feed (4:5) composition",
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
      addLogo,
      confirmOverwrite,
      format,
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
    // Callers should pass an explicit format (GenerateImageModal picks WebP for
    // blog images, JPEG for anything social-bound — see its handleGenerate).
    // This fallback only fires if one doesn't; JPEG is the safer unknown-intent
    // default since Instagram/Facebook/LinkedIn's manual upload flows and any
    // future Meta Graph API auto-posting don't reliably accept WebP, while a
    // blog page still renders a JPEG fine (just a bit larger than WebP).
    const outputFormat = format || "jpeg";
    const extension = outputFormat === "png" ? ".png" : (outputFormat === "jpeg" || outputFormat === "jpg") ? ".jpg" : ".webp";
    
    let baseName = rawFilename;
    if (baseName.endsWith(".webp")) baseName = baseName.slice(0, -5);
    else if (baseName.endsWith(".png")) baseName = baseName.slice(0, -4);
    else if (baseName.endsWith(".jpg")) baseName = baseName.slice(0, -4);
    else if (baseName.endsWith(".jpeg")) baseName = baseName.slice(0, -5);
    
    const safeFilename = `${baseName}${extension}`;
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
    let processedBuffer: Buffer;
    if (outputFormat === "png") {
      processedBuffer = await sharp(sourceBuffer).png().toBuffer();
    } else if (outputFormat === "jpeg" || outputFormat === "jpg") {
      processedBuffer = await sharp(sourceBuffer).jpeg({ quality: 90 }).toBuffer();
    } else {
      processedBuffer = await sharp(sourceBuffer).webp({ quality: 90 }).toBuffer();
    }

    if (addLogo) {
      try {
        processedBuffer = await compositeLogo(processedBuffer, outputFormat);
      } catch (err) {
        console.error("Logo overlay failed, continuing without it:", err);
      }
    }

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
        "Content-Type": outputFormat === "png" ? "image/png" : (outputFormat === "jpeg" || outputFormat === "jpg") ? "image/jpeg" : "image/webp",
        "x-upsert": "true",
      },
      body: new Uint8Array(processedBuffer),
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
