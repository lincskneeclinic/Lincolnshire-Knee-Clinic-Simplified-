import { fetchPubMedArticles, PubMedArticle } from "./pubmedFetcher";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateContentWithRetry } from "./geminiRetry";
import { gatherWebEvidence, getQueriesUsed, WebSource } from "./guidelineSearch";

export interface ResearchBrief {
  summary: string;
  key_points: string[];
  sources: string[];
  target_audience: string;
  conflicting_findings?: string[];
  clinical_indications?: string[];
  pubmed_articles?: PubMedArticle[];
  // One of: "Strong Consensus" | "Moderate Evidence" | "Limited/Emerging Evidence" |
  // "Mechanistic/Theoretical Only" | "Conflicting Expert Opinion" | "Insufficient Evidence"
  overall_evidence_grade?: string;
  guideline_sources?: string[];
  evidence_gaps?: string[];
  // Real fetched NICE/Cochrane/guideline-body and general-literature web sources
  // (see guidelineSearch.ts) that survived code-side ID verification — distinct
  // from pubmed_articles, which come from the NCBI API directly.
  web_sources?: WebSource[];
  // Ids the model returned (guideline_source_ids/supporting_source_ids, or inline
  // [PM#]/[W#] tags) that did NOT resolve to a real fetched source and were
  // therefore dropped — an audit trail proving nothing ungrounded slipped through.
  verification_notes?: string[];
  search_metadata?: {
    search_date: string;
    pubmed_query: string;
    pubmed_result_count: number;
    web_queries?: string[];
    web_result_count?: number;
    contradiction_pass_performed?: boolean;
    note: string;
  };
  // Distinguishes briefs produced by this automated pipeline from ones a human
  // researched via the lincoln-knee-clinic-blog-research skill and imported.
  source_method?: "automated" | "manual_skill_import";
}

const apiKey = process.env.GEMINI_API_KEY;

// Short (<=3 char) orthopaedic acronyms that must survive the stopword-length
// filter below — a plain "word.length > 3" cutoff silently drops exactly the
// terms that make a query specific (e.g. "ACL Reconstruction" -> "ACL" gets
// filtered, leaving just "Reconstruction", which is far more generic).
const SHORT_MEDICAL_TERMS = new Set([
  "ACL", "PCL", "MCL", "LCL", "PRP", "MRI", "TKR", "TKA", "PKR", "PKA", "ROM", "ITB", "CT", "PT",
]);

type EvidenceBundleEntry =
  | { kind: "pubmed"; id: string; article: PubMedArticle }
  | { kind: "web"; id: string; source: WebSource };

function buildEvidenceBundle(pubmedArticles: PubMedArticle[], webSources: WebSource[]) {
  const entries: EvidenceBundleEntry[] = [
    ...pubmedArticles.map((article, i) => ({ kind: "pubmed" as const, id: `PM${i + 1}`, article })),
    ...webSources.map((source) => ({ kind: "web" as const, id: source.id, source })),
  ];
  const byId = new Map<string, EvidenceBundleEntry>(entries.map((e) => [e.id, e]));
  return { entries, byId };
}

