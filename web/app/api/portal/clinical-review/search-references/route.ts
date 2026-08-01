import { NextResponse } from "next/server";
import { getAllReviewablePages, ContentType } from "@/lib/clinicalReview";

export interface SearchReferenceResult {
  title: string;
  url: string;
  source: string;
  summary: string;
}

const MAX_RESULTS = 15;
const MAX_PAGE_CURSOR = 3;
// Targets roughly 4-5 lines of wrapped text in the dashboard's result panel.
const MAX_SUMMARY_LENGTH = 650;

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .trim();
}

function extractMetaDescription(html: string): string | null {
  const patterns = [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Pulls the first few substantial <p> blocks from the page body (skipping short
 * nav/caption fragments) to add real body content on top of the meta description,
 * since meta descriptions alone (~150-160 chars by SEO convention) are too short
 * to fill 4-5 lines in the review panel.
 */
function extractBodyParagraphText(html: string): string {
  // Strip script/style plus common chrome regions (nav/header/footer/aside) so
  // breadcrumb and menu text ("Home Health A to Z Conditions A to Z Back...")
  // doesn't get mistaken for real article content.
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ");
  const paragraphs = [...cleaned.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const texts: string[] = [];
  let combinedLength = 0;
  for (const match of paragraphs) {
    const text = match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length > 60) {
      texts.push(text);
      combinedLength += text.length;
    }
    if (combinedLength > MAX_SUMMARY_LENGTH) break;
  }
  return texts.join(" ");
}

/**
 * Best-effort enrichment: fetch the page itself and combine its meta description
 * with real body-paragraph text, giving a fuller summary than the short Serper
 * snippet alone so a reviewer has enough context to judge relevance without
 * opening every link. Falls back to the Serper snippet on any failure, timeout,
 * non-HTML response, or PDF (leaflets are often PDFs).
 */
async function fetchEnrichedSummary(url: string, fallback: string): Promise<string> {
  if (/\.pdf($|\?)/i.test(url)) return fallback;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LincolnshireKneeClinicBot/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok || !contentType.includes("html") || !res.body) return fallback;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    let bytesRead = 0;
    const MAX_BYTES = 300_000;
    while (bytesRead < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      bytesRead += value.length;
    }
    reader.cancel().catch(() => {});

    const metaDescription = extractMetaDescription(html);
    const bodyText = extractBodyParagraphText(html);

    const parts: string[] = [];
    if (metaDescription) parts.push(decodeHtmlEntities(metaDescription));
    if (bodyText) {
      const decodedBody = decodeHtmlEntities(bodyText);
      const alreadyCovered = parts[0] && decodedBody.toLowerCase().startsWith(parts[0].toLowerCase().slice(0, 40));
      if (!alreadyCovered) parts.push(decodedBody);
    }

    let combined = parts.join(" ").replace(/\s+/g, " ").trim();
    if (!combined || combined.length < fallback.length) combined = fallback;

    if (combined.length > MAX_SUMMARY_LENGTH) {
      combined = combined.slice(0, MAX_SUMMARY_LENGTH).replace(/\s+\S*$/, "") + "…";
    }
    return combined;
  } catch {
    return fallback;
  }
}

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
    if (!apiKey || apiKey.startsWith("replace-with-") || apiKey.startsWith("your-")) {
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
