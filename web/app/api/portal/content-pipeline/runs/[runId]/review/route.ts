import { NextResponse } from "next/server";
import { submitPipelineReview } from "@/lib/contentPipeline";

export const maxDuration = 60; // Allow 60s for Gemini AI social caption generation

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const resolvedParams = await params;
    const runId = resolvedParams.runId;

    const body = await request.json();
    const { stage, platform, decision, editedContent, revisionNotes } = body;

    if (!stage || !["blog", "social"].includes(stage)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing 'stage'. Must be 'blog' or 'social'." },
        { status: 400 }
      );
    }

    if (platform && !["instagram", "facebook", "linkedin"].includes(platform)) {
      return NextResponse.json(
        { success: false, error: "Invalid 'platform'. Must be 'instagram', 'facebook', or 'linkedin'." },
        { status: 400 }
      );
    }

    if (!decision || !["approved", "edited", "revision_requested"].includes(decision)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing 'decision'. Must be 'approved', 'edited', or 'revision_requested'." },
        { status: 400 }
      );
    }

    if (decision === "revision_requested" && (!revisionNotes || !revisionNotes.trim())) {
      return NextResponse.json(
        { success: false, error: "Revision notes are required when requesting a revision." },
        { status: 400 }
      );
    }

    const result = await submitPipelineReview(runId, {
      stage,
      platform,
      decision,
      editedContent,
      revisionNotes
    });

    return NextResponse.json({
      success: true,
      run: result.run,
      review: result.review
    });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/runs/:runId/review:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit review decision" },
      { status: 500 }
    );
  }
}
