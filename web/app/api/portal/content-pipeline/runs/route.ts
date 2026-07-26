import { NextResponse } from "next/server";
import { getPipelineRuns } from "@/lib/contentPipeline";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") || undefined;

    const runs = await getPipelineRuns(statusParam);

    return NextResponse.json({
      success: true,
      runs
    });
  } catch (error: any) {
    console.error("Error in GET /api/portal/content-pipeline/runs:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch runs" },
      { status: 500 }
    );
  }
}
