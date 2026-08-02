import { NextResponse } from "next/server";
import { subscribeToTopic } from "@/lib/topicNotify";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topicId, email } = body as { topicId?: string; email?: string };

    if (!topicId || typeof topicId !== "string") {
      return NextResponse.json({ success: false, error: "Missing topic." }, { status: 400 });
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
    }

    const result = await subscribeToTopic(topicId, email);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Topic notify subscribe error:", error);
    return NextResponse.json({ success: false, error: "Failed to save your subscription." }, { status: 500 });
  }
}
