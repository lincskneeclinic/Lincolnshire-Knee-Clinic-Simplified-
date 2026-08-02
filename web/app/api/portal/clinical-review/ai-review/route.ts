import { NextResponse } from "next/server";
import { getAllReviewablePages } from "@/lib/clinicalReview";
import { reviewPageContent } from "@/lib/clinicalContentReviewAgent";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageId } = body;

    if (!pageId || typeof pageId !== "string") {
      return NextResponse.json({ success: false, error: "pageId is required" }, { status: 400 });
    }

    const page = getAllReviewablePages().find((p) => p.pageId === pageId);
    if (!page) {
      return NextResponse.json({ success: false, error: "Unknown pageId" }, { status: 400 });
    }

    const result = await reviewPageContent(page);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Clinical review AI content review error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 200 });
  }
}
