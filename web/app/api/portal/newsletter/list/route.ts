import { NextResponse } from "next/server";
import { getNewsletterEditions, getNewsletterSubscribers } from "@/lib/newsletterDistribution";

export async function GET() {
  try {
    const editions = await getNewsletterEditions();
    const subscribers = await getNewsletterSubscribers();

    return NextResponse.json({
      success: true,
      editions,
      activeSubscribersCount: subscribers.length,
    });
  } catch (error: any) {
    console.error("Error in GET /api/portal/newsletter/list:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load newsletter editions." },
      { status: 500 }
    );
  }
}
