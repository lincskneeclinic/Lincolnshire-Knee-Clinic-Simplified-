export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  pubdate: string;
  url: string;
  abstract?: string;
}

/**
 * Batched efetch call for abstract text — esummary (used above) only returns
 * metadata, not the abstract, so without this the Gemini synthesis call only ever
 * sees article titles and has to guess at findings. One extra HTTP call regardless
 * of article count (ids are comma-joined into a single request).
 */
async function fetchAbstracts(pmids: string[]): Promise<Record<string, string>> {
  if (pmids.length === 0) return {};

  try {
    const idsStr = pmids.join(",");
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${idsStr}&retmode=xml`;

    const res = await fetch(fetchUrl, {
      headers: { "User-Agent": "LincolnshireKneeClinicResearchAgent/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return {};

    const xml = await res.text();
    const abstracts: Record<string, string> = {};

    // Split into per-article blocks so an AbstractText match can't leak across
    // articles, then pull the PMID and concatenate all AbstractText segments
    // within that block (structured abstracts split Background/Methods/etc.
    // into separate <AbstractText> tags).
    const articleBlocks = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];
    for (const block of articleBlocks) {
      const pmidMatch = block.match(/<PMID[^>]*>(\d+)<\/PMID>/);
      if (!pmidMatch) continue;
      const pmid = pmidMatch[1];

      const abstractMatches = [...block.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)];
      if (abstractMatches.length === 0) continue;

      const text = abstractMatches
        .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
        .filter(Boolean)
        .join(" ");
      if (text) abstracts[pmid] = text;
    }

    return abstracts;
  } catch (err) {
    console.error("Error fetching PubMed abstracts:", err);
    return {};
  }
}

/**
 * Fetch real PubMed literature records via NCBI Entrez E-utilities REST API.
 * Ensures zero fabricated citations — all references are real PMIDs.
 */
export async function fetchPubMedArticles(query: string, maxResults = 5): Promise<PubMedArticle[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodedQuery}&retmode=json&retmax=${maxResults}`;

    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "LincolnshireKneeClinicResearchAgent/1.0" },
      signal: AbortSignal.timeout(6000),
    });

    if (!searchRes.ok) return [];

    const searchJson = await searchRes.json();
    const idList: string[] = searchJson.esearchresult?.idlist || [];

    if (idList.length === 0) return [];

    const idsStr = idList.join(",");
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idsStr}&retmode=json`;

    const summaryRes = await fetch(summaryUrl, {
      headers: { "User-Agent": "LincolnshireKneeClinicResearchAgent/1.0" },
      signal: AbortSignal.timeout(6000),
    });

    if (!summaryRes.ok) return [];

    const summaryJson = await summaryRes.json();
    const results = summaryJson.result || {};
    const abstracts = await fetchAbstracts(idList);

    const articles: PubMedArticle[] = [];
    for (const uid of idList) {
      const doc = results[uid];
      if (!doc) continue;
      const cleanTitle = (doc.title || "No Title").replace(/\[|\]/g, "");
      const authorsList = (doc.authors || []).map((a: any) => a.name).join(", ");
      articles.push({
        pmid: uid,
        title: cleanTitle,
        authors: authorsList || "Various Authors",
        journal: doc.source || "Peer-Reviewed Orthopaedic Journal",
        pubdate: doc.pubdate || "Recent",
        url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
        abstract: abstracts[uid],
      });
    }

    return articles;
  } catch (err) {
    console.error("Error fetching PubMed articles:", err);
    return [];
  }
}
