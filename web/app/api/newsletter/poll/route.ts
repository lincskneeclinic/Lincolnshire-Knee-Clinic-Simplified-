import { NextResponse } from "next/server";
import { getStoreValue, setStoreValue } from "@/lib/dataStore";

const POLL_KEY = "newsletter-poll";
const DEFAULT_POLL = {
  votes: {} as Record<string, number>,
  suggestions: [] as { text: string; date: string }[],
};

async function readPollData() {
  return getStoreValue(POLL_KEY, DEFAULT_POLL);
}

async function writePollData(data: typeof DEFAULT_POLL) {
  return setStoreValue(POLL_KEY, data);
}

export async function GET() {
  const data = await readPollData();
  return NextResponse.json({ success: true, poll: data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { option, customSuggestion } = body;

    const data = await readPollData();

    if (option) {
      data.votes[option] = (data.votes[option] || 0) + 1;
    }

    if (customSuggestion && customSuggestion.trim()) {
      data.suggestions.unshift({
        text: customSuggestion.trim(),
        date: new Date().toISOString().split("T")[0],
      });
    }

    await writePollData(data);

    return NextResponse.json({
      success: true,
      message: "Thank you for voting! Your feedback helps us shape future clinical newsletters.",
      poll: data,
    });
  } catch (error) {
    console.error("Poll submission error:", error);
    return NextResponse.json({ success: false, error: "An error occurred while processing your request." }, { status: 500 });
  }
}
