import { NextResponse } from "next/server";
import { getStoreValue, setStoreValue } from "@/lib/dataStore";
import { sendContactEnquiryNotificationEmail } from "@/lib/graphMail";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOPICS_KEY = "dynamic-topics";

async function readTopics() {
  return getStoreValue<any[]>(TOPICS_KEY, []);
}

async function writeTopics(topics: any[]) {
  // Enforce 10-topic pruning cap
  if (topics.length > 10) {
    // Keep baseline topics (isAiDiscovered === false) and prune least popular AI discovered topic
    topics.sort((a, b) => b.enquiryCount - a.enquiryCount);
    topics = topics.slice(0, 10);
  }
  return setStoreValue(TOPICS_KEY, topics);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, preferredClinic, website } = body;

    // Honeypot: real visitors never fill this hidden field in. If it's set,
    // pretend to succeed so bots don't learn they were caught, but skip
    // the actual write/email.
    if (typeof website === "string" && website.trim() !== "") {
      return NextResponse.json({
        success: true,
        message: "Thank you for contacting Lincolnshire Knee Clinic. Our medical secretary will respond within 24 hours.",
      });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
      return NextResponse.json({ success: false, error: "A valid email address is required" }, { status: 400 });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    }

    const lowerMsg = message.toLowerCase();
    const topics = await readTopics();

    let matched = false;

    // Check existing topics and update enquiry score + append query
    if (lowerMsg.includes("driv") || lowerMsg.includes("work") || lowerMsg.includes("car")) {
      const topic = topics.find((t: any) => t.id === "topic-5");
      if (topic) {
        topic.enquiryCount = (topic.enquiryCount || 0) + 1;
        if (!topic.latestQueries) topic.latestQueries = [];
        topic.latestQueries.unshift(message.substring(0, 120));
        matched = true;
      }
    }
    
    if (lowerMsg.includes("bupa") || lowerMsg.includes("axa") || lowerMsg.includes("insurance") || lowerMsg.includes("pre-auth")) {
      const topic = topics.find((t: any) => t.id === "topic-6");
      if (topic) {
        topic.enquiryCount = (topic.enquiryCount || 0) + 1;
        if (!topic.latestQueries) topic.latestQueries = [];
        topic.latestQueries.unshift(message.substring(0, 120));
        matched = true;
      }
    }

    if (lowerMsg.includes("stair") || lowerMsg.includes("patella") || lowerMsg.includes("crunch")) {
      const topic = topics.find((t: any) => t.id === "topic-7");
      if (topic) {
        topic.enquiryCount = (topic.enquiryCount || 0) + 1;
        if (!topic.latestQueries) topic.latestQueries = [];
        topic.latestQueries.unshift(message.substring(0, 120));
        matched = true;
      }
    }

    if (lowerMsg.includes("arthrosamid") || lowerMsg.includes("injection") || lowerMsg.includes("prp") || lowerMsg.includes("gel")) {
      const topic = topics.find((t: any) => t.id === "topic-1");
      if (topic) {
        topic.enquiryCount = (topic.enquiryCount || 0) + 1;
        if (!topic.latestQueries) topic.latestQueries = [];
        topic.latestQueries.unshift(message.substring(0, 120));
        matched = true;
      }
    }

    if (lowerMsg.includes("replacement") || lowerMsg.includes("surgery") || lowerMsg.includes("robotic")) {
      const topic = topics.find((t: any) => t.id === "topic-2");
      if (topic) {
        topic.enquiryCount = (topic.enquiryCount || 0) + 1;
        if (!topic.latestQueries) topic.latestQueries = [];
        topic.latestQueries.unshift(message.substring(0, 120));
        matched = true;
      }
    }

    // Write updated topics (with auto-pruning if > 10 topics)
    await writeTopics(topics);

    // Notify clinic admin — doesn't block the response on email delivery issues.
    sendContactEnquiryNotificationEmail({
      name: name.trim(),
      email: email.trim(),
      phone: typeof phone === "string" ? phone.trim() : undefined,
      message: message.trim(),
      preferredClinic: typeof preferredClinic === "string" ? preferredClinic.trim() : undefined,
    }).catch((err) => console.error("Failed to send contact enquiry notification email:", err));

    return NextResponse.json({
      success: true,
      message: "Thank you for contacting Lincolnshire Knee Clinic. Our medical secretary will respond within 24 hours.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ success: false, error: "An error occurred while processing your request." }, { status: 500 });
  }
}
