import { NextResponse } from "next/server";
import { submitPipelineReview } from "@/lib/contentPipeline";
import { MIN_BLOG_BODY_LENGTH } from "@/lib/contentPipelineConstants";

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

    if (!decision || !["approved", "edited", "revision_requested", "revert_to_blog", "revert_to_social", "save_progress"].includes(decision)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing 'decision'. Must be 'approved', 'edited', 'revision_requested', 'revert_to_blog', 'revert_to_social', or 'save_progress'." },
        { status: 400 }
      );
    }

    if (decision === "revision_requested" && (!revisionNotes || !revisionNotes.trim())) {
      return NextResponse.json(
        { success: false, error: "Revision notes are required when requesting a revision." },
        { status: 400 }
      );
    }

    if (stage === "blog" && decision === "edited") {
      const bodyText: string = (editedContent?.body_markdown || editedContent?.body || "").trim();
      if (bodyText.length < MIN_BLOG_BODY_LENGTH) {
        return NextResponse.json(
          {
            success: false,
            error: `Blog draft body is empty or too short to approve (minimum ${MIN_BLOG_BODY_LENGTH} characters required).`,
          },
          { status: 400 }
        );
      }
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
