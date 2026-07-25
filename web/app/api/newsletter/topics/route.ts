import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DYNAMIC_TOPICS_PATH = path.join(process.cwd(), "data", "dynamic-topics.json");

// Helper to read dynamic topics
function readTopics() {
  try {
    if (!fs.existsSync(DYNAMIC_TOPICS_PATH)) return [];
    const content = fs.readFileSync(DYNAMIC_TOPICS_PATH, "utf8");
    const topics = JSON.parse(content || "[]");
    // Sort by enquiryCount descending & cap at 8 topics max
    return topics.sort((a: any, b: any) => b.enquiryCount - a.enquiryCount).slice(0, 8);
  } catch (error) {
    console.error("Failed to read dynamic topics DB:", error);
    return [];
  }
}

export async function GET() {
  const topics = readTopics();
  return NextResponse.json({
    success: true,
    count: topics.length,
    topics,
  });
}
