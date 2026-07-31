import { NextResponse } from "next/server";
import { writeSocialCaptions } from "@/lib/socialWriterAgent";
import { createSocialOnlyPost } from "@/lib/socialOnlyPosts";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "A topic is required." },
        { status: 400 }
      );
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