function renderBundlePromptText(entries: EvidenceBundleEntry[]): string {
  const pubmedEntries = entries.filter((e): e is Extract<EvidenceBundleEntry, { kind: "pubmed" }> => e.kind === "pubmed");
  const guidelineEntries = entries.filter((e): e is Extract<EvidenceBundleEntry, { kind: "web" }> => e.kind === "web" && e.source.searchPass === "guideline");
  const literatureEntries = entries.filter((e): e is Extract<EvidenceBundleEntry, { kind: "web" }> => e.kind === "web" && e.source.searchPass === "literature");
  const contradictionEntries = entries.filter((e): e is Extract<EvidenceBundleEntry, { kind: "web" }> => e.kind === "web" && e.source.searchPass === "contradiction");

  const sections: string[] = [];

  sections.push(
    `PubMed Articles (${pubmedEntries.length}):\n` +
      (pubmedEntries.length === 0
        ? "(none found)"
        : pubmedEntries
            .map(
              (e) =>
                `[${e.id}] ${e.article.title} — ${e.article.journal} (${e.article.pubdate}). PMID: ${e.article.pmid}` +
                (e.article.abstract ? `\nAbstract: ${e.article.abstract}` : "\n(no abstract available)")
            )
            .join("\n\n"))
  );

  sections.push(
    `Guideline & Authoritative Body Sources (${guidelineEntries.length}):\n` +
      (guidelineEntries.length === 0
        ? "(none found)"
        : guidelineEntries.map((e) => `[${e.id}] ${e.source.title} — ${e.source.source} (${e.source.url})\n${e.source.summary}`).join("\n\n"))
  );

  sections.push(
    `General Literature Sources (${literatureEntries.length}):\n` +
      (literatureEntries.length === 0
        ? "(none found)"
        : literatureEntries.map((e) => `[${e.id}] ${e.source.title} — ${e.source.source} (${e.source.url})\n${e.source.summary}`).join("\n\n"))
  );

  sections.push(
    `Contradiction / Null-Evidence Search Results (${contradictionEntries.length}):\n` +
      (contradictionEntries.length === 0
        ? "(none found)"
        : contradictionEntries.map((e) => `[${e.id}] ${e.source.title} — ${e.source.source} (${e.source.url})\n${e.source.summary}`).join("\n\n"))
  );

  return sections.join("\n\n---\n\n");
}

function renderSourceString(entry: EvidenceBundleEntry): string {
  if (entry.kind === "pubmed") {
    return `${entry.article.title} — ${entry.article.journal} (${entry.article.pubdate}). PMID: ${entry.article.pmid}`;
  }
  return `${entry.source.title} — ${entry.source.source} (${entry.source.url})`;
}

// Filters model-returned ids down to ones that actually resolve to a real fetched
// bundle entry, logging anything dropped — this (not the LLM's own claim) is what
// enforces "only cite what was actually fetched."
function verifyIds(
  ids: unknown,
  byId: Map<string, EvidenceBundleEntry>,
  context: string,
  notes: string[]
): EvidenceBundleEntry[] {
  if (!Array.isArray(ids)) return [];
  const resolved: EvidenceBundleEntry[] = [];
  for (const id of ids) {
    if (typeof id !== "string") continue;
    const entry = byId.get(id);
    if (entry) {
      resolved.push(entry);
    } else {
      notes.push(`Dropped unresolved source id "${id}" returned in ${context} (not present in the fetched evidence bundle).`);
    }
  }
  return resolved;
}

// Narrative fields (key_points/conflicting_findings/etc.) may carry inline
// [PM2]/[W5] tags, or the model sometimes bundles several into one bracket
// (e.g. "[PM2, PM3]") despite being asked for single-id tags — both forms are
// handled here. Valid tags are rewritten into a readable citation marker; tags
// that don't resolve to a real bundle entry are stripped (not silently left in
// patient-facing text) and logged.
function renderInlineTags(items: string[] | undefined, byId: Map<string, EvidenceBundleEntry>, context: string, notes: string[]): string[] {
  if (!Array.isArray(items)) return [];
  const tagRegex = /\[\s*((?:PM|W)\d+(?:\s*,\s*(?:PM|W)\d+)*)\s*\]/g;
  return items.map((item) => {
    if (typeof item !== "string") return item;
    return item
      .replace(tagRegex, (full, idList) => {
        const ids = idList.split(",").map((s: string) => s.trim());
        const rendered: string[] = [];
        for (const id of ids) {
          const entry = byId.get(id);
          if (!entry) {
            notes.push(`Dropped unresolved inline tag "[${id}]" in ${context} (not present in the fetched evidence bundle).`);
            continue;
          }
          rendered.push(entry.kind === "pubmed" ? `PMID: ${entry.article.pmid}` : entry.source.source);
        }
        return rendered.length > 0 ? `(${rendered.join(", ")})` : "";
      })
      .replace(/\s{2,}/g, " ")
      .trim();
  });
}

