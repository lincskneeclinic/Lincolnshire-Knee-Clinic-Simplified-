// Grounds the automated research pipeline in real, fetched web sources instead of
// letting the Gemini synthesis call in researchAgent.ts free-associate journal/
// guideline claims from its training data. Mirrors the multi-source strategy the
// human-run lincoln-knee-clinic-blog-research skill follows manually (see
// .claude/skills/lincoln-knee-clinic-blog-research/SKILL.md), but automated via
// Serper.dev — reusing the same search+fetch pattern already proven in
// app/api/portal/clinical-review/search-references/route.ts.
import { fetchEnrichedSummary, serperSearch } from "./webSourceFetch";

export type WebSourceSearchPass = "guideline" | "literature" | "contradiction";

export interface WebSource {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  searchPass: WebSourceSearchPass;
}

const GUIDELINE_SITES = ["nice.org.uk", "cochranelibrary.com", "boa.ac.uk", "baskonline.com"];

const RESULTS_PER_PASS = 6;
const MAX_TOTAL_SOURCES = 18;

function buildQueries(topic: string, topicKeywords: string): Record<WebSourceSearchPass, string> {
  const base = topicKeywords || topic;
  const siteFilter = GUIDELINE_SITES.map((site) => `site:${site}`).join(" OR ");

  return {
    guideline: `${base} knee (${siteFilter})`,
    literature: `${base} knee systematic review OR meta-analysis OR randomized controlled trial orthopaedic evidence`,
    contradiction: `${base} knee (no benefit OR not superior OR equivalent outcomes OR "no significant difference" OR complication OR adverse OR controversy)`,
  };
}

/**
 * Runs three targeted Serper searches in parallel (guideline-body-restricted,
 * general literature, and an explicit contradiction/null-evidence pass mirroring
 * the manual skill's mandatory search for conflicting findings), dedupes by URL,
 * and enriches each surviving result with real fetched page content.
 *
 * Returns [] (not a thrown error) if SERPER_API_KEY isn't configured — callers
 * should degrade to PubMed-only grounding rather than failing the whole run.
 */
export async function gatherWebEvidence(topic: string, topicKeywords: string): Promise<WebSource[]> {
  const queries = buildQueries(topic, topicKeywords);

  const [guidelineResults, literatureResults, contradictionResults] = await Promise.all([
    serperSearch(queries.guideline, { num: RESULTS_PER_PASS }),
    serperSearch(queries.literature, { num: RESULTS_PER_PASS }),
    serperSearch(queries.contradiction, { num: RESULTS_PER_PASS }),
  ]);

  const tagged: Array<{ result: (typeof guidelineResults)[number]; searchPass: WebSourceSearchPass }> = [
    ...guidelineResults.map((result) => ({ result, searchPass: "guideline" as const })),
    ...literatureResults.map((result) => ({ result, searchPass: "literature" as const })),
    ...contradictionResults.map((result) => ({ result, searchPass: "contradiction" as const })),
  ];

  // Dedupe by URL — a source found by multiple passes keeps the first pass it
  // appeared under (guideline > literature > contradiction, matching array order).
  const seenUrls = new Set<string>();
  const deduped = tagged.filter(({ result }) => {
    if (seenUrls.has(result.url)) return false;
    seenUrls.add(result.url);
    return true;
  }).slice(0, MAX_TOTAL_SOURCES);

  const enriched = await Promise.all(
    deduped.map(async ({ result, searchPass }, index) => ({
      id: `W${index + 1}`,
      title: result.title,
      url: result.url,
      source: result.source,
      summary: await fetchEnrichedSummary(result.url, result.summary),
      searchPass,
    }))
  );

  return enriched;
}

export function getQueriesUsed(topic: string, topicKeywords: string): string[] {
  const queries = buildQueries(topic, topicKeywords);
  return [queries.guideline, queries.literature, queries.contradiction];
}
