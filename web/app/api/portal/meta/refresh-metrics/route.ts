import { NextResponse } from "next/server";
import { fetchAndStoreMetrics, getAccountAverageEngagementRate, PostSourceType } from "@/lib/metaPostMetrics";
import { MetaPlatform } from "@/lib/metaAccounts";
import { analyzePostPerformance } from "@/lib/socialPerformanceAgent";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceType, sourceId, platform, postType, caption } = body;

    if (sourceType !== "pipeline" && sourceType !== "social_only") {
      return NextResponse.json({ success: false, error: "Invalid sourceType." }, { status: 400 });
    }
    if (!sourceId || typeof sourceId !== "string") {
      return NextResponse.json({ success: false, error: "sourceId is required." }, { status: 400 });
    }
    if (platform !== "facebook" && platform !== "instagram") {
      return NextResponse.json({ success: false, error: "Invalid platform." }, { status: 400 });
    }
    if (!postType || typeof postType !== "string") {
      return NextResponse.json({ success: false, error: "postType is required." }, { status: 400 });
    }

    const metrics = await fetchAndStoreMetrics(sourceType as PostSourceType, sourceId, platform as MetaPlatform, postType);
    const { average, sampleSize } = await getAccountAverageEngagementRate(
      platform as MetaPlatform,
      postType,
      metrics.media_id
    );

    const performance = await analyzePostPerformance({
      caption: typeof caption === "string" ? caption : "",
      platform: platform as "facebook" | "instagram",
      postType,
      metrics,
      accountAverageEngagementRate: average,
      sampleSize,
    });

    return NextResponse.json({ success: true, metrics, performance });
  } catch (error) {
    console.error("Meta refresh-metrics error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 200 });
  }
}