// Safety net for citations the model writes as free text instead of following
// the [PM#]/[W#] tag protocol (e.g. "(PMID: 12345678)" typed directly) — these
// bypass renderInlineTags' bundle-id verification entirely. Scans the already-
// processed text for any PMID-looking number and flags (does not silently
// rewrite, to avoid mangling sentence flow) any that don't match a real fetched
// PubMed article, so a human reviewer sees an explicit warning before publishing.
function flagUnverifiedPmidMentions(items: string[] | undefined, realPmids: Set<string>, context: string, notes: string[]): void {
  if (!Array.isArray(items)) return;
  const pmidMentionRegex = /PMID:?\s*(\d{4,9})/gi;
  for (const item of items) {
    if (typeof item !== "string") continue;
    for (const match of item.matchAll(pmidMentionRegex)) {
      const mentioned = match[1];
      if (!realPmids.has(mentioned)) {
        notes.push(
          `Unverified PMID mention "PMID: ${mentioned}" in ${context} — this number is not among the fetched PubMed articles for this run; verify before publishing.`
        );
      }
    }
  }
}

/**
 * Conducts grounded clinical evidence research: fetches real PubMed literature
 * (with abstracts) and real NICE/Cochrane/guideline-body + general-literature +
 * contradiction-search web sources (see guidelineSearch.ts), then asks Gemini to
 * synthesize a research brief citing ONLY those fetched sources — code-side
 * verification (not the model's own say-so) enforces that nothing ungrounded
 * makes it into the final brief.
 */
