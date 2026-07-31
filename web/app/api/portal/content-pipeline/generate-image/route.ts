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
    let imageBase64: string | null = null;
    let mimeType = "image/png";

    const cleanBriefPrompt = `Create a realistic image suitable for a premium UK orthopaedic knee clinic's patient blog and social media platforms (Lincolnshire Knee Clinic).
Style: Real-world, true-to-life colours and textures — like a professional healthcare stock photo or a clean, flat 2D medical illustration. Flat 2D image only.
Strictly avoid: 3D renders, glowing/neon/holographic effects, CGI, digital-art or sci-fi styles. This must look like an actual photograph or a plain patient-education-handout-style diagram, never a stylised render.
Text and labels: Do NOT render any text, words, letters, numbers, labels, captions, arrows-with-text, or annotations anywhere in the image — this includes anatomical labels, incidental background text on wall signs, posters, clothing, or screens. Leave any wall signs, posters, or screens blank or angled away rather than adding text to them. AI image generation cannot reliably render accurate text, and an incorrect or misspelled word anywhere in the image is worse than no text at all. If the subject is anatomical, depict the structures clearly and accurately through shape, position, and colour alone, completely unlabeled — the caption elsewhere on the page will explain what's shown.
The one exception: if it fits naturally into the scene (e.g. a small wall sign, logo, or corner watermark), you may render the short clinic name "Lincolnshire Knee Clinic" — and only that exact phrase, nothing else. Keep it small, simple, and unobtrusive; do not force it in if there's no natural place for it.
Visual theme: Reassuring, professional, and directly relevant to orthopaedic knee care, patient recovery, joint anatomy, or physical rehabilitation. Do not depict any real, identifiable person's face.
Adhere strictly to the requested brief below — depict exactly the scene described.

Subject to depict: ${prompt.trim()}`;

    // Try Imagen 3 first as it is the state-of-the-art text-to-image model
    try {
      console.log("[Image Gen API] Attempting image generation with imagen-3.0-generate-002");
      const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" });
      const result = await model.generateContent(cleanBriefPrompt);
      const parts = result.response.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p: any) => p.inlineData?.data);
      if (imagePart?.inlineData?.data) {
        imageBase64 = imagePart.inlineData.data;
        mimeType = imagePart.inlineData.mimeType || "image/png";
        console.log("[Image Gen API] Successfully generated image using imagen-3.0-generate-002");
      }
    } catch (err) {
      console.warn("[Image Gen API] imagen-3.0-generate-002 failed or not supported, falling back to gemini-2.5-flash-image:", err);
    }

    // Fallback to gemini-2.5-flash-image if Imagen 3 failed
    if (!imageBase64) {
      try {
        console.log("[Image Gen API] Attempting image generation with fallback gemini-2.5-flash-image");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const result = await model.generateContent(cleanBriefPrompt);
        const parts = result.response.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find((p: any) => p.inlineData?.data);
        if (imagePart?.inlineData?.data) {
          imageBase64 = imagePart.inlineData.data;
          mimeType = imagePart.inlineData.mimeType || "image/png";
          console.log("[Image Gen API] Successfully generated image using gemini-2.5-flash-image");
        }
      } catch (err: any) {
        console.error("[Image Gen API] Fallback model also failed:", err);
        return NextResponse.json(
          { success: false, error: `Image generation failed: ${err.message || "Unknown error"}` },
          { status: 502 }
        );
      }
    }

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "The AI did not return an image for this description. Try rewording it or use Upload/Paste URL instead." },
        { status: 502 }
      );
    }

    const extension = mimeType.split("/")[1] || "png";
    const buffer = Buffer.from(imageBase64, "base64");
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
