import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isSupabaseConfigured, fetchContactsFromSupabase } from "@/lib/supabase";
import { getStoreValue } from "@/lib/dataStore";

const NEWSLETTER_PATH = path.join(process.cwd(), "data", "newsletter-subscribers.json");

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
  let subscribers: any[] = [];
  let storageSource = "local_file";

  if (isSupabaseConfigured()) {
    const supabaseContacts = await fetchContactsFromSupabase();
    if (supabaseContacts.length > 0) {
      subscribers = supabaseContacts.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        mobileNumber: c.mobile_number,
        marketingConsent: c.marketing_consent,
        consentGivenAt: c.consent_given_at,
        consentSource: c.consent_source,
        primaryInterest: c.primary_interest,
        topics: c.topics,
        pagesVisited: c.pages_visited,
      }));
      storageSource = "supabase";
    }
  }

  if (subscribers.length === 0) {
    subscribers = readJsonFile(NEWSLETTER_PATH, []);
  }

  const topicsList = await getStoreValue<any[]>("dynamic-topics", []);
  const pollData = await getStoreValue("newsletter-poll", { votes: {}, suggestions: [] });
  const eventCounters = await getStoreValue("event-counters", {
    call_now: 0,
    book_appointment: 0,
    whatsapp_click: 0,
  });

  // 1. Interest Segmentation
  const interestSegmentation: Record<string, number> = {
    "Injections & Preservation": 0,
    "Knee Replacement & Surgery": 0,
    "Sports Injuries & ACL": 0,
    "General Knee Health": 0,
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
    const interest = sub.primaryInterest || "General Knee Health";
    interestSegmentation[interest] = (interestSegmentation[interest] || 0) + 1;

    // Source
    const source = sub.consentSource || "newsletter-signup-component";
    sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;

    // Date grouping
    if (sub.consentGivenAt) {
      const dateKey = String(sub.consentGivenAt).split("T")[0];
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
      supabaseConfigured: isSupabaseConfigured(),
      storageSource,
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
