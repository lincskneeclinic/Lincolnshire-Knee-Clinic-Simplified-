import { NextResponse } from "next/server";
import { getStoreValue } from "@/lib/dataStore";

export async function GET() {
  const topics = await getStoreValue<any[]>("dynamic-topics", []);
  const sorted = [...topics].sort((a, b) => (b.enquiryCount || 0) - (a.enquiryCount || 0)).slice(0, 8);
  return NextResponse.json({
    success: true,
    count: sorted.length,
    topics: sorted,
  });
}
