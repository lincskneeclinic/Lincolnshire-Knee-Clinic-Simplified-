import { NextResponse } from "next/server";
import { createPendingPipelineRun, runPipelineGeneration } from "@/lib/contentPipeline";

// The PubMed research + Gemini drafting steps can take well over a minute — long
// enough that Hostinger's (and most hosts') reverse-proxy request timeout kills the
// connection before it finishes, even though the Node process itself is still working.
// So this route creates the run immediately and returns, then keeps generating it in
// the background (unawaited) on the same persistent Node process. The dashboard polls
// /api/portal/content-pipeline/runs/[runId] until the run leaves "researching"/
// "writing_blog" status.
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

    const pendingRun = await createPendingPipelineRun(topic);

    // Deliberately not awaited — see comment above.
    runPipelineGeneration(pendingRun).catch((err) => {
      console.error("Background pipeline generation failed:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Content automation run started.",
      run: pendingRun
    });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/trigger:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to trigger content pipeline run" },
      { status: 500 }
    );
  }
}