export async function performResearchProcess(topic: string): Promise<ResearchBrief> {
  const cleanTopic = topic.trim();

  // Formulate search query keywords (shared by PubMed and the web search passes)
  const queryKeywords = cleanTopic
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 || SHORT_MEDICAL_TERMS.has(w.toUpperCase()))
    .slice(0, 6)
    .join(" ");

  const pubmedQuery = queryKeywords ? `${queryKeywords} knee` : "knee osteoarthritis rehabilitation";

  // Fetch real PubMed literature and real web/guideline sources concurrently.
  const [pubmedArticles, webSources] = await Promise.all([
    fetchPubMedArticles(pubmedQuery, 10),
    gatherWebEvidence(cleanTopic, queryKeywords),
  ]);

  const webQueries = getQueriesUsed(cleanTopic, queryKeywords);
  const webSearchSkipped = webSources.length === 0;

  const realSources = pubmedArticles.map(
    (art) => `${art.title} — ${art.authors} (${art.journal}, ${art.pubdate}). PMID: ${art.pmid}`
  );

  const { entries, byId } = buildEvidenceBundle(pubmedArticles, webSources);

  const baseSearchMetadata = {
    search_date: new Date().toISOString().slice(0, 10),
    pubmed_query: pubmedQuery,
    pubmed_result_count: pubmedArticles.length,
    web_queries: webQueries,
    web_result_count: webSources.length,
    contradiction_pass_performed: webSources.some((s) => s.searchPass === "contradiction"),
    note: webSearchSkipped
      ? "SERPER_API_KEY is not configured, so guideline/literature/contradiction web search was skipped — this brief is grounded in PubMed only."
      : "Synthesized only from the fetched PubMed abstracts and fetched web/guideline sources listed below — the model was instructed not to cite anything outside this bundle, and every returned source id was code-verified against the real fetched data.",
  };

  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing, falling back to basic research brief.");
    return fallbackResearchBrief(cleanTopic, pubmedArticles, webSources, realSources, baseSearchMetadata);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      systemInstruction: `You are an expert Orthopaedic Clinical Research Scientist and Medical Librarian for Lincolnshire Knee Clinic, producing an evidence brief that a clinical reviewer will check before any patient-facing article is published.

Weigh evidence using this hierarchy (higher tiers override lower tiers when they conflict; say explicitly when a claim rests only on a lower tier):
1. Current UK/international clinical guidelines (NICE, NHS, BOA, BASK, AAOS) and Cochrane reviews.
2. Systematic reviews and meta-analyses.
3. Randomized controlled trials.
4. Mechanistic/biomechanical evidence (biologically plausible, but not itself proof of clinical outcome).
5. Observational/registry data and case series.
6. Surgeon/expert clinical consensus — many orthopaedic surgical-technique and timing questions are settled more by expert consensus than by RCT evidence; treat this as its own legitimate tier rather than folding it into "guidelines."
7. Patient forum discussions and real-world concerns — use only to describe patient concerns and framing, never as clinical efficacy evidence, and only if genuinely present in the fetched sources below.

STRICT GROUNDING RULE: You have been given a numbered Fetched Evidence Bundle below (PubMed articles tagged [PM1], [PM2]... and web/guideline sources tagged [W1], [W2]...). You MUST NOT cite, reference, or state as fact any journal name, guideline code, statistic, or study finding that is not present in that bundle. Do not draw on general pre-trained knowledge of journals or guidelines to supply a citation-worthy fact — if the bundle doesn't support a claim you'd otherwise expect to make, put it in "evidence_gaps" instead of stating it as established. General orthopaedic domain understanding may be used only for phrasing and structure, never to supply a fact that isn't grounded in the bundle.

Before finalizing "conflicting_findings", check the "Contradiction / Null-Evidence Search Results" section of the bundle specifically — actively look for null results, contradicting findings, or genuine expert disagreement there and in the rest of the bundle, not just the first supportive finding. If two well-supported positions genuinely conflict, say so plainly rather than picking a side.

Citation integrity: every source you cite MUST be identified by its bundle id in square brackets — [PM#] or [W#], one id per bracket, e.g. "[PM3]" not "[PM3, PM4]" (use two separate brackets "[PM3][PM4]" if a claim rests on more than one source). Never write a citation as free text like "(PMID: 12345678)" — always use the bracket tag form so it can be verified against the bundle. Never invent a PMID, DOI, journal name, or guideline code that isn't in the bundle.

Per-claim traceability: for each item in "key_points" and "conflicting_findings" that rests on a specific bundle source, append the bundle id in brackets at the end of that item, e.g. "Quadriceps strength at 90% limb symmetry index is a common return-to-sport criterion [PM3]." Items describing general clinical reasoning that isn't tied to one specific source don't need a tag.

You MUST output your response strictly as valid JSON matching this schema:
{
  "summary": "Comprehensive clinical summary synthesizing ONLY the fetched PubMed and web/guideline sources below.",
  "key_points": ["5 to 7 specific, actionable, evidence-based clinical insights directly answering the topic, with inline [PM#]/[W#] tags where a specific source supports the claim. Phrase each to reflect its actual confidence level (e.g. 'well-established', 'emerging evidence suggests', 'expert opinion is divided') rather than stating uniform certainty."],
  "conflicting_findings": ["3 to 5 specific clinical controversies or debates found in the bundle (especially the Contradiction/Null-Evidence section), with inline [PM#]/[W#] tags."],
  "clinical_indications": ["3 to 4 specific clinical screening criteria, functional testing requirements (e.g. limb symmetry index > 90%), or pre-operative/post-operative requirements, grounded in the bundle."],
  "overall_evidence_grade": "One of exactly: 'Strong Consensus', 'Moderate Evidence', 'Limited/Emerging Evidence', 'Mechanistic/Theoretical Only', 'Conflicting Expert Opinion', 'Insufficient Evidence' — your honest overall assessment of the evidence actually present in the bundle for this specific topic.",
  "guideline_source_ids": ["Bundle ids (e.g. 'W2', 'W5') of sources from the bundle that are genuine current clinical guideline / authoritative body documents directly relevant to this topic. Empty array if none in the bundle qualify — do not invent one."],
  "supporting_source_ids": ["Bundle ids (PM or W) of any additional sources from the bundle (beyond the ones already tagged inline) that materially informed this brief."],
  "evidence_gaps": ["2 to 4 specific open questions or gaps — including anything you would normally state as fact but couldn't because it wasn't in the fetched bundle."]
}`
    });

    const userPrompt = `
Topic / Clinical Question: "${cleanTopic}"

Fetched Evidence Bundle:

${renderBundlePromptText(entries)}

Please generate the exhaustive clinical research synthesis JSON now, citing only bundle ids. Ensure it directly addresses every nuance of "${cleanTopic}".
`;

    const result = await generateContentWithRetry(model, userPrompt);
    let rawText = result.response.text() || "";

    // Strip markdown code fences if present
    rawText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

    const aiData = JSON.parse(rawText);

    const verificationNotes: string[] = [];

    const verifiedGuidelineEntries = verifyIds(aiData.guideline_source_ids, byId, "guideline_source_ids", verificationNotes);
    const verifiedSupportingEntries = verifyIds(aiData.supporting_source_ids, byId, "supporting_source_ids", verificationNotes);

    const guidelineSources = verifiedGuidelineEntries.map(renderSourceString);

    // "sources" = the real PubMed citations (always trustworthy — fetched directly
    // from NCBI) plus any verified supporting web sources, deduped against
    // whatever's already listed under guideline_sources.
    const guidelineIds = new Set(verifiedGuidelineEntries.map((e) => e.id));
    const supportingWebSourceStrings = verifiedSupportingEntries
      .filter((e) => !guidelineIds.has(e.id))
      .map(renderSourceString);
    const combinedSources = [...realSources, ...supportingWebSourceStrings];

    // Every narrative array can carry inline [PM#]/[W#] tags in practice (the
    // model doesn't reliably confine them to just key_points/conflicting_findings
    // despite the prompt's wording), so all of them get the same tag-verification
    // treatment rather than only the two fields explicitly asked for it.
    const keyPoints = renderInlineTags(aiData.key_points, byId, "key_points", verificationNotes);
    const conflictingFindings = renderInlineTags(aiData.conflicting_findings, byId, "conflicting_findings", verificationNotes);
    const clinicalIndications = renderInlineTags(
      Array.isArray(aiData.clinical_indications) ? aiData.clinical_indications : [],
      byId,
      "clinical_indications",
      verificationNotes
    );
    const evidenceGaps = renderInlineTags(
      Array.isArray(aiData.evidence_gaps) ? aiData.evidence_gaps : [],
      byId,
      "evidence_gaps",
      verificationNotes
    );
    const rawSummary = typeof aiData.summary === "string" ? aiData.summary : `Exhaustive clinical literature synthesis for "${cleanTopic}".`;
    const summaryText = renderInlineTags([rawSummary], byId, "summary", verificationNotes)[0];

    // Safety net: catches citations the model wrote as free text (e.g.
    // "(PMID: 12345678)") instead of the [PM#] tag format, which would otherwise
    // bypass the bundle-id verification above entirely.
    const realPmids = new Set(pubmedArticles.map((a) => a.pmid));
    flagUnverifiedPmidMentions([summaryText], realPmids, "summary", verificationNotes);
    flagUnverifiedPmidMentions(keyPoints, realPmids, "key_points", verificationNotes);
    flagUnverifiedPmidMentions(conflictingFindings, realPmids, "conflicting_findings", verificationNotes);
    flagUnverifiedPmidMentions(clinicalIndications, realPmids, "clinical_indications", verificationNotes);
    flagUnverifiedPmidMentions(evidenceGaps, realPmids, "evidence_gaps", verificationNotes);

    // Backstop: if nothing guideline/literature-tier survived verification, don't
    // let the model self-report a confident grade — thin evidence should read as
    // thin, not be papered over by an optimistic "Moderate Evidence" claim.
    const hasSubstantiveEvidence = pubmedArticles.length > 0 || guidelineSources.length > 0 || supportingWebSourceStrings.length > 0;
    let overallEvidenceGrade = typeof aiData.overall_evidence_grade === "string" ? aiData.overall_evidence_grade : undefined;
    if (!hasSubstantiveEvidence && overallEvidenceGrade && !["Insufficient Evidence", "Limited/Emerging Evidence"].includes(overallEvidenceGrade)) {
      verificationNotes.push(
        `Overall evidence grade capped at "Limited/Emerging Evidence" — model self-reported "${overallEvidenceGrade}" but no guideline, literature, or PubMed sources survived verification.`
      );
      overallEvidenceGrade = "Limited/Emerging Evidence";
    }

    return {
      summary: summaryText,
      key_points: keyPoints,
      sources: combinedSources,
      target_audience: "Patients and Orthopaedic Clinicians in Lincolnshire seeking evidence-based knee care pathways.",
      conflicting_findings: conflictingFindings,
      clinical_indications: clinicalIndications,
      pubmed_articles: pubmedArticles,
      overall_evidence_grade: overallEvidenceGrade,
      guideline_sources: guidelineSources.length > 0 ? guidelineSources : undefined,
      evidence_gaps: evidenceGaps.length > 0 ? evidenceGaps : undefined,
      web_sources: webSources.length > 0 ? webSources : undefined,
      verification_notes: verificationNotes.length > 0 ? verificationNotes : undefined,
      search_metadata: baseSearchMetadata,
      source_method: "automated",
    };
  } catch (err) {
    console.error("Error during Gemini research synthesis, using fallback:", err);
    return fallbackResearchBrief(cleanTopic, pubmedArticles, webSources, realSources, baseSearchMetadata);
  }
}

