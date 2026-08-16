import { NextResponse } from "next/server";
import { getPipelineRunDetail } from "@/lib/contentPipeline";
import { resolveClinicalFlag } from "@/lib/blogWriterAgent";

export const maxDuration = 60;

// Resolves one "[NEEDS CLINICAL REVIEW]" flag directly from the flags list —
// either lets the AI answer it using clinical judgement, or takes the
// reviewer's own decision and writes it up as proper prose. The client
// locates the flag's exact text in its current edit buffer and replaces it
// with whatever this returns; nothing is saved server-side here.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const body = await request.json();
    const { isArticle, flagText, precedingContext, reviewerDecision } = body as {
      isArticle?: boolean;
      flagText?: string;
      precedingContext?: string;
      reviewerDecision?: string;
    };

    if (!flagText || typeof flagText !== "string" || !flagText.trim()) {
      return NextResponse.json({ success: false, error: "No flag text was provided." }, { status: 400 });
    }

    const { run } = await getPipelineRunDetail(runId);
    if (!run) {
      return NextResponse.json({ success: false, error: "Run not found." }, { status: 404 });
    }

    const draft = run.blog_drafts?.[0];
    const documentTitle = (isArticle ? draft?.article_title : draft?.title) || run.topic;

    const resolvedText = await resolveClinicalFlag(
      run.topic,
      documentTitle,
      flagText.trim(),
      typeof precedingContext === "string" ? precedingContext : "",
      reviewerDecision && reviewerDecision.trim() ? reviewerDecision.trim() : undefined
    );

    return NextResponse.json({ success: true, resolvedText });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/runs/:runId/resolve-flag:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resolve the clinical review flag" },
      { status: 500 }
    );
  }
}
