import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const REEL_VIDEOS_BUCKET = "reel-videos";

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

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB — matches this Supabase project's storage limit
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds the 50MB limit. Please upload a smaller video." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${Date.now()}-${safeName}`;
    const contentType = file.type || "video/mp4";

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
