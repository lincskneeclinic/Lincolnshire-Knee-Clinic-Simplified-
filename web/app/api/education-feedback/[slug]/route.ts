import { NextResponse } from "next/server";
import { getStoreValue, setStoreValue } from "@/lib/dataStore";

export interface ArticleFeedbackEntry {
  up: number;
  down: number;
  comments: { text: string; date: string }[];
}

const FEEDBACK_KEY = "article-feedback";
const DEFAULT_ENTRY: ArticleFeedbackEntry = { up: 0, down: 0, comments: [] };

async function readFeedback(): Promise<Record<string, ArticleFeedbackEntry>> {
  return getStoreValue<Record<string, ArticleFeedbackEntry>>(FEEDBACK_KEY, {});
}

async function writeFeedback(data: Record<string, ArticleFeedbackEntry>): Promise<void> {
  await setStoreValue(FEEDBACK_KEY, data);
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ success: false, error: "slug is required" }, { status: 400 });
    }

    const body = await request.json();
    const { helpful, comment } = body as { helpful?: boolean; comment?: string };

    if (typeof helpful !== "boolean") {
      return NextResponse.json({ success: false, error: "helpful (boolean) is required" }, { status: 400 });
    }

    const feedback = await readFeedback();
    const entry: ArticleFeedbackEntry = feedback[slug] ? { ...feedback[slug] } : { ...DEFAULT_ENTRY, comments: [] };

    if (helpful) {
      entry.up += 1;
    } else {
      entry.down += 1;
      if (typeof comment === "string" && comment.trim()) {
        entry.comments = [{ text: comment.trim().slice(0, 500), date: new Date().toISOString().split("T")[0] }, ...entry.comments];
      }
    }

    feedback[slug] = entry;
    await writeFeedback(feedback);

    return NextResponse.json({ success: true, up: entry.up, down: entry.down });
  } catch (error) {
    console.error("Article feedback error:", error);
    return NextResponse.json({ success: false, error: "Failed to record feedback." }, { status: 500 });
  }
}
