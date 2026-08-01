import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

    if (!file.type || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only image files (e.g. image/png, image/jpeg, image/webp) are allowed." },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds the 5MB limit. Please upload a smaller image." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${Date.now()}-${safeName}`;
    const contentType = file.type || "image/png";

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
            id: "content-pipeline-images",
            name: "content-pipeline-images",
            public: true,
          }),
        });
      } catch {
        // Bucket might already exist
      }

      // Upload file to Supabase storage
      const uploadUrl = `${config.url}/storage/v1/object/content-pipeline-images/${encodeURIComponent(fileName)}`;
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
        const publicUrl = `${config.url}/storage/v1/object/public/content-pipeline-images/${encodeURIComponent(fileName)}`;
        return NextResponse.json({
          success: true,
          url: publicUrl,
          fileName,
        });
      } else {
        const errorText = await uploadRes.text();
        console.error("Supabase Storage upload error:", uploadRes.status, errorText);
        return NextResponse.json(
          { success: false, error: `Supabase Storage upload failed (${uploadRes.status}): ${errorText || "Unknown error"}` },
          { status: 500 }
        );
      }
    }

    // Local filesystem fallback — only activates when Supabase genuinely isn't configured
    console.warn(
      `Image ${fileName} saved to local fallback directory — Supabase is not configured. Investigate before this happens in production.`
    );

    const uploadDir = path.join(process.cwd(), "public", "uploads", "content-pipeline");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `/uploads/content-pipeline/${fileName}`;
    return NextResponse.json({
      success: true,
      url: localUrl,
      fileName,
    });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/upload:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
