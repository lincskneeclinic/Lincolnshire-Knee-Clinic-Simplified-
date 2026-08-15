import { NextResponse } from "next/server";
import { writeSocialCaptions } from "@/lib/socialWriterAgent";
import { createSocialOnlyPost, SocialOnlyPost } from "@/lib/socialOnlyPosts";

// A batch of 5-7 topics each involve a full Gemini generation call, so this
// needs more headroom than the single-topic path; kept well under the portal's
// 5-minute client poll cap referenced elsewhere in the pipeline.
export const maxDuration = 280;

const MAX_BATCH_SIZE = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawTopics: unknown = Array.isArray(body?.topics) ? body.topics : body?.topic;

    const topics = (Array.isArray(rawTopics) ? rawTopics : [rawTopics])
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.trim());

    if (topics.length === 0) {
      return NextResponse.json({ success: false, error: "At least one topic is required." }, { status: 400 });
    }
    if (topics.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { success: false, error: `Please generate ${MAX_BATCH_SIZE} topics or fewer at a time.` },
        { status: 400 }
      );
    }

    // Sequential, not parallel — this is a batch of full Gemini calls, and
    // running them one at a time avoids tripping API rate limits that
    // generateContentWithRetry's backoff is meant for occasional 429s/503s,
    // not a burst of simultaneous requests.
    const posts: SocialOnlyPost[] = [];
    const failures: Array<{ topic: string; error: string }> = [];
    for (const topic of topics) {
      try {
        const captions = await writeSocialCaptions(topic);
        const post = await createSocialOnlyPost(topic, captions);
        posts.push(post);
      } catch (err: any) {
        failures.push({ topic, error: err?.message || "Failed to generate this topic." });
      }
    }

    if (posts.length === 0) {
      return NextResponse.json(
        { success: false, error: failures[0]?.error || "Failed to generate social posts" },
        { status: 500 }
      );
    }

    // Keep the single-topic response shape (`post`) working for existing callers.
    return NextResponse.json({ success: true, post: posts[0], posts, failures });
  } catch (error: any) {
    console.error("Error in POST /api/portal/social-only/generate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate social posts" },
      { status: 500 }
    );
  }
}
