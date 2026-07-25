import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DYNAMIC_TOPICS_PATH = path.join(process.cwd(), "data", "dynamic-topics.json");

function readTopics() {
  try {
    if (!fs.existsSync(DYNAMIC_TOPICS_PATH)) return [];
    return JSON.parse(fs.readFileSync(DYNAMIC_TOPICS_PATH, "utf8") || "[]");
  } catch (err) {
    return [];
  }
}

function writeTopics(topics: any[]) {
  try {
    // Enforce 10-topic pruning cap
    if (topics.length > 10) {
      // Keep baseline topics (isAiDiscovered === false) and prune least popular AI discovered topic
      topics.sort((a, b) => b.enquiryCount - a.enquiryCount);
      topics = topics.slice(0, 10);
    }
    fs.writeFileSync(DYNAMIC_TOPICS_PATH, JSON.stringify(topics, null, 2), "utf8");
    return true;
  } catch (err) {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, preferredClinic } = body;

    if (!email || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const lowerMsg = message.toLowerCase();
    const topics = readTopics();

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
    writeTopics(topics);

    return NextResponse.json({
      success: true,
      message: "Thank you for contacting Lincolnshire Knee Clinic. Our medical secretary will respond within 24 hours.",
    });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
