import { NextResponse } from "next/server";
import { triggerPipelineRun } from "@/lib/contentPipeline";

export const maxDuration = 60; // Allow 60s for PubMed literature fetching and Gemini AI content drafting

export async function POST(request: Request) {
  try {
    let topic: string | undefined = undefined;

    try {
      const body = await request.json();
      if (body && typeof body.topic === "string") {
        topic = body.topic.trim();
      }
    } catch {
      // Body optional
    }

    const newRun = await triggerPipelineRun(topic);

    return NextResponse.json({
      success: true,
      message: "Content automation run successfully started.",
      run: newRun
    });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/trigger:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to trigger content pipeline run" },
      { status: 500 }
    );
  }
}
