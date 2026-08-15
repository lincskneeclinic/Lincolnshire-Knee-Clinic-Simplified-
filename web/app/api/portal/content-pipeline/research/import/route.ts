import { NextResponse } from "next/server";
import { createPendingPipelineRun, runPipelineGeneration, ResearchBrief } from "@/lib/contentPipeline";

// Accepts a ResearchBrief that was researched externally — typically produced by a
// human running the lincoln-knee-clinic-blog-research skill in a Claude Code session
// (see .claude/skills/lincoln-knee-clinic-blog-research/SKILL.md), which writes a
// research-brief.json file meant to be pasted/uploaded here. This skips Stage 1
// (performResearchProcess) entirely and hands the supplied brief straight into Stage 2
// blog drafting, then proceeds through the existing review/approval flow unchanged.
//
// Same fire-and-forget pattern as /trigger — drafting can take over a minute, longer
// than most reverse-proxy timeouts, so the run is created and returned immediately and
// generation continues in the background. The dashboard polls
// /api/portal/content-pipeline/runs/[runId] for status.

function isValidResearchBrief(value: any): value is ResearchBrief {
  if (!value || typeof value !== "object") return false;
  if (typeof value.summary !== "string" || !value.summary.trim()) return false;
  if (!Array.isArray(value.key_points) || !value.key_points.every((p: any) => typeof p === "string")) return false;
  if (!Array.isArray(value.sources) || !value.sources.every((s: any) => typeof s === "string")) return false;
  if (typeof value.target_audience !== "string" || !value.target_audience.trim()) return false;
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, researchBrief } = body || {};

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'topic' string in request body." },
        { status: 400 }
      );
    }

    if (!isValidResearchBrief(researchBrief)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing or invalid 'researchBrief'. Required: summary (string), key_points (string[]), sources (string[]), target_audience (string).",
        },
        { status: 400 }
      );
    }

    const brief: ResearchBrief = { ...researchBrief, source_method: "manual_skill_import" };

    const pendingRun = await createPendingPipelineRun(topic.trim(), "manual_research_import");

    // Deliberately not awaited — see comment above.
    runPipelineGeneration(pendingRun, brief).catch((err) => {
      console.error("Background pipeline generation (manual research import) failed:", err);
    });

    return NextResponse.json({
      success: true,
      message: `Imported research brief for topic: "${topic.trim()}". Drafting started.`,
      run: pendingRun,
    });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/research/import:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to import research brief" },
      { status: 500 }
    );
  }
}
