import { NextResponse } from "next/server";
import { getStoreValue, setStoreValue } from "@/lib/dataStore";

const EVENTS_KEY = "event-counters";
const DEFAULT_COUNTERS = { call_now: 0, book_appointment: 0, whatsapp_click: 0 };

async function readEventCounters(): Promise<Record<string, number>> {
  return getStoreValue(EVENTS_KEY, DEFAULT_COUNTERS);
}

async function writeEventCounters(counters: Record<string, number>): Promise<boolean> {
  return setStoreValue(EVENTS_KEY, counters);
}

export async function GET() {
  const events = await readEventCounters();
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

    const counters = await readEventCounters();
    counters[eventType] = (counters[eventType] || 0) + 1;

    await writeEventCounters(counters);

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
