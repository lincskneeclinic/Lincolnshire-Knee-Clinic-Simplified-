import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const EVENTS_DB_PATH = path.join(process.cwd(), "data", "event-counters.json");

function readEventCounters(): Record<string, number> {
  try {
    if (!fs.existsSync(EVENTS_DB_PATH)) {
      return { call_now: 0, book_appointment: 0, whatsapp_click: 0 };
    }
    const content = fs.readFileSync(EVENTS_DB_PATH, "utf8");
    return JSON.parse(content || "{}");
  } catch (error) {
    console.error("Failed to read event counters:", error);
    return { call_now: 0, book_appointment: 0, whatsapp_click: 0 };
  }
}

function writeEventCounters(counters: Record<string, number>): boolean {
  try {
    const dir = path.dirname(EVENTS_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(EVENTS_DB_PATH, JSON.stringify(counters, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Failed to write event counters:", error);
    return false;
  }
}

export async function GET() {
  const events = readEventCounters();
  return NextResponse.json({ success: true, events });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventType } = body;

    const allowedEvents = ["call_now", "book_appointment", "whatsapp_click"];
    if (!eventType || typeof eventType !== "string" || !allowedEvents.includes(eventType)) {
      return NextResponse.json(
        { success: false, message: "Invalid eventType specified." },
        { status: 400 }
      );
    }

    const counters = readEventCounters();
    counters[eventType] = (counters[eventType] || 0) + 1;

    writeEventCounters(counters);

    return NextResponse.json({
      success: true,
      message: `Event '${eventType}' recorded successfully.`,
      count: counters[eventType],
    });
  } catch (error) {
    console.error("Error recording click event:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
