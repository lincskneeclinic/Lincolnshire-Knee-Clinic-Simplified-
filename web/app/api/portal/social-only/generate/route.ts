import { NextResponse } from "next/server";
import { writeSocialCaptions } from "@/lib/socialWriterAgent";
import { createSocialOnlyPost } from "@/lib/socialOnlyPosts";

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

    const captions = await writeSocialCaptions(topic.trim());
    const post = await createSocialOnlyPost(topic.trim(), captions);

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error("Error in POST /api/portal/social-only/generate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate social posts" },
      { status: 500 }
    );
  }
}
