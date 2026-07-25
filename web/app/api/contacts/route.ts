import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isSupabaseConfigured, saveContactToSupabase } from "@/lib/supabase";

const NEWSLETTER_DB_PATH = path.join(process.cwd(), "data", "newsletter-subscribers.json");

function readSubscribers(): any[] {
  try {
    if (!fs.existsSync(NEWSLETTER_DB_PATH)) return [];
    const content = fs.readFileSync(NEWSLETTER_DB_PATH, "utf8");
    return JSON.parse(content || "[]");
  } catch (error) {
    console.error("Failed to read local subscribers database:", error);
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
    console.error("Failed to write local subscribers database:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      mobile,
      mobileNumber,
      consentChecked,
      marketingConsent,
      gdprConsent,
      consentSource,
      primaryInterest,
      topics,
      pagesVisited,
    } = body;

    const isConsentGiven = Boolean(consentChecked || marketingConsent || gdprConsent);

    // Validate required fields
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    // Basic email format validation regex
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Verify explicit consent check (MUST be explicitly true)
    if (!isConsentGiven) {
      return NextResponse.json(
        { success: false, message: "Consent checkbox must be checked." },
        { status: 400 }
      );
    }

    const subscriberRecord = {
      id: `SUB-${Date.now()}`,
      name: name ? String(name).trim() : "",
      email: cleanEmail,
      mobileNumber: (mobile || mobileNumber) ? String(mobile || mobileNumber).trim() : undefined,
      marketingConsent: true,
      consentGivenAt: new Date().toISOString(),
      consentSource: consentSource ? String(consentSource).trim() : "newsletter-signup-component",
      primaryInterest: primaryInterest ? String(primaryInterest).trim() : "General Joint Health",
      topics: Array.isArray(topics) && topics.length > 0 ? topics : ["Knee Health Updates"],
      pagesVisited: Array.isArray(pagesVisited) && pagesVisited.length > 0 ? pagesVisited : ["/"],
    };

    // 1. Try writing to Supabase if configured
    let savedToSupabase = false;
    if (isSupabaseConfigured()) {
      savedToSupabase = await saveContactToSupabase({
        name: subscriberRecord.name,
        email: subscriberRecord.email,
        mobile_number: subscriberRecord.mobileNumber,
        marketing_consent: true,
        consent_given_at: subscriberRecord.consentGivenAt,
        consent_source: subscriberRecord.consentSource,
        primary_interest: subscriberRecord.primaryInterest,
        topics: subscriberRecord.topics,
        pages_visited: subscriberRecord.pagesVisited,
      });
    }

    // 2. Always persist/sync to local disk JSON file as fallback/cache
    const localSubscribers = readSubscribers();
    const existingIndex = localSubscribers.findIndex(
      (sub: any) => sub.email && sub.email.toLowerCase() === cleanEmail
    );

    if (existingIndex >= 0) {
      localSubscribers[existingIndex] = { ...localSubscribers[existingIndex], ...subscriberRecord };
    } else {
      localSubscribers.push(subscriberRecord);
    }
    writeSubscribers(localSubscribers);

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing! You will receive knee health blogs, newsletters, and updates from Lincolnshire Knee Clinic.",
      storage: savedToSupabase ? "supabase" : "local_file",
    });
  } catch (error) {
    console.error("Error processing contact signup:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
