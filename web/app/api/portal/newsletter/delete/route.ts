import { NextResponse } from "next/server";
import { deleteNewsletterEdition } from "@/lib/newsletterDistribution";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { editionId } = body;

    if (!editionId || typeof editionId !== "string" || !editionId.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'editionId' in request body." },
        { status: 400 }
      );
    }

    const campaignId = editionId.trim();
    console.log(`[Newsletter API] Discarding newsletter draft: ${campaignId}`);

    const deleted = await deleteNewsletterEdition(campaignId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Newsletter edition not found or could not be deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Newsletter edition draft deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/portal/newsletter/delete:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete newsletter edition." },
      { status: 500 }
    );
  }
}
