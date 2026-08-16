import { NextResponse } from "next/server";
import { getStoreValue, setStoreValue } from "@/lib/dataStore";
import { STORE_KEY, DEFAULT_ENGAGEMENT_SETTINGS, type EngagementSettings } from "@/app/api/site-settings/engagement/route";

// Admin-only — gated behind requireAdminSession via proxy.ts's isDashboardRoute allowlist.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = await getStoreValue<EngagementSettings>(STORE_KEY, DEFAULT_ENGAGEMENT_SETTINGS);

    const updated: EngagementSettings = {
      whatsappNudgeEnabled:
        typeof body.whatsappNudgeEnabled === "boolean" ? body.whatsappNudgeEnabled : current.whatsappNudgeEnabled,
      emailCaptureEnabled:
        typeof body.emailCaptureEnabled === "boolean" ? body.emailCaptureEnabled : current.emailCaptureEnabled,
    };

    const success = await setStoreValue(STORE_KEY, updated);
    if (!success) {
      return NextResponse.json({ success: false, message: "Failed to save settings." }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Error updating engagement settings:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}
