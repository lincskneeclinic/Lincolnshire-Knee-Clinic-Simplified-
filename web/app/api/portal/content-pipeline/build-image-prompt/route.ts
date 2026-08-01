import { NextResponse } from "next/server";
import {
  buildImagePrompt,
  MissingReferenceDocError,
  type ImageContextHints,
  type ImageFormat,
  type ImageStyle,
} from "@/lib/medicalImagePrompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const hints: ImageContextHints = {
      pageTitle: body.pageTitle,
      pageCategory: body.pageCategory,
      sectionHeading: body.sectionHeading,
      imageTitle: body.imageTitle,
      altText: body.altText,
      placeholderLabel: body.placeholderLabel,
      topic: body.topic,
    };
    const format: ImageFormat = body.format || "desktop";
    const transparentBackground: boolean = !!body.transparentBackground;
    const style: ImageStyle | undefined = body.style === "photo" || body.style === "illustration" ? body.style : undefined;

    const built = buildImagePrompt(hints, format, transparentBackground, style);

    return NextResponse.json({ success: true, ...built, detectedContext: hints });
  } catch (error: any) {
    if (error instanceof MissingReferenceDocError) {
      return NextResponse.json(
        {
          success: false,
          error: `Image generation is stopped: required reference document is missing — ${error.filePath}`,
        },
        { status: 500 }
      );
    }
    console.error("Error in POST /api/portal/content-pipeline/build-image-prompt:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to build the image prompt" },
      { status: 500 }
    );
  }
}
