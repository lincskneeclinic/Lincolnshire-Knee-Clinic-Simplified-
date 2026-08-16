import { NextResponse } from "next/server";
import { getStoreValue } from "@/lib/dataStore";

export const STORE_KEY = "site-engagement-settings";

export interface EngagementSettings {
  whatsappNudgeEnabled: boolean;
  emailCaptureEnabled: boolean;
}

export const DEFAULT_ENGAGEMENT_SETTINGS: EngagementSettings = {
  whatsappNudgeEnabled: true,
  emailCaptureEnabled: true,
};

// Public, unauthenticated — read by ProactivePagePrompt.tsx and
// PageInterestCapture.tsx on the live site, not just the portal.
export async function GET() {
  const settings = await getStoreValue<EngagementSettings>(STORE_KEY, DEFAULT_ENGAGEMENT_SETTINGS);
  return NextResponse.json({ success: true, settings });
}
