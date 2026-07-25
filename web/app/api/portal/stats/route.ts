import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const NEWSLETTER_PATH = path.join(process.cwd(), "data", "newsletter-subscribers.json");
const TOPICS_PATH = path.join(process.cwd(), "data", "dynamic-topics.json");
const POLL_PATH = path.join(process.cwd(), "data", "newsletter-poll.json");
const EVENTS_PATH = path.join(process.cwd(), "data", "event-counters.json");

function readJsonFile(filePath: string, fallback: any) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content || JSON.stringify(fallback));
  } catch (error) {
    console.error(`Failed to read file at ${filePath}:`, error);
    return fallback;
  }
}

export async function GET() {
  const subscribers = readJsonFile(NEWSLETTER_PATH, []);
  const topicsList = readJsonFile(TOPICS_PATH, []);
  const pollData = readJsonFile(POLL_PATH, {
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
  });
  const eventCounters = readJsonFile(EVENTS_PATH, {
    call_now: 0,
    book_appointment: 0,
    whatsapp_click: 0,
  });

  // 1. Interest Segmentation
  const interestSegmentation: Record<string, number> = {
    "Injections & Preservation": 0,
    "Knee Replacement & Surgery": 0,
    "Sports Injuries & ACL": 0,
    "General Joint Health": 0,
  };

  // 2. Signup Source Breakdown
  const sourceBreakdown: Record<string, number> = {
    "newsletter-signup-component": 0,
    "newsletter-page-detailed-form": 0,
  };

  // 3. Subscriber Growth over time
  const growthByDate: Record<string, number> = {};

  subscribers.forEach((sub: any) => {
    // Interest
    const interest = sub.primaryInterest || "General Joint Health";
    interestSegmentation[interest] = (interestSegmentation[interest] || 0) + 1;

    // Source
    const source = sub.consentSource || "newsletter-signup-component";
    sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;

    // Date grouping
    if (sub.consentGivenAt) {
      const dateKey = sub.consentGivenAt.split("T")[0];
      growthByDate[dateKey] = (growthByDate[dateKey] || 0) + 1;
    }
  });

  // Sort trending topics by enquiryCount descending
  const trendingTopics = Array.isArray(topicsList)
    ? [...topicsList].sort((a: any, b: any) => (b.enquiryCount || 0) - (a.enquiryCount || 0)).slice(0, 8)
    : [];

  return NextResponse.json({
    success: true,
    data: {
      analyticsConnected: Boolean(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID),
      newsletter: {
        totalSignups: subscribers.length,
        subscribersList: subscribers,
        interestSegmentation,
        sourceBreakdown,
        growthByDate,
      },
      trendingTopics,
      pollResults: pollData,
      clickEvents: {
        callNowClicks: eventCounters.call_now || 0,
        bookAppointmentClicks: eventCounters.book_appointment || 0,
        whatsappClicks: eventCounters.whatsapp_click || 0,
      },
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
        trafficSources: [
          { source: "Organic Search", percentage: null },
          { source: "Direct Traffic", percentage: null },
          { source: "Referrals", percentage: null },
        ],
      },
    },
  });
}
