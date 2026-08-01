import fs from "fs";
import path from "path";

// This module derives its rules from the project's reference documents rather
// than re-authoring clinical/editorial policy in code. Both files are the
// single source of truth — edit them, not this parser's output, to change
// house style, subject prompts, or the negative prompt.
//
// These live under web/docs/ (not a repo-root-relative "../docs/") because
// Hostinger's deployment only includes the web/ directory itself — anything
// outside it (like a sibling repo-root docs/ folder) never reaches
// production, which is why this used to throw MissingReferenceDocError there
// despite working fine in local dev.
const GUIDELINES_PATH = path.join(process.cwd(), "docs", "medical-imagery-guidelines.md");
const LIBRARY_PATH = path.join(process.cwd(), "docs", "image-prompt-library.md");

export type ImageCategory =
  | "anatomy"
  | "symptom"
  | "condition"
  | "diagnostic"
  | "injection"
  | "treatment"
  | "surgery"
  | "recovery"
  | "comparison";

const SECTION_CATEGORY: Record<string, ImageCategory> = {
  "1": "anatomy",
  "2": "symptom",
  "3": "condition",
  "4": "diagnostic",
  "5": "injection",
  "6": "treatment",
  "7": "surgery",
  "8": "recovery",
  "9": "comparison",
};

export interface ImageSubject {
  id: string;
  category: ImageCategory;
  categoryLabel: string;
  title: string;
  template: string;
  keywords: string[];
}

export interface ImagePromptConfig {
  houseStyle: string;
  brandColorClause: string;
  negativePrompt: string;
  universalTemplate: string;
  subjects: ImageSubject[];
}

export class MissingReferenceDocError extends Error {
  constructor(public filePath: string) {
    super(`Required reference document could not be read: ${filePath}`);
    this.name = "MissingReferenceDocError";
  }
}

function readDoc(filePath: string): string {
  try {
    // Normalize CRLF -> LF: this repo checks out docs/*.md with CRLF line
    // endings, which breaks literal "\n\n" matches in the parsing regexes below.
    return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  } catch {
    throw new MissingReferenceDocError(filePath);
  }
}

const STOPWORDS = new Set([
  "the", "a", "an", "of", "and", "or", "to", "in", "on", "for", "with", "into",
  "knee", "illustration", "image", "realistic", "2d", "create", "show", "showing",
]);

