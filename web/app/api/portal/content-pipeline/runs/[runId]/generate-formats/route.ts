import { NextResponse } from "next/server";
import { backfillMissingSocialFormats } from "@/lib/contentPipeline";

export const maxDuration = 60; // Allow time for Gemini AI social caption generation

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const run = await backfillMissingSocialFormats(runId);
    return NextResponse.json({ success: true, run });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/runs/:runId/generate-formats:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate the missing social formats" },
      { status: 500 }
    );
  }
}
