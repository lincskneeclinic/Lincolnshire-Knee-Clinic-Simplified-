// Shared Serper.dev web search + bounded-page-fetch-and-summarize helpers.
// Originally lived only in app/api/portal/clinical-review/search-references/route.ts;
// extracted here so web/lib/guidelineSearch.ts (automated research pipeline) can reuse
// the same "real, fetched, verifiable" search pattern instead of duplicating it.

export interface SerperSearchResult {
  title: string;
  url: string;
  source: string;
  summary: string;
}

const MAX_SUMMARY_LENGTH = 650;

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function decodeHtmlEntities(text: string): string {
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

export function extractMetaDescription(html: string): string | null {
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
export function extractBodyParagraphText(html: string): string {
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
 * snippet alone. Falls back to the Serper snippet on any failure, timeout,
 * non-HTML response, or PDF (leaflets are often PDFs).
 */
export async function fetchEnrichedSummary(url: string, fallback: string): Promise<string> {
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

export function isSerperKeyConfigured(apiKey: string | undefined): apiKey is string {
  return !!apiKey && !apiKey.startsWith("replace-with-") && !apiKey.startsWith("your-");
}

/**
 * Runs a Serper.dev web search and returns raw organic results (title/url/source
 * + Serper's short snippet as summary) — callers that want richer summaries should
 * enrich individual results with fetchEnrichedSummary().
 */
export async function serperSearch(
  query: string,
  options: { num?: number; page?: number } = {}
): Promise<SerperSearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!isSerperKeyConfigured(apiKey)) return [];

  const { num = 15, page = 1 } = options;

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num, page }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];

    const json = await res.json();
    const organic: any[] = Array.isArray(json.organic) ? json.organic : [];

    return organic
      .filter((item) => item?.title && item?.link)
      .slice(0, num)
      .map((item) => ({
        title: item.title as string,
        url: item.link as string,
        source: getHostname(item.link),
        summary: (item.snippet as string) || "",
      }));
  } catch {
    return [];
  }
}
