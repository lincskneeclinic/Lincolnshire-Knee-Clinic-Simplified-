import { NextResponse } from "next/server";
import { checkAndRunIfDue, getAutomationStatus } from "@/lib/weeklyBlogAutomation";

// Admin-only (protected by proxy.ts's /api/portal/content-pipeline prefix match).
// GET reports status only (no side effects). POST { force: true } triggers a
// real run immediately, for verifying the automation actually works
// end-to-end without waiting a week.
export async function GET() {
  const status = await getAutomationStatus();
  return NextResponse.json({ success: true, ...status });
}

export async function POST(request: Request) {
  let force = false;
  try {
    const body = await request.json();
    force = body?.force === true;
  } catch {
    // body optional
  }
  const result = await checkAndRunIfDue(force);
  return NextResponse.json({ success: true, ...result });
}
