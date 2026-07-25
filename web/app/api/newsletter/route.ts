import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBSCRIBERS_PATH = path.join(process.cwd(), "data", "newsletter-subscribers.json");

// Helper to read subscribers
function readSubscribers() {
  try {
    if (!fs.existsSync(SUBSCRIBERS_PATH)) return [];
    const content = fs.readFileSync(SUBSCRIBERS_PATH, "utf8");
    return JSON.parse(content || "[]");
  } catch (error) {
    console.error("Failed to read newsletter subscribers DB:", error);
    return [];
  }
}

// Helper to write subscribers
function writeSubscribers(data: any[]) {
  try {
    fs.writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Failed to write to newsletter subscribers DB:", error);
    return false;
  }
}

export async function GET() {
  const subscribers = readSubscribers();
  
  // Calculate category statistics
  const categoryStats = {
    total: subscribers.length,
    injections: subscribers.filter((s: any) => s.primaryInterest?.includes("Injections")).length,
    surgery: subscribers.filter((s: any) => s.primaryInterest?.includes("Replacement")).length,
    acl: subscribers.filter((s: any) => s.primaryInterest?.includes("ACL") || s.primaryInterest?.includes("Sports")).length,
    general: subscribers.filter((s: any) => s.primaryInterest?.includes("General")).length,
  };

  return NextResponse.json({
    success: true,
    stats: categoryStats,
    subscribers,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, primaryInterest, topics, pagesVisited } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    const subscribers = readSubscribers();
    
    // Check if already subscribed
    const existingIndex = subscribers.findIndex((s: any) => s.email.toLowerCase() === email.toLowerCase());
    
    const newSubscriber = {
      id: `SUB-${100 + subscribers.length + 1}`,
      email: email.trim(),
      name: name?.trim() || "Patient",
      primaryInterest: primaryInterest || "Injections & Preservation",
      topics: topics || ["Knee Preservation & Injections"],
      pagesVisited: pagesVisited || [],
      signupDate: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    if (existingIndex >= 0) {
      subscribers[existingIndex] = { ...subscribers[existingIndex], ...newSubscriber };
    } else {
      subscribers.unshift(newSubscriber);
    }

    writeSubscribers(subscribers);

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to Lincolnshire Knee Clinic updates.",
      subscriber: newSubscriber,
    });
  } catch (error: any) {
    console.error("Failed to process newsletter subscription:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
