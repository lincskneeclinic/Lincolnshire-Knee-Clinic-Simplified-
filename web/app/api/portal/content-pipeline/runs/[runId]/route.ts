import { NextResponse } from "next/server";
import { getPipelineRunDetail, deletePipelineRun } from "@/lib/contentPipeline";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const resolvedParams = await params;
    const runId = resolvedParams.runId;

    const { run, reviews } = await getPipelineRunDetail(runId);

    if (!run) {
      return NextResponse.json(
        { success: false, error: `Run with ID '${runId}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      run,
      reviews
    });
  } catch (error: any) {
    console.error("Error in GET /api/portal/content-pipeline/runs/:runId:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch run details" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    await deletePipelineRun(runId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/portal/content-pipeline/runs/:runId:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete run" },
      { status: 500 }
    );
  }
}
