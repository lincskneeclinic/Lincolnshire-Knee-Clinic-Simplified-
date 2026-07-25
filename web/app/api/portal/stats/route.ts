import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const NEWSLETTER_PATH = path.join(process.cwd(), "data", "newsletter-subscribers.json");

function readSubscribers() {
  try {
    if (!fs.existsSync(NEWSLETTER_PATH)) return [];
    const content = fs.readFileSync(NEWSLETTER_PATH, "utf8");
    return JSON.parse(content || "[]");
  } catch (error) {
    console.error("Failed to read newsletter DB:", error);
    return [];
  }
}

export async function GET() {
  const subscribers = readSubscribers();

  // Defensible, trackable metrics structure (non-clinical)
  return NextResponse.json({
    success: true,
    data: {
      analyticsConnected: false,
      newsletter: {
        totalSignups: subscribers.length,
        subscribersList: subscribers,
      },
      // Trackable web events & metrics — placeholder status until analytics integration is connected
      metrics: {
        pageViewsTotal: null,
        topVisitedPages: [
          { page: "/clinical-knowledge-hub", label: "Clinical Knowledge Hub", views: null },
          { page: "/education", label: "Education & Blog", views: null },
          { page: "/symptoms", label: "Symptoms Hub", views: null },
          { page: "/conditions", label: "Conditions Hub", views: null },
          { page: "/treatments", label: "Treatments Hub", views: null },
          { page: "/injections", label: "Injections Hub", views: null },
        ],
        avgTimeOnPage: null,
        bounceRate: null,
        clickEvents: {
          callNowClicks: null,
          bookAppointmentClicks: null,
          phoneLinkClicks: null,
        },
        trafficSources: [
          { source: "Organic Search", percentage: null },
          { source: "Direct Traffic", percentage: null },
          { source: "Referrals", percentage: null },
        ],
      },
    },
  });
}
