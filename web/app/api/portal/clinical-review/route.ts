import { NextResponse } from "next/server";
import {
  getAllReviewablePages,
  getReviewRegistry,
  writeReviewRegistry,
  ClinicalReviewEntry,
} from "@/lib/clinicalReview";

export async function GET() {
  const pages = getAllReviewablePages();
  const registry = getReviewRegistry();

  const results = pages.map((page) => ({
    ...page,
    review: registry[page.pageId] || { reviewed: false },
  }));

  return NextResponse.json({ success: true, pages: results });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageId, reviewed, reviewerName, reviewerTitle, lastReviewedDate, evidenceSource } = body;

    if (!pageId || typeof pageId !== "string") {
      return NextResponse.json({ success: false, error: "pageId is required" }, { status: 400 });
    }

    const knownPageIds = new Set(getAllReviewablePages().map((page) => page.pageId));
    if (!knownPageIds.has(pageId)) {
      return NextResponse.json({ success: false, error: "Unknown pageId" }, { status: 400 });
    }

    const registry = getReviewRegistry();
    const entry: ClinicalReviewEntry = {
      reviewed: Boolean(reviewed),
      reviewerName: typeof reviewerName === "string" ? reviewerName.trim() : undefined,
      reviewerTitle: typeof reviewerTitle === "string" ? reviewerTitle.trim() : undefined,
      lastReviewedDate: typeof lastReviewedDate === "string" ? lastReviewedDate.trim() : undefined,
      evidenceSource: typeof evidenceSource === "string" ? evidenceSource.trim() : undefined,
      updatedAt: new Date().toISOString(),
    };

    registry[pageId] = entry;
    const saved = writeReviewRegistry(registry);

    if (!saved) {
      return NextResponse.json({ success: false, error: "Failed to save review status" }, { status: 500 });
    }

    return NextResponse.json({ success: true, pageId, review: entry });
  } catch (error) {
    console.error("Clinical review save error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
