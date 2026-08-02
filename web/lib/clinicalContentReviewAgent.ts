import { GoogleGenerativeAI } from "@google/generative-ai";
import { ReviewablePage } from "@/lib/clinicalReview";
import { symptomsData } from "@/data/symptoms";
import { conditionsData } from "@/data/conditions";
import { treatmentsData } from "@/data/treatments";
import { injectionsData } from "@/data/injections";
import { SITE_URL } from "@/lib/site";

export interface ClinicalContentReviewResult {
  overall_assessment: string;
  findings: Array<{ severity: "high" | "medium" | "low"; category: string; note: string }>;
}

function section(label: string, content: string | string[] | undefined): string {
  if (!content || (Array.isArray(content) && content.length === 0)) return "";
  const body = Array.isArray(content) ? content.map((line) => `- ${line}`).join("\n") : content;
  return `${label.toUpperCase()}:\n${body}\n`;
}

function faqSection(faqs: { question: string; answer: string }[] | undefined): string {
  if (!faqs || faqs.length === 0) return "";
  const body = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
  return `FAQS:\n${body}\n`;
}

/**
 * Best-effort strip of a live page's rendered HTML down to plain body text, for
 * the 2 hand-authored injection pages that have no backing data-file entry
 * (so there's nothing structured to read directly). Scoped-down version of the
 * same idea as search-references/route.ts's fetchEnrichedSummary — that one
 * caps at 650 chars for a search-result snippet; this one wants the fuller
 * body text of the clinic's own page, so no length cap.
 */
async function scrapeLivePageText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; LincolnshireKneeClinicBot/1.0)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Failed to fetch page content (${res.status})`);
  const html = await res.text();
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ");
  const paragraphs = [...cleaned.matchAll(/<(?:p|h[1-4]|li)[^>]*>([\s\S]*?)<\/(?:p|h[1-4]|li)>/gi)];
  const texts = paragraphs
    .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .filter((t) => t.length > 40);
  return texts.join("\n");
}

/** Builds the plain-text content of a reviewable page, for the AI to review. */
async function buildPageContentText(page: ReviewablePage): Promise<string> {
  switch (page.contentType) {
    case "symptoms": {
      const d = symptomsData[page.slug];
      if (!d) break;
      return [
        section("Introduction", d.introduction),
        section("What is it", d.whatIs),
        section("Common presentations", d.commonPresentations),
        section("Duration pattern", d.durationPattern),
        section("Warning signs (red flags)", d.warningSigns),
        section("Assessment", d.assessment),
        section("Investigations", d.investigations),
        section("Initial management", d.initialManagement),
        section("When to consult", d.whenToConsult),
        faqSection(d.faqs),
      ].join("\n");
    }
    case "conditions": {
      const d = conditionsData[page.slug];
      if (!d) break;
      return [
        section("Introduction", d.introduction),
        section("What is it", d.whatIs),
        section("Symptoms", d.symptoms),
        section("Causes", d.causes),
        section("Assessment", d.assessment),
        section("Investigations", d.investigations),
        section("Treatments", d.treatments),
        section(d.surgeryTitle || "Surgery", d.surgeryDetails),
        faqSection(d.faqs),
      ].join("\n");
    }
    case "treatments": {
      const d = treatmentsData[page.slug];
      if (!d) break;
      return [
        section("Introduction", d.introduction),
        section("What is it", d.whatIs),
        section("What it involves", d.whatItInvolves),
        section("Suitability", d.suitability),
        section("Not suitable for", d.notSuitable),
        section("Alternatives", d.alternatives),
        section("Risks", d.risks),
        section("Recovery", d.recovery),
        section("Rehabilitation", d.rehabilitation),
        faqSection(d.faqs),
      ].join("\n");
    }
    case "injections": {
      const d = injectionsData.find((i) => i.slug === page.slug);
      if (!d) break;
      return [
        section("Description", d.description),
        section("How it works", d.howItWorks),
        section("Who may be considered", d.whoConsidered),
        section("Who may not be suitable", d.whoNotSuitable),
        section("Benefits", d.benefits),
        section("Risks and limitations", d.risksLimitations),
        section("Procedure steps", d.procedureSteps),
        section("Aftercare", d.aftercareSteps),
        faqSection(d.faqs),
      ].join("\n");
    }
  }

  // No backing data-file entry (the 2 hand-authored injection pages) — scrape the live page instead.
  return scrapeLivePageText(`${SITE_URL}${page.url}`);
}

/**
 * Sends a reviewable page's own content to Gemini for an advisory clinical-
 * accuracy review, alongside the existing "Suggested Evidence Sources" web
 * search — this reviews what's already written, rather than finding new
 * references. Purely advisory: the human reviewer (a Consultant Orthopaedic
 * Surgeon) always makes the final call before marking a page reviewed.
 */
export async function reviewPageContent(page: ReviewablePage): Promise<ClinicalContentReviewResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const contentText = await buildPageContentText(page);
  if (!contentText.trim()) {
    throw new Error("Could not load this page's content to review.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: `You are a clinical content reviewer supporting a Consultant Trauma & Orthopaedic Surgeon at Lincolnshire Knee Clinic. You are reviewing a page of patient-facing knee-health education content BEFORE a human clinician signs off on it.

Your review is advisory only — you are not making the final clinical decision, the surgeon is. Read the page content provided and check for:
1. Clinical accuracy concerns — anything that looks outdated, overstated, or inconsistent with current orthopaedic practice.
2. Missing important safety information — e.g. a symptom page without clear guidance on when to seek urgent care, if that's the kind of page where it matters.
3. Unclear or potentially confusing wording for a patient reader.
4. Anything else a clinical reviewer should double-check before approving.

Rules:
- Never invent citations, statistics, or claims. If you are not confident about something, say so with appropriate hedging rather than stating it as fact.
- Only raise genuine, specific concerns tied to the actual text provided — do not pad the list with generic or low-value observations.
- If the content looks clinically sound, say so plainly and return an empty findings array — do not invent issues to appear thorough.

You MUST output your response strictly as valid JSON matching this schema:
{
  "overall_assessment": "1-2 sentence plain-English summary of your overall impression of this page.",
  "findings": [
    { "severity": "high" | "medium" | "low", "category": "short label, e.g. Clinical accuracy / Missing safety information / Patient clarity", "note": "specific, concrete observation" }
  ]
}`,
  });

  const userPrompt = `Page type: ${page.contentType}
Page name: ${page.name}

PAGE CONTENT:
${contentText}

Review this page content now and return the JSON.`;

  const result = await model.generateContent(userPrompt);
  let rawText = result.response.text() || "";
  rawText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

  const aiData = JSON.parse(rawText);

  const findings = Array.isArray(aiData.findings)
    ? aiData.findings
        .filter((f: any) => f && typeof f.note === "string")
        .map((f: any) => ({
          severity: f.severity === "high" || f.severity === "medium" || f.severity === "low" ? f.severity : "low",
          category: typeof f.category === "string" && f.category ? f.category : "General",
          note: f.note as string,
        }))
    : [];

  return {
    overall_assessment:
      typeof aiData.overall_assessment === "string" && aiData.overall_assessment
        ? aiData.overall_assessment
        : "AI review completed.",
    findings,
  };
}
