import { NextResponse } from "next/server";
import { getPipelineRunDetail } from "@/lib/contentPipeline";
import { reviseTextSelection } from "@/lib/blogWriterAgent";

export const maxDuration = 60;

// Rewrites one highlighted passage from a blog/technical article draft rather
// than the whole document — lets a reviewer act on a single "[NEEDS CLINICAL
// REVIEW]" flag (or any other targeted concern) by selecting the relevant
// paragraph and describing what needs to change, instead of requesting a full
// regeneration. The caller splices the returned text back into the editor at
// the same position; nothing is saved server-side until the reviewer approves
// the draft as usual.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const body = await request.json();
    const { isArticle, selectedText, instruction } = body as {
      isArticle?: boolean;
      selectedText?: string;
      instruction?: string;
    };

    if (!selectedText || typeof selectedText !== "string" || !selectedText.trim()) {
      return NextResponse.json({ success: false, error: "No text was selected to revise." }, { status: 400 });
    }
    if (!instruction || typeof instruction !== "string" || !instruction.trim()) {
      return NextResponse.json({ success: false, error: "An instruction is required." }, { status: 400 });
    }

    const { run } = await getPipelineRunDetail(runId);
    if (!run) {
      return NextResponse.json({ success: false, error: "Run not found." }, { status: 404 });
    }

    const draft = run.blog_drafts?.[0];
    const documentTitle = (isArticle ? draft?.article_title : draft?.title) || run.topic;

    const revisedText = await reviseTextSelection(run.topic, documentTitle, selectedText.trim(), instruction.trim());

    return NextResponse.json({ success: true, revisedText });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/runs/:runId/revise-selection:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to revise the selected text" },
      { status: 500 }
    );
  }
}
