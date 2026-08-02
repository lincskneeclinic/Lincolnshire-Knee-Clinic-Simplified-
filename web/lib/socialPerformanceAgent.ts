import { GoogleGenerativeAI } from "@google/generative-ai";
import { PostMetricsSnapshot } from "@/lib/metaPostMetrics";

export interface SocialPerformanceResult {
  /**
   * 0-100, computed in code from the real engagement rate vs. this account's
   * own trailing average for this post type — never invented by the AI. 50 =
   * exactly average, 100 = double the account's average or better, 0 = no
   * engagement. This is the "real algorithm score": grounded in actual Graph
   * API numbers, not a guess.
   */
  score: number;
  assessment: string;
  suggestions: string[];
}

function computeScore(engagementRate: number | null, accountAverage: number | null): number {
  if (engagementRate === null) return 0;
  if (!accountAverage || accountAverage <= 0) return 50; // not enough account history yet to benchmark against
  const ratio = engagementRate / accountAverage;
  return Math.max(0, Math.min(100, Math.round(ratio * 50)));
}

/**
 * Explains a post's REAL performance numbers (fetched from the Meta Graph API,
 * not estimated) and suggests concrete improvements. The score itself is a
 * deterministic calculation, not an AI guess — the model's job is only to
 * interpret and explain the real numbers it's given, grounded strictly in
 * what's provided, never inventing platform behavior it can't verify.
 */
export async function analyzePostPerformance(params: {
  caption: string;
  platform: "instagram" | "facebook";
  postType: string;
  metrics: PostMetricsSnapshot;
  accountAverageEngagementRate: number | null;
  sampleSize: number;
}): Promise<SocialPerformanceResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const score = computeScore(params.metrics.engagement_rate, params.accountAverageEngagementRate);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: `You are a social media performance analyst for Lincolnshire Knee Clinic. You are given REAL, ALREADY-MEASURED performance numbers for one published post, pulled directly from the Instagram/Facebook Graph API — not estimates. Your job is to explain what these real numbers mean and suggest concrete improvements for future posts of this type.

Rules:
- Only reason about the numbers you are given. Do not claim to know the platform's actual ranking algorithm, do not invent engagement thresholds, and do not cite external benchmarks you cannot verify.
- If the account has fewer than 3 prior posts of this type to compare against, say plainly that there isn't enough history yet for a meaningful comparison, and keep suggestions general (clear hook, strong CTA, caption length, hashtag relevance) rather than claiming a specific number is "low" or "high".
- Ground every suggestion in the specific metric it addresses (e.g. "comments are below your account average for this post type — try ending the caption with a direct question").
- Keep the tone practical and specific to a medical clinic's audience — not generic marketing fluff.

You MUST output strictly as valid JSON matching this schema:
{
  "assessment": "1-2 sentence plain-English summary of how this post performed relative to the account's own history.",
  "suggestions": ["specific, concrete suggestion tied to a real metric", "..."]
}`,
  });

  const m = params.metrics;
  const userPrompt = `Platform: ${params.platform}
Post type: ${params.postType}
Caption: ${params.caption}

REAL MEASURED METRICS FOR THIS POST:
- Reach: ${m.reach ?? "not available"}
- Views: ${m.views ?? "not available"}
- Likes: ${m.likes ?? "not available"}
- Comments: ${m.comments ?? "not available"}
- Shares: ${m.shares ?? "not available"}
- Saves: ${m.saves ?? "not available"}
- Engagement rate: ${m.engagement_rate !== null ? `${m.engagement_rate}%` : "not available"}

ACCOUNT'S OWN TRAILING AVERAGE ENGAGEMENT RATE FOR THIS POST TYPE: ${
    params.accountAverageEngagementRate !== null ? `${params.accountAverageEngagementRate}%` : "no prior history"
  } (based on ${params.sampleSize} prior post${params.sampleSize === 1 ? "" : "s"})

Computed score (0-100, already calculated, do not recompute or restate as your own estimate): ${score}

Explain this performance and give real-data-grounded suggestions. Return the JSON now.`;

  const result = await model.generateContent(userPrompt);
  let rawText = result.response.text() || "";
  rawText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

  const aiData = JSON.parse(rawText);

  return {
    score,
    assessment:
      typeof aiData.assessment === "string" && aiData.assessment ? aiData.assessment : "Performance analysis completed.",
    suggestions: Array.isArray(aiData.suggestions) ? aiData.suggestions.filter((s: unknown) => typeof s === "string") : [],
  };
}
