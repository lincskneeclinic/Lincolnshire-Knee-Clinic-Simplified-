import { NextResponse } from "next/server";
import { writeSocialCaptions } from "@/lib/socialWriterAgent";
import { createSocialOnlyPost } from "@/lib/socialOnlyPosts";
import { createPendingPipelineRun, runPipelineGeneration } from "@/lib/contentPipeline";

export const maxDuration = 60;

// One topic per request, deliberately — batch generation (PipelineTab's
// "Batch (Week's Worth)") loops this endpoint client-side rather than
// looping topics inside a single request here. An earlier version generated
// a whole batch in one request/response cycle, and real-world testing showed
// Hostinger's reverse proxy in front of this app cuts a request off (and
// returns its own HTML error page, not JSON) well before 5 sequential full
// AI generations finish. Looping client-side keeps each request as fast as
// this single-topic path already reliably is.
export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ success: false, error: "A topic is required." }, { status: 400 });
    }

    // Standalone social posts had no landing page for anyone who wanted more
    // than the caption — every topic now also gets a real companion blog
    // article, going through the same Content Pipeline clinical review as a
    // manually-triggered run. createPendingPipelineRun just writes the pending
    // row; runPipelineGeneration is deliberately unawaited (same reasoning as
    // the standalone /trigger route) so this request stays as fast as the
    // caption generation alone. Best-effort: a failure here still lets the
    // social captions through, just without a linked article.
    let linkedPipelineRunId: string | undefined;
    try {
      const pendingRun = await createPendingPipelineRun(topic.trim(), "social_batch");
      linkedPipelineRunId = pendingRun.run_id;
      runPipelineGeneration(pendingRun).catch((err) => {
        console.error("Background companion-article generation failed:", err);
      });
    } catch (err) {
      console.error("Failed to trigger companion article for social post:", err);
    }

    const captions = await writeSocialCaptions(topic.trim());
    const post = await createSocialOnlyPost(topic.trim(), captions, linkedPipelineRunId);

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error("Error in POST /api/portal/social-only/generate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate social posts" },
      { status: 500 }
    );
  }
}
