import { NextResponse } from "next/server";
import { getAllReviewablePages, ContentType } from "@/lib/clinicalReview";
import { fetchEnrichedSummary, getHostname, isSerperKeyConfigured, type SerperSearchResult } from "@/lib/webSourceFetch";

export type SearchReferenceResult = SerperSearchResult;

const MAX_RESULTS = 15;
const MAX_PAGE_CURSOR = 3;

// Tailors the search terms to the page's content type instead of one fixed
// generic suffix for every page — a treatment page needs NICE/orthopaedic
// guideline sources, a symptom page needs differential-diagnosis/patient-
// facing sources, an injection page needs procedure-specific clinical
// evidence, etc. Also skips appending "knee" when the page name already
// contains it (most condition/treatment/injection names already do), since
// the redundant term dilutes an already-specific query.
const CONTENT_TYPE_QUERY_SUFFIX: Record<ContentType, string> = {
  symptoms: "symptoms causes differential diagnosis when to see a doctor NHS patient information",
  conditions: "diagnosis NHS NICE clinical guideline patient information",
  treatments: "NICE guideline orthopaedic surgical technique clinical evidence outcomes",
  injections: "clinical evidence NICE guideline injection technique",
};

function buildEvidenceQuery(pageName: string, contentType: ContentType): string {
  const suffix = CONTENT_TYPE_QUERY_SUFFIX[contentType];
  const needsKneeTerm = !/knee/i.test(pageName);
  return `${pageName}${needsKneeTerm ? " knee" : ""} ${suffix}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageId, page } = body;

    if (!pageId || typeof pageId !== "string") {
      return NextResponse.json({ success: false, error: "pageId is required" }, { status: 400 });
    }

    const reviewablePage = getAllReviewablePages().find((p) => p.pageId === pageId);
    if (!reviewablePage) {
      return NextResponse.json({ success: false, error: "Unknown pageId" }, { status: 400 });
    }

    const apiKey = process.env.SERPER_API_KEY;
    if (!isSerperKeyConfigured(apiKey)) {
      return NextResponse.json(
        { success: false, error: "SERPER_API_KEY is not configured. Add a real key from serper.dev to .env.local." },
        { status: 200 }
      );
    }

    const pageCursor = typeof page === "number" && page >= 1 && page <= MAX_PAGE_CURSOR ? page : 1;
    const query = buildEvidenceQuery(reviewablePage.name, reviewablePage.contentType);

    const serperRes = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: MAX_RESULTS, page: pageCursor }),
      signal: AbortSignal.timeout(8000),
    });

    if (!serperRes.ok) {
      return NextResponse.json(
        { success: false, error: `Search request failed (${serperRes.status})` },
        { status: 200 }
      );
    }

    const serperJson = await serperRes.json();
    const organic: any[] = Array.isArray(serperJson.organic) ? serperJson.organic : [];

    const baseResults = organic
      .filter((item) => item?.title && item?.link)
      .slice(0, MAX_RESULTS)
      .map((item) => ({
        title: item.title as string,
        url: item.link as string,
        source: getHostname(item.link),
        summary: (item.snippet as string) || "",
      }));

    // Enrich each result's summary in parallel (bounded per-request timeout above).
    const results: SearchReferenceResult[] = await Promise.all(
      baseResults.map(async (r) => ({
        ...r,
        summary: await fetchEnrichedSummary(r.url, r.summary),
      }))
    );

    return NextResponse.json({ success: true, query, page: pageCursor, results });
  } catch (error) {
    console.error("Clinical review search-references error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 200 });
  }
}
