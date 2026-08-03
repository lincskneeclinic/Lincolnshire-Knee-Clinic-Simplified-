import { NextResponse } from "next/server";
import { getPipelineRunDetail } from "@/lib/contentPipeline";
import { sendContentPipelineNotificationEmail } from "@/lib/graphMail";

// Re-sends the "draft ready for review" email for an existing run, without
// regenerating anything — useful for verifying the notification itself
// (recipients, formatting) without creating a new pipeline run each time.
export async function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  try {
    const { runId } = await params;
    const body = await request.json().catch(() => ({}));
    const stage: "blog" | "social" = body?.stage === "social" ? "social" : "blog";

    const { run } = await getPipelineRunDetail(runId);
    if (!run) {
      return NextResponse.json({ success: false, error: `Run with ID '${runId}' not found.` }, { status: 404 });
    }

    const result = await sendContentPipelineNotificationEmail(run, stage);
    return NextResponse.json({ success: true, sent: result.success, sendError: result.error });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/runs/:runId/resend-notification:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to resend notification" }, { status: 500 });
  }
}