function fallbackResearchBrief(
  cleanTopic: string,
  pubmedArticles: PubMedArticle[],
  webSources: WebSource[],
  realSources: string[],
  searchMetadata: NonNullable<ResearchBrief["search_metadata"]>
): ResearchBrief {
  // Even in fallback, only cite what was actually fetched — no hardcoded
  // guideline citation appended regardless of relevance.
  const guidelineWebSources = webSources.filter((s) => s.searchPass === "guideline");
  const sources = [...realSources, ...webSources.filter((s) => s.searchPass !== "guideline").map((s) => `${s.title} — ${s.source} (${s.url})`)];

  return {
    summary: `Structured clinical evidence synthesis for "${cleanTopic}". Derived from ${pubmedArticles.length} PubMed literature citations${webSources.length > 0 ? ` and ${webSources.length} fetched web/guideline sources` : ""} (AI synthesis was unavailable, so this is an unprocessed listing rather than an analyzed brief).`,
    key_points: [
      `Evidence-based clinical protocol focusing on ${cleanTopic.toLowerCase()} for patients across Lincolnshire.`,
      `Clinical indication criteria emphasize candidate screening, patient education, and pre-operative physical optimization.`,
    ],
    sources,
    target_audience: "Patients and General Practitioners in Lincolnshire seeking evidence-based knee care advice.",
    conflicting_findings: [
      "Individual outcome variation: Rehabilitation trajectories depend significantly on pre-treatment baseline quadriceps strength, BMI, and adherence to structured home exercises.",
    ],
    clinical_indications: [
      "Persistent knee symptoms impacting daily mobility or sports participation.",
      "Objective clinical assessment and imaging evaluation completed.",
    ],
    pubmed_articles: pubmedArticles,
    overall_evidence_grade: "Insufficient Evidence",
    guideline_sources: guidelineWebSources.length > 0 ? guidelineWebSources.map((s) => `${s.title} — ${s.source} (${s.url})`) : undefined,
    evidence_gaps: [
      "This brief was generated via fallback (Gemini synthesis unavailable) — no topic-specific evidence gap analysis was performed.",
    ],
    web_sources: webSources.length > 0 ? webSources : undefined,
    verification_notes: ["Fallback brief: AI synthesis step failed or was unavailable, so sources are listed as fetched rather than analyzed/verified for relevance."],
    search_metadata: {
      ...searchMetadata,
      note: "Fallback brief: Gemini synthesis was unavailable or failed, so this is a generic template listing fetched PubMed/web citations only, not an AI-synthesized evidence review.",
    },
    source_method: "automated",
  };
}