function keywordsFromTitle(title: string): string[] {
  return title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function extractBlockquote(text: string): string | null {
  const match = text.match(/^>\s*(.+)$/m);
  return match ? match[1].trim() : null;
}

function parseImagePromptLibrary(raw: string): {
  houseStyle: string;
  brandColorClause: string;
  negativePrompt: string;
  universalTemplate: string;
  subjects: ImageSubject[];
} {
  // Global House Style block (two blockquotes: the main style, then the
  // brand-colour clause for branded diagrams).
  const houseStyleSection = raw.match(/# Global House Style([\s\S]*?)(?=\n# )/);
  const houseStyleBlockquotes = houseStyleSection
    ? [...houseStyleSection[1].matchAll(/^>\s*(.+)$/gm)].map((m) => m[1].trim())
    : [];
  const houseStyle = houseStyleBlockquotes[0] || "";
  const brandColorClause = houseStyleBlockquotes[1] || "";

  // Negative Prompt (section 12)
  const negativeSection = raw.match(/# 12\. Negative Prompt([\s\S]*?)(?=\n# )/);
  const negativePrompt = negativeSection ? extractBlockquote(negativeSection[1]) || "" : "";

  // Universal Prompt Template (section 11) — fallback when no subject matches well.
  const universalSection = raw.match(/# 11\. Universal Prompt Template([\s\S]*?)(?=\n# )/);
  const universalTemplate = universalSection ? extractBlockquote(universalSection[1]) || "" : "";

  // Numbered subject sections 1-9 ("# N. Category Name" containing "## Subject" + "> prompt" pairs).
  const subjects: ImageSubject[] = [];
  const sectionMatches = [...raw.matchAll(/^# (\d+)\. (.+)$([\s\S]*?)(?=^# \d+\.|$(?![\s\S]))/gm)];
  for (const sectionMatch of sectionMatches) {
    const sectionNumber = sectionMatch[1];
    const category = SECTION_CATEGORY[sectionNumber];
    if (!category) continue; // sections 10-14 are formatting/checklist rules, not subjects

    const categoryLabel = sectionMatch[2].trim();
    const body = sectionMatch[3];
    const subjectMatches = [...body.matchAll(/^## (.+)$\n\n> (.+)$/gm)];
    for (const subjectMatch of subjectMatches) {
      const title = subjectMatch[1].trim();
      const template = subjectMatch[2].trim();
      subjects.push({
        id: `${category}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
        category,
        categoryLabel,
        title,
        template,
        keywords: keywordsFromTitle(title),
      });
    }
  }

  return { houseStyle, brandColorClause, negativePrompt, universalTemplate, subjects };
}

let cachedConfig: ImagePromptConfig | null = null;

export function loadImagePromptConfig(): ImagePromptConfig {
  if (cachedConfig) return cachedConfig;

  // Both documents must be present — per SKILL.md's own instruction, stop
  // rather than invent replacement rules if either is unreadable.
  const guidelinesRaw = readDoc(GUIDELINES_PATH);
  const libraryRaw = readDoc(LIBRARY_PATH);
  if (!guidelinesRaw.trim()) throw new MissingReferenceDocError(GUIDELINES_PATH);

  const parsed = parseImagePromptLibrary(libraryRaw);
  if (parsed.subjects.length === 0 || !parsed.houseStyle || !parsed.negativePrompt) {
    throw new Error(
      "docs/image-prompt-library.md could not be parsed into usable prompt rules (house style, negative prompt, or subject templates missing)."
    );
  }

  cachedConfig = parsed;
  return cachedConfig;
}

export interface ImageContextHints {
  pageTitle?: string;
  pageCategory?: string;
  sectionHeading?: string;
  imageTitle?: string;
  altText?: string;
  placeholderLabel?: string;
  topic?: string;
}

// Used ONLY to pick which library subject matches — deliberately narrower than
// what's available for the fallback description (below). imageTitle/sectionHeading/
// pageCategory are meant to hold a specific, purpose-written image description
// (an AI-authored placeholder label, an imagePromptSuggestion). altText/topic/
// placeholderLabel/pageTitle are often just the article title or a templated
// marketing caption restating it — broad prose that happens to contain generic
// words ("surgery", "recovery", "timeline") which can coincidentally match an
// unrelated subject's title outright. Matching only the specific fields means a
// generic caption correctly falls through to the Universal Template instead of
// confidently picking the wrong clinical subject.
function matchingText(hints: ImageContextHints): string {
  return [hints.imageTitle, hints.sectionHeading, hints.pageCategory]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

// How many subjects share each keyword — used only to break ties between subjects
// that match the same number of keywords, preferring the more specific one
// ("meniscal" appears in 1-2 subjects) over the more generic one ("acl" appears
// in 6+). It must NOT be the primary score: weighting by rarity alone let a single
// coincidental rare-word match (e.g. "joint", unique to one title) outscore a
// genuine two-word match elsewhere — rarity is a tiebreaker, not a substitute for
// how many of a subject's own keywords actually showed up.
function buildDocFrequency(subjects: ImageSubject[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const subject of subjects) {
    for (const kw of new Set(subject.keywords)) {
      freq.set(kw, (freq.get(kw) || 0) + 1);
    }
  }
  return freq;
}

export function detectImageContext(
  hints: ImageContextHints,
  config: ImagePromptConfig = loadImagePromptConfig()
): { subject: ImageSubject; matchedKeywords: string[]; isFallback: boolean } {
  const text = matchingText(hints);
  const docFreq = buildDocFrequency(config.subjects);

  let best: ImageSubject | null = null;
  let bestCount = 0;
  let bestIdfSum = 0;
  let bestMatched: string[] = [];

  // Whole-word membership, not substring containment — text.includes("high")
  // matched inside "thighbone", scoring "High Tibial Osteotomy" for an ACL
  // reconstruction description that never mentions the hip or a tibial osteotomy.
  const textWords = new Set(text.split(/[^a-z0-9]+/).filter(Boolean));

  for (const subject of config.subjects) {
    const matched = subject.keywords.filter((kw) => textWords.has(kw));
    if (matched.length === 0) continue;
    const idfSum = matched.reduce((sum, kw) => sum + 1 / (docFreq.get(kw) || 1), 0);
    const isBetter = matched.length > bestCount || (matched.length === bestCount && idfSum > bestIdfSum);
    if (isBetter) {
      bestCount = matched.length;
      bestIdfSum = idfSum;
      best = subject;
      bestMatched = matched;
    }
  }

  // A single matched keyword isn't enough evidence on its own unless that one
  // word is genuinely specific — "joint" matched a knee-desk still-life photo
  // and confidently mislabelled it "Generic Knee Joint Injection" even though
  // nothing about injections was mentioned; "joint" is rare across subject
  // *titles* (this scoring's only source of rarity data) but it's a completely
  // ordinary anatomical word, not a real signal. Length is a rough proxy for
  // specificity here: short common words ("acl", "pain", "joint") need a second
  // corroborating match; longer, unambiguous clinical terms ("meniscal",
  // "arthrosamid", "patellofemoral") are trustworthy alone.
  const bestIsConfident = bestCount >= 2 || (bestCount === 1 && bestMatched[0]?.length >= 8);

  if (best && bestIsConfident) {
    return { subject: best, matchedKeywords: bestMatched, isFallback: false };
  }

  // No confident match — fall back to normal anatomy as a safe, always-knee-related default.
  const fallback =
    config.subjects.find((s) => s.category === "anatomy") || config.subjects[0];
  return { subject: fallback, matchedKeywords: [], isFallback: true };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

// Illustration vs photograph. The reference docs (image-prompt-library.md,
// medical-imagery-guidelines.md) only define house style for anatomical
// illustrations — appropriate for the subject-matched templates (diagrams of
// internal knee structures, injection technique, surgical steps), which
// can't be photographed anyway. But most fallback cases are real-world
// scenes (a patient icing their knee at home, a bedroom at night, someone at
// a desk) for blog/social content, which read as a photo, not a diagram —
// forcing "medical illustration" language onto those was producing drawings
// when a realistic photo was wanted. These two style constants are code-
// defined rather than doc-derived since they're mechanical AI-generation
// guardrails, not clinical/editorial policy the docs are meant to own.
export type ImageStyle = "illustration" | "photo";

const PHOTO_HOUSE_STYLE =
  "Realistic, natural-looking photograph — photojournalistic style, natural lighting and shadows, authentic and candid rather than overly staged, true-to-life skin tones and textures, natural depth of field, suitable for a UK private orthopaedic clinic's website or social media.";

const PHOTO_NEGATIVE_PROMPT =
  "Avoid: illustration, drawing, cartoon, clipart, 3D render, CGI, painting, sketch, diagram, uncanny or distorted faces, extra or malformed fingers/limbs, unnatural or plastic-looking skin, unrealistic lighting, text, misspelled labels, logos, watermarks, borders, frames, low resolution, blurry, oversaturated colours, exaggerated expressions, medical gore, blood, graphic surgical content.";

export type ImageFormat = "desktop" | "tablet" | "mobile-square" | "mobile-portrait";

export const FORMAT_ASPECT_RATIOS: Record<ImageFormat, string> = {
  desktop: "16:9",
  tablet: "4:3",
  "mobile-square": "1:1",
  "mobile-portrait": "9:16",
};

export const FORMAT_LABELS: Record<ImageFormat, string> = {
  desktop: "Desktop Landscape (16:9)",
  tablet: "Tablet (4:3)",
  "mobile-square": "Mobile Square (1:1)",
  "mobile-portrait": "Mobile Portrait (9:16)",
};

export interface BuiltPrompt {
  category: ImageCategory;
  categoryLabel: string;
  subjectTitle: string;
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  proposedFilename: string;
  proposedAltText: string;
  isFallback: boolean;
  style: ImageStyle;
}

export function buildImagePrompt(
  hints: ImageContextHints,
  format: ImageFormat = "desktop",
  transparentBackground: boolean = false,
  style?: ImageStyle
): BuiltPrompt {
  const config = loadImagePromptConfig();
  const { subject, isFallback } = detectImageContext(hints, config);

  // Fallback (no specific anatomical subject matched) almost always means a
  // real-world scene rather than an internal-anatomy diagram, so default to a
  // photo there; a matched subject is a library illustration template that
  // can't sensibly become a photo (you can't photograph a cross-section of a
  // ligament). Either way the caller can still override explicitly.
  const resolvedStyle: ImageStyle = style || (isFallback ? "photo" : "illustration");

  // Priority matters here: placeholderLabel is a rich content description for blog
  // placeholders, but for social platform cards it's sometimes just a generic
  // surface name ("Facebook Post") — putting topic/altText (the actual caption
  // text) ahead of it means the fallback describes the real subject instead of
  // literally naming the platform.
  const fallbackSubjectDescription =
    hints.imageTitle || hints.topic || hints.altText || hints.placeholderLabel || "general knee health and care";

  let subjectPrompt: string;
  let houseStyle: string;
  let negativePrompt: string;

  if (resolvedStyle === "photo") {
    subjectPrompt = `Create a realistic photograph relevant to: ${fallbackSubjectDescription}.`;
    houseStyle = PHOTO_HOUSE_STYLE;
    negativePrompt = PHOTO_NEGATIVE_PROMPT;
  } else if (isFallback) {
    // The Universal Template (docs section 11) is written as prose guidance for a
    // human/AI to compose a prompt from, with several [bracketed] slots — it isn't
    // meant for a single mechanical .replace(). Filling in only "[specific knee
    // subject]" left the rest ("[goal]", "[required structures or pathology]", etc.)
    // as literal bracket text sent straight to the image model. Since no specific
    // library subject matched, there's no real structure/pathology/goal to name
    // anyway — a plain, clean description plus the house style is more accurate
    // than fabricating values for slots we don't actually have answers for.
    subjectPrompt = `Create an anatomically accurate, realistic 2D medical illustration relevant to: ${fallbackSubjectDescription}.`;
    houseStyle = config.houseStyle;
    negativePrompt = config.negativePrompt;
  } else {
    subjectPrompt = subject.template;
    houseStyle = config.houseStyle;
    negativePrompt = config.negativePrompt;
  }

  const promptParts = [subjectPrompt, houseStyle];
  if (transparentBackground) {
    promptParts.push(
      "Isolated subject on a transparent background, suitable for a PNG/WebP asset with alpha transparency — no background scene or surface."
    );
  }
  const prompt = promptParts.join(" ");

  const topicSlug = slugify(hints.topic || hints.pageTitle || subject.title);
  const variant = isFallback ? "custom" : slugify(subject.title).split("-").slice(0, 2).join("-");
  // A short unique suffix by default — without it, regenerating for the same
  // placeholder (same category/topic/subject) always proposes the exact same
  // filename, so the resulting public URL never changes and the browser/React
  // keeps showing the old cached image even after a successful new generation.
  // Still fully editable in the preview modal for anyone who wants a stable,
  // intentionally-reusable name.
  const uniqueSuffix = Date.now().toString(36).slice(-5);
  const proposedFilename = `${subject.category}-${topicSlug}-${variant}-${uniqueSuffix}.webp`;

  const mediumLabel = resolvedStyle === "photo" ? "Photograph" : "Illustration";
  const proposedAltText = isFallback
    ? `${mediumLabel} related to ${hints.imageTitle || hints.topic || "knee care"}, for patient education.`
    : `${subject.title} — illustration for patient education on ${hints.topic || hints.pageTitle || "knee care"}.`;

  return {
    category: subject.category,
    categoryLabel: subject.categoryLabel,
    subjectTitle: subject.title,
    prompt,
    negativePrompt,
    aspectRatio: FORMAT_ASPECT_RATIOS[format],
    proposedFilename,
    proposedAltText,
    isFallback,
    style: resolvedStyle,
  };
}
