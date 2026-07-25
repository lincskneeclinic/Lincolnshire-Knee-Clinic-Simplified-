import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const POLL_DATA_PATH = path.join(process.cwd(), "data", "newsletter-poll.json");

function readPollData() {
  try {
    if (!fs.existsSync(POLL_DATA_PATH)) {
      return {
        votes: {
          "Cartilage Repair vs Microfracture": 24,
          "Post-Op Swelling & Ice Therapy Protocol": 31,
          "Hydrogel vs Corticosteroid Injection Longevity": 42,
          "Returning to Golf & Tennis After Knee Replacement": 19,
        },
        suggestions: [
          { text: "Can I get Arthrosamid on both knees in the same session?", date: "2026-07-22" },
          { text: "What exercises should I do while waiting for partial knee replacement surgery?", date: "2026-07-20" },
          { text: "How soon can I fly long-haul after ACL reconstruction?", date: "2026-07-18" },
        ],
      };
    }
    return JSON.parse(fs.readFileSync(POLL_DATA_PATH, "utf8") || "{}");
  } catch (error) {
    return { votes: {}, suggestions: [] };
  }
}

function writePollData(data: any) {
  try {
    fs.writeFileSync(POLL_DATA_PATH, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    return false;
  }
}

export async function GET() {
  const data = readPollData();
  return NextResponse.json({ success: true, poll: data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { option, customSuggestion } = body;

    const data = readPollData();

    if (option) {
      data.votes[option] = (data.votes[option] || 0) + 1;
    }

    if (customSuggestion && customSuggestion.trim()) {
      data.suggestions.unshift({
        text: customSuggestion.trim(),
        date: new Date().toISOString().split("T")[0],
      });
    }

    writePollData(data);

    return NextResponse.json({
      success: true,
      message: "Thank you for voting! Your feedback helps us shape future clinical newsletters.",
      poll: data,
    });
  } catch (error: any) {
    console.error("Poll submission error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
