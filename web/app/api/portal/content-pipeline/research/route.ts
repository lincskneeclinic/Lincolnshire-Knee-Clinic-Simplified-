import { NextResponse } from "next/server";
import { performResearchProcess } from "@/lib/researchAgent";
import { getPipelineRunDetail, triggerPipelineRun, ContentPipelineRun } from "@/lib/contentPipeline";
import path from "path";
import fs from "fs";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !url.startsWith("http")) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export const maxDuration = 60; // Allow 60s for PubMed Entrez API and Gemini AI synthesis

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, runId } = body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'topic' string in request body." },
        { status: 400 }
      );
    }

    const selectedTopic = topic.trim();

    // Perform research process (web scan + PubMed NCBI Entrez E-utilities)
    const researchBrief = await performResearchProcess(selectedTopic);

    let targetRun: ContentPipelineRun | null = null;

    if (runId && typeof runId === "string") {
      const { run } = await getPipelineRunDetail(runId);
      if (run) {
        run.research_brief = researchBrief as any;
        run.updated_at = new Date().toISOString();
        targetRun = run;

        // Sync to Supabase
        const config = getSupabaseConfig();
        if (config) {
          try {
            const endpoint = `${config.url}/rest/v1/content_pipeline_runs?run_id=eq.${encodeURIComponent(run.run_id)}`;
            await fetch(endpoint, {
              method: "PATCH",
              headers: {
                apikey: config.key,
                Authorization: `Bearer ${config.key}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal",
              },
              body: JSON.stringify({
                research_brief: researchBrief,
                updated_at: run.updated_at,
              }),
            });
          } catch (err) {
            console.error("Error updating research_brief in Supabase:", err);
          }
        }
      }
    }

    if (!targetRun) {
      // Create new run using the research brief
      targetRun = await triggerPipelineRun(selectedTopic);
      targetRun.research_brief = researchBrief as any;
    }

    return NextResponse.json({
      success: true,
      message: `Stage 1 Research completed for topic: "${selectedTopic}"`,
      run: targetRun,
      research_brief: researchBrief,
    });
  } catch (error: any) {
    console.error("Error in POST /api/portal/content-pipeline/research:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute Stage 1 Research process" },
      { status: 500 }
    );
  }
}
