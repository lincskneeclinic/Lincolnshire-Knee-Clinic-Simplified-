import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isSupabaseConfigured, unsubscribeContactInSupabase } from "@/lib/supabase";
import { isBrevoConfigured, unsubscribeContactInBrevo } from "@/lib/brevo";

const NEWSLETTER_DB_PATH = path.join(process.cwd(), "data", "newsletter-subscribers.json");

function readSubscribers(): any[] {
  try {
    if (!fs.existsSync(NEWSLETTER_DB_PATH)) return [];
    const content = fs.readFileSync(NEWSLETTER_DB_PATH, "utf8");
    return JSON.parse(content || "[]");
  } catch (error) {
    return [];
  }
}

function writeSubscribers(subscribers: any[]): boolean {
  try {
    const dir = path.dirname(NEWSLETTER_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(NEWSLETTER_DB_PATH, JSON.stringify(subscribers, null, 2), "utf8");
    return true;
  } catch (error) {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 1. Unsubscribe in Supabase if configured
    let unsubscribedInSupabase = false;
    if (isSupabaseConfigured()) {
      unsubscribedInSupabase = await unsubscribeContactInSupabase(cleanEmail);
    }

    // 2. Unsubscribe in Brevo if configured
    let unsubscribedInBrevo = false;
    if (isBrevoConfigured()) {
      unsubscribedInBrevo = await unsubscribeContactInBrevo(cleanEmail);
    }

    // 3. Fallback/Local File unsubscribe
    const localSubscribers = readSubscribers();
    const existingIndex = localSubscribers.findIndex(
      (sub: any) => sub.email && sub.email.toLowerCase() === cleanEmail
    );
    if (existingIndex >= 0) {
      localSubscribers[existingIndex].marketingConsent = false;
      writeSubscribers(localSubscribers);
    }

    return NextResponse.json({
      success: true,
      message: "You have been successfully unsubscribed from Lincolnshire Knee Clinic newsletter updates.",
      supabaseUnsubscribed: unsubscribedInSupabase,
      brevoUnsubscribed: unsubscribedInBrevo,
    });
  } catch (error) {
    console.error("Error processing unsubscribe request:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
