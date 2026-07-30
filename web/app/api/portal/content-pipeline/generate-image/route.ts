import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !url.startsWith("http")) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { prompt, isFeatured } = await request.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ success: false, error: "A description of the image is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY is missing from environment variables." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const fullPrompt = `Create a professional, clinical, editorial-style medical illustration/photo suitable for a UK orthopaedic knee clinic's patient blog article${
      isFeatured ? " (this will be used as the article's featured hero/card image)" : ""
    }. Do not depict any real, identifiable person. Style: clean, calm, reassuring, high quality, suitable for a healthcare website.

Subject to depict: ${prompt.trim()}`;

    const result = await model.generateContent(fullPrompt);
    const parts = result.response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      const textPart = parts.find((p: any) => p.text)?.text;
      return NextResponse.json(
        { success: false, error: textPart || "The AI did not return an image for this description. Try rewording it or use Upload/Paste URL instead." },
        { status: 502 }
      );
    }

    const mimeType = imagePart.inlineData.mimeType || "image/png";
    const extension = mimeType.split("/")[1] || "png";
    const buffer = Buffer.from(imagePart.inlineData.data, "base64");
    const fileName = `${Date.now()}-ai-generated.${extension}`;

    const config = getSupabaseConfig();
    if (!config) {
      return NextResponse.json({ success: false, error: "Image storage is not configured (Supabase missing)." }, { status: 500 });
    }

    try {
      await fetch(`${config.url}/storage/v1/bucket`, {
        method: "POST",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: "content-pipeline-images", name: "content-pipeline-images", public: true }),
      });
    } catch {
      // Bucket likely already exists
    }

    const uploadUrl = `${config.url}/storage/v1/object/content-pipeline-images/${encodeURIComponent(fileName)}`;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": mimeType,
        "x-upsert": "true",
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("Supabase Storage upload error (AI image):", uploadRes.status, errorText);
      return NextResponse.json(
        { success: false, error: `Failed to store the generated image (${uploadRes.status}).` },
        { status: 500 }
      );
    }

    const publicUrl = `${config.url}/storage/v1/object/public/content-pipeline-images/${encodeURIComponent(fileName)}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/generate-image:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
