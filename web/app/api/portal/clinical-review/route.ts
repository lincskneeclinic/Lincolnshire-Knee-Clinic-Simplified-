import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getAllReviewablePages,
  getReviewRegistry,
  upsertReviewEntry,
  ClinicalReviewEntry,
} from "@/lib/clinicalReview";

export async function GET() {
  const pages = getAllReviewablePages();
  const registry = await getReviewRegistry();

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

    const matchingPage = getAllReviewablePages().find((page) => page.pageId === pageId);
    if (!matchingPage) {
      return NextResponse.json({ success: false, error: "Unknown pageId" }, { status: 400 });
    }

    const isReviewed = Boolean(reviewed);
    const entry: ClinicalReviewEntry = {
      reviewed: isReviewed,
      reviewerName: typeof reviewerName === "string" ? reviewerName.trim() : undefined,
      reviewerTitle: typeof reviewerTitle === "string" ? reviewerTitle.trim() : undefined,
      lastReviewedDate: typeof lastReviewedDate === "string" ? lastReviewedDate.trim() : undefined,
      evidenceSource: typeof evidenceSource === "string" ? evidenceSource.trim() : undefined,
      updatedAt: new Date().toISOString(),
      // Snapshot the content hash at the moment of approval so later edits to
      // this page's data can be detected and auto-revert the review status.
      reviewedContentHash: isReviewed && matchingPage.contentHash ? matchingPage.contentHash : undefined,
    };

    const saved = await upsertReviewEntry(pageId, entry);

    if (!saved) {
      return NextResponse.json({ success: false, error: "Failed to save review status" }, { status: 500 });
    }

    revalidatePath(matchingPage.url);
    return NextResponse.json({ success: true, pageId, review: entry });
  } catch (error) {
    console.error("Clinical review save error:", error);
    return NextResponse.json({ success: false, error: "Failed to save review status." }, { status: 500 });
  }
}
