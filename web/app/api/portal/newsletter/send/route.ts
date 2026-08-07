import { NextResponse } from "next/server";
import { sendNewsletterCampaign } from "@/lib/newsletterDistribution";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { editionId, targetTopic, targetEmail } = body;

    if (!editionId || typeof editionId !== "string" || !editionId.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'editionId' in request body." },
        { status: 400 }
      );
    }

    const campaignId = editionId.trim();
    console.log(`[Newsletter API] Distributing newsletter campaign: ${campaignId} to topic: ${targetTopic || "all"}, patient: ${targetEmail || "all"}`);

    const result = await sendNewsletterCampaign(campaignId, targetTopic, targetEmail);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to distribute campaign newsletter." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Newsletter distributed successfully.`,
      sentCount: result.sentCount,
      mode: result.mode,
    });
  } catch (error: any) {
    console.error("Error in POST /api/portal/newsletter/send:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to distribute newsletter campaign" },
      { status: 500 }
    );
  }
}
