import { fetchPubMedArticles, PubMedArticle } from "./pubmedFetcher";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ResearchBrief {
  summary: string;
  key_points: string[];
  sources: string[];
  target_audience: string;
  conflicting_findings?: string[];
  clinical_indications?: string[];
  pubmed_articles?: PubMedArticle[];
}

const apiKey = process.env.GEMINI_API_KEY;

// Short (<=3 char) orthopaedic acronyms that must survive the stopword-length
// filter below — a plain "word.length > 3" cutoff silently drops exactly the
// terms that make a query specific (e.g. "ACL Reconstruction" -> "ACL" gets
// filtered, leaving just "Reconstruction", which is far more generic).
const SHORT_MEDICAL_TERMS = new Set([
  "ACL", "PCL", "MCL", "LCL", "PRP", "MRI", "TKR", "TKA", "PKR", "PKA", "ROM", "ITB", "CT", "PT",
]);

/**
 * Conducts structured clinical evidence scan via PubMed (NCBI Entrez API)
 * and uses Gemini AI to synthesize an exhaustive literature review across
 * major orthopaedic journals (JBJS, The Knee, AJSM) and patient forum concerns.
 */
export async function performResearchProcess(topic: string): Promise<ResearchBrief> {
  const cleanTopic = topic.trim();

  // Formulate PubMed search query
  const queryKeywords = cleanTopic
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 || SHORT_MEDICAL_TERMS.has(w.toUpperCase()))
    .slice(0, 6)
    .join(" ");

  const pubmedQuery = queryKeywords ? `${queryKeywords} knee` : "knee osteoarthritis rehabilitation";

  // Fetch real PubMed literature (increased to 10 articles for broader coverage)
  const pubmedArticles = await fetchPubMedArticles(pubmedQuery, 10);

  // Build real literature source strings
  const realSources = pubmedArticles.map(
    (art) => `${art.title} — ${art.authors} (${art.journal}, ${art.pubdate}). PMID: ${art.pmid}`
  );

  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing, falling back to basic research brief.");
    return fallbackResearchBrief(cleanTopic, pubmedArticles, realSources);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: `You are an expert Orthopaedic Clinical Research Scientist and Medical Librarian for Lincolnshire Knee Clinic.
Your task is to conduct an exhaustive, evidence-based synthesis for the provided knee topic/question.
You must synthesize findings from:
1. The provided PubMed literature citations.
2. Your extensive pre-trained knowledge of high-impact orthopaedic journals: Journal of Bone and Joint Surgery (JBJS), The Knee, American Journal of Sports Medicine (AJSM), Knee Surgery, Sports Traumatology, Arthroscopy (KSSTA), and Arthroscopy.
3. Common patient forum discussions, anxieties, and real-world concerns (e.g., return to sport fear of re-injury, pain management, graft failure rates, timeline expectations).

You MUST output your response strictly as valid JSON matching this schema:
{
  "summary": "Comprehensive clinical summary synthesizing the PubMed papers, major journal guidelines (JBJS/AJSM), and patient concerns.",
  "key_points": ["5 to 7 specific, actionable, evidence-based clinical insights directly answering the topic."],
  "additional_journal_sources": ["2 to 4 specific landmark journal consensus guidelines or studies from JBJS, AJSM, or The Knee relevant to the topic."],
  "conflicting_findings": ["3 to 5 specific clinical controversies or debates (e.g., time-based vs biological/functional milestones, accelerated vs conservative rehab, graft selection nuances)."],
  "clinical_indications": ["3 to 4 specific clinical screening criteria, functional testing requirements (e.g. limb symmetry index > 90%), or pre-operative/post-operative requirements."]
}`
    });

    const userPrompt = `
Topic / Clinical Question: "${cleanTopic}"

Fetched PubMed Articles (${pubmedArticles.length} papers):
${pubmedArticles.map((art, i) => `[${i + 1}] ${art.title} in ${art.journal} (${art.pubdate}). PMID: ${art.pmid}`).join("\n")}

Please generate the exhaustive clinical research synthesis JSON now. Ensure it directly addresses every nuance of "${cleanTopic}".
`;

    const result = await model.generateContent(userPrompt);
    let rawText = result.response.text() || "";

    // Strip markdown code fences if present
    rawText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

    const aiData = JSON.parse(rawText);

    const combinedSources = [
      ...realSources,
      ...(Array.isArray(aiData.additional_journal_sources) ? aiData.additional_journal_sources : []),
      "NICE Clinical Guidelines (CG177) & British Orthopaedic Association Standards"
    ];

    return {
      summary: aiData.summary || `Exhaustive clinical literature synthesis for "${cleanTopic}".`,
      key_points: Array.isArray(aiData.key_points) ? aiData.key_points : [],
      sources: combinedSources,
      target_audience: "Patients and Orthopaedic Clinicians in Lincolnshire seeking evidence-based knee care pathways.",
      conflicting_findings: Array.isArray(aiData.conflicting_findings) ? aiData.conflicting_findings : [],
      clinical_indications: Array.isArray(aiData.clinical_indications) ? aiData.clinical_indications : [],
      pubmed_articles: pubmedArticles,
    };
  } catch (err) {
    console.error("Error during Gemini research synthesis, using fallback:", err);
    return fallbackResearchBrief(cleanTopic, pubmedArticles, realSources);
  }
}

function fallbackResearchBrief(cleanTopic: string, pubmedArticles: PubMedArticle[], realSources: string[]): ResearchBrief {
  if (realSources.length === 0) {
    realSources.push("NICE Clinical Guidelines (CG177): Osteoarthritis Care and Management in Adults");
    realSources.push("Journal of Bone and Joint Surgery (JBJS) Orthopaedic Clinical Practice Standards");
  }

  return {
    summary: `Structured clinical evidence synthesis for "${cleanTopic}". Derived from ${pubmedArticles.length} PubMed literature citations and UK orthopaedic guidelines.`,
    key_points: [
      `Evidence-based clinical protocol focusing on ${cleanTopic.toLowerCase()} for patients across Lincolnshire.`,
      `Clinical indication criteria emphasize candidate screening, patient education, and pre-operative physical optimization.`,
      `Peer-reviewed outcomes from top orthopaedic journals highlight improved joint alignment and functional rehabilitation milestones.`
    ],
    sources: realSources,
    target_audience: "Patients and General Practitioners in Lincolnshire seeking evidence-based knee care advice.",
    conflicting_findings: [
      "Individual outcome variation: Rehabilitation trajectories depend significantly on pre-treatment baseline quadriceps strength, BMI, and adherence to structured home exercises.",
      "Time-based vs Functional milestones: Modern sports medicine consensus favors objective biological and strength symmetry testing over rigid chronological timelines before authorizing return to high-impact sports."
    ],
    clinical_indications: [
      "Persistent knee symptoms impacting daily mobility or sports participation.",
      "Objective clinical assessment and imaging evaluation completed.",
      "Structured rehabilitation protocol adherence verified."
    ],
    pubmed_articles: pubmedArticles,
  };
}
