import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getStoreValue } from "./dataStore";
import { sendContentPipelineNotificationEmail } from "./graphMail";
import { performResearchProcess, ResearchBrief } from "./researchAgent";
export type { ResearchBrief } from "./researchAgent";
import { writeBlogDraft, writeTechnicalArticleDraft } from "./blogWriterAgent";
import { linkRunToArticle, getArticleSlugForRun, setArticleOverride, publishBlogDraftToWebsite, cleanClinicalReviewFlags } from "./educationArticles";
import { writeSocialCaptions, rewriteSocialCaption, rewriteCarouselSlides } from "./socialWriterAgent";
import { syncLinkedSocialOnlyPosts } from "./socialOnlyPosts";
import { syncPollTopicsIntoDynamicTopics } from "./pollTopicsSync";
import { notifyTopicSubscribers } from "./topicNotify";
import { blogArticles } from "@/data/articles";
import { SITE_URL } from "./site";

export type RunStatus =
  | "researching"
  | "writing_blog"
  | "awaiting_blog_approval"
  | "writing_social"
  | "awaiting_social_approval"
  | "published"
  | "abandoned";

export interface BlogDraftVersion {
  version: number;
  // Layman blog fields
  title: string;
  excerpt: string;
  body_markdown?: string;
  body?: string;
  suggested_images: Array<string | { placeholderId?: string; label: string; url?: string; isFeatured?: boolean }>;
  references: string[];
  flags: string[];
  category?: string;
  created_at: string;
  // AI-generated FAQs — drives both the on-page FAQ accordion and FAQPage
  // structured data (see educationArticles.ts's publishBlogDraftToWebsite).
  faqs?: Array<{ question: string; answer: string }>;

  // Technical article fields
  article_title?: string;
  article_excerpt?: string;
  article_body_markdown?: string;
  article_body?: string;
  article_suggested_images?: Array<string | { placeholderId?: string; label: string; url?: string; isFeatured?: boolean }>;
  article_references?: string[];
  article_flags?: string[];
  article_faqs?: Array<{ question: string; answer: string }>;
}

export interface SocialCaptionPlatform {
  caption: string;
  status: "pending" | "approved";
  imageUrl?: string;
  script?: string;
  imagePromptSuggestion?: string;
}

export interface SocialDraftVersion {
  version: number;
  instagram: SocialCaptionPlatform;
  facebook: SocialCaptionPlatform;
  linkedin: SocialCaptionPlatform;
  instagramStory?: SocialCaptionPlatform;
  instagramCarousel?: {
    caption: string;
    imagePromptSuggestion: string;
    slides: Array<{ slideNumber: number; text: string; imagePromptSuggestion: string; imageUrl?: string }>;
    status: "pending" | "approved";
  };
  instagramReel?: {
    caption: string;
    imagePromptSuggestion: string;
    script: string;
    status: "pending" | "approved";
    videoUrl?: string;
    videoSource?: "upload" | "ai-broll";
    // Static cover/thumbnail image shown before the video plays — distinct
    // from videoUrl. Defaults to the blog's hero image (see run.social_drafts
    // initialization below) so there's something to review immediately.
    coverImageUrl?: string;
  };
  created_at: string;
}

export interface ContentPipelineRun {
  id: string;
  run_id: string;
  topic: string;
  triggered_by?: string;
  topic_source?: string;
  status: RunStatus;
  research_brief?: ResearchBrief | null;
  blog_drafts: BlogDraftVersion[];
  social_drafts: SocialDraftVersion[];
  published_urls?: {
    blog_url?: string;
    published_at?: string;
  } | null;
  social_media_assets?: Array<{ platform: string; asset_url: string }> | null;
  created_at: string;
  updated_at: string;
}

export interface ContentPipelineReview {
  id?: string;
  review_id?: string;
  run_id: string;
  stage: "blog" | "social";
  platform?: "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel";
  version?: number;
  decision: "approved" | "edited" | "revision_requested" | "revert_to_blog" | "revert_to_social" | "save_progress" | "publish_blog";
  edited_content?: any;
  revision_notes?: string;
  created_at: string;
}

const RUNS_FILE_PATH = path.join(process.cwd(), "data", "content-pipeline-runs.json");
const REVIEWS_FILE_PATH = path.join(process.cwd(), "data", "content-pipeline-reviews.json");

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !url.startsWith("http")) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function mapRowToRun(row: any): ContentPipelineRun {
  return {
    id: row.run_id || row.id || `run-${Date.now()}`,
    run_id: row.run_id || row.id || `run-${Date.now()}`,
    topic: row.topic || "",
    triggered_by: row.triggered_by || "manual",
    topic_source: row.topic_source || "trending_enquiry",
    status: row.status || "researching",
    research_brief: row.research_brief || null,
    blog_drafts: Array.isArray(row.blog_drafts) ? row.blog_drafts : [],
    social_drafts: Array.isArray(row.social_drafts) ? row.social_drafts : [],
    published_urls: row.published_urls || null,
    social_media_assets: row.social_media_assets || null,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

function mapRunToRow(run: ContentPipelineRun): any {
  return {
    run_id: run.run_id || run.id,
    topic: run.topic,
    triggered_by: run.triggered_by || "manual",
    topic_source: run.topic_source || "trending_enquiry",
    status: run.status,
    research_brief: run.research_brief || null,
    blog_drafts: run.blog_drafts || [],
    social_drafts: run.social_drafts || [],
    published_urls: run.published_urls || null,
    social_media_assets: run.social_media_assets || null,
    created_at: run.created_at,
    updated_at: run.updated_at,
  };
}

function mapRowToReview(row: any): ContentPipelineReview {
  return {
    id: row.review_id || row.id || `rev-${Date.now()}`,
    review_id: row.review_id || row.id || `rev-${Date.now()}`,
    run_id: row.run_id,
    stage: row.stage,
    platform: row.platform || undefined,
    version: row.version || 1,
    decision: row.decision,
    edited_content: row.edited_content || null,
    revision_notes: row.revision_notes || undefined,
    created_at: row.created_at || new Date().toISOString(),
  };
}

function mapReviewToRow(review: ContentPipelineReview): any {
  // content_pipeline_reviews has no `platform` column (confirmed against the live
  // schema) — including it made PostgREST reject the insert outright, so every review
  // this session silently failed to reach Supabase (the table was completely empty).
  // `platform` is still kept on the local disk copy (ContentPipelineReview / the
  // JSON fallback file aren't schema-constrained).
  return {
    review_id: review.review_id || review.id || crypto.randomUUID(),
    run_id: review.run_id,
    stage: review.stage,
    version: review.version || 1,
    decision: review.decision,
    edited_content: review.edited_content || null,
    revision_notes: review.revision_notes || null,
    created_at: review.created_at,
  };
}

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

export function readRunsFromDisk(): ContentPipelineRun[] {
  try {
    if (!fs.existsSync(RUNS_FILE_PATH)) return [];
    const raw = fs.readFileSync(RUNS_FILE_PATH, "utf8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error("Error reading content_pipeline_runs:", err);
    return [];
  }
}

export function writeRunsToDisk(runs: ContentPipelineRun[]): boolean {
  try {
    ensureDirectoryExistence(RUNS_FILE_PATH);
    fs.writeFileSync(RUNS_FILE_PATH, JSON.stringify(runs, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing content_pipeline_runs:", err);
    return false;
  }
}

export function readReviewsFromDisk(): ContentPipelineReview[] {
  try {
    if (!fs.existsSync(REVIEWS_FILE_PATH)) return [];
    const raw = fs.readFileSync(REVIEWS_FILE_PATH, "utf8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error("Error reading content_pipeline_reviews:", err);
    return [];
  }
}

export function writeReviewsToDisk(reviews: ContentPipelineReview[]): boolean {
  try {
    ensureDirectoryExistence(REVIEWS_FILE_PATH);
    fs.writeFileSync(REVIEWS_FILE_PATH, JSON.stringify(reviews, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing content_pipeline_reviews:", err);
    return false;
  }
}

/**
 * List all content pipeline runs, sorted most recent first.
 * Supports filtering by status parameter.
 * Queries Supabase REST API when configured, with local disk fallback.
 */
export async function getPipelineRuns(statusFilter?: string): Promise<ContentPipelineRun[]> {
  const config = getSupabaseConfig();
  if (config) {
    try {
      // Ordered by updated_at (not created_at) so a run you just saved progress
      // on — however old it is — bubbles to the top instead of staying buried
      // at its original creation position.
      let endpoint = `${config.url}/rest/v1/content_pipeline_runs?select=*&order=updated_at.desc`;
      if (statusFilter) {
        endpoint = `${config.url}/rest/v1/content_pipeline_runs?select=*&status=eq.${encodeURIComponent(statusFilter)}&order=updated_at.desc`;
      }
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map(mapRowToRun);
        }
      } else {
        console.error("Supabase API error fetching pipeline runs:", res.status, await res.text());
      }
    } catch (err) {
      console.error("Error fetching pipeline runs from Supabase:", err);
    }
  }

  // Local disk fallback
  let runs = readRunsFromDisk();
  if (statusFilter) {
    runs = runs.filter((r) => r.status === statusFilter);
  }
  runs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  return runs;
}

/**
 * Get single run with complete detail and associated review history
 * Queries Supabase REST API when configured, with local disk fallback.
 */
export async function getPipelineRunDetail(runId: string): Promise<{
  run: ContentPipelineRun | null;
  reviews: ContentPipelineReview[];
}> {
  const config = getSupabaseConfig();
  if (config) {
    try {
      const runEndpoint = `${config.url}/rest/v1/content_pipeline_runs?select=*&run_id=eq.${encodeURIComponent(runId)}`;
      const reviewsEndpoint = `${config.url}/rest/v1/content_pipeline_reviews?select=*&run_id=eq.${encodeURIComponent(runId)}&order=created_at.desc`;

      const [runRes, reviewsRes] = await Promise.all([
        fetch(runEndpoint, {
          method: "GET",
          headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
        }),
        fetch(reviewsEndpoint, {
          method: "GET",
          headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
        }),
      ]);

      let run: ContentPipelineRun | null = null;
      let reviews: ContentPipelineReview[] = [];

      if (runRes.ok) {
        const runData = await runRes.json();
        if (Array.isArray(runData) && runData.length > 0) {
          run = mapRowToRun(runData[0]);
        }
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        if (Array.isArray(reviewsData)) {
          reviews = reviewsData.map(mapRowToReview);
        }
      }

      if (run) {
        return { run, reviews };
      }
    } catch (err) {
      console.error("Error fetching run detail from Supabase:", err);
    }
  }

  // Local disk fallback
  const runs = readRunsFromDisk();
  const run = runs.find((r) => r.run_id === runId || r.id === runId) || null;
  const reviews = readReviewsFromDisk()
    .filter((rev) => rev.run_id === runId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { run, reviews };
}

// Permanently removes a run (and its review history) — used when a draft isn't worth
// continuing. Deletes from Supabase (if configured) and the local disk fallback.
export async function deletePipelineRun(runId: string): Promise<void> {
  const config = getSupabaseConfig();
  if (config) {
    try {
      await fetch(`${config.url}/rest/v1/content_pipeline_reviews?run_id=eq.${encodeURIComponent(runId)}`, {
        method: "DELETE",
        headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
      });
      await fetch(`${config.url}/rest/v1/content_pipeline_runs?run_id=eq.${encodeURIComponent(runId)}`, {
        method: "DELETE",
        headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
      });
    } catch (err) {
      console.error("Error deleting run from Supabase:", err);
    }
  }

  const runs = readRunsFromDisk().filter((r) => r.run_id !== runId && r.id !== runId);
  writeRunsToDisk(runs);

  const reviews = readReviewsFromDisk().filter((rev) => rev.run_id !== runId);
  writeReviewsToDisk(reviews);
}

/**
 * Trigger a new run. Automatically executes Stage 1 Research (PubMed NCBI Entrez API search)
 * to populate genuine clinical literature citations and indications into research_brief.
 */
// Patches an already-persisted run's mutable fields in both Supabase and the local
// disk cache. Shared by the background generation job and other update paths so a
// run can be saved mid-flight (e.g. status "researching" -> "writing_blog") without
// waiting for the whole pipeline to finish.
async function patchRunInStorage(run: ContentPipelineRun): Promise<void> {
  const config = getSupabaseConfig();
  if (config) {
    try {
      const endpoint = `${config.url}/rest/v1/content_pipeline_runs?run_id=eq.${encodeURIComponent(run.run_id)}`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          status: run.status,
          research_brief: run.research_brief || null,
          blog_drafts: run.blog_drafts,
          social_drafts: run.social_drafts,
          published_urls: run.published_urls || null,
          social_media_assets: run.social_media_assets || null,
          updated_at: run.updated_at,
        }),
      });
      if (!res.ok) {
        console.error("Supabase PATCH run error:", res.status, await res.text());
      }
    } catch (err) {
      console.error("Error patching run in Supabase:", err);
    }
  }

  const runs = readRunsFromDisk();
  const idx = runs.findIndex((r: any) => r.run_id === run.run_id);
  if (idx >= 0) {
    runs[idx] = run;
  } else {
    runs.unshift(run);
  }
  writeRunsToDisk(runs);
}

// Creates and persists a run immediately in a lightweight "researching" state, with
// no research/draft content yet. Deliberately fast (no PubMed or Gemini calls) so the
// HTTP request that creates it can return right away — the slow work happens in
// runPipelineGeneration below, which the caller should NOT await, so a multi-minute
// AI pipeline never gets killed by the hosting platform's reverse-proxy request
// timeout (Hostinger's Node.js hosting, unlike Vercel, enforces one regardless of
// any in-app maxDuration config).
export async function createPendingPipelineRun(customTopic?: string, triggeredBy: string = "manual"): Promise<ContentPipelineRun> {
  let selectedTopic = customTopic?.trim();
  const topicSource = customTopic?.trim() ? "custom_user_input" : "trending_enquiry";

  if (!selectedTopic) {
    try {
      await syncPollTopicsIntoDynamicTopics();
      const topics = await getStoreValue<any[]>("dynamic-topics", []);
      if (topics.length > 0) {
        topics.sort((a: any, b: any) => (b.enquiryCount || 0) - (a.enquiryCount || 0));
        selectedTopic = topics[0].label || topics[0].category;
      }
    } catch {
      // Fallback
    }
  }

  if (!selectedTopic) {
    selectedTopic = "Robotic Total Knee Replacement: Pre-Op Preparation & Recovery Milestones";
  }

  const now = new Date().toISOString();
  // content_pipeline_runs.run_id is a Postgres uuid column — a "run-<timestamp>" style
  // id silently fails every Supabase insert/query for it (logged, not thrown), meaning
  // the run only ever lived in the local disk fallback. Using a real UUID here fixes
  // that for real.
  const newRunId = crypto.randomUUID();

  const newRun: ContentPipelineRun = {
    id: newRunId,
    run_id: newRunId,
    topic: selectedTopic,
    triggered_by: triggeredBy,
    topic_source: topicSource,
    status: "researching",
    research_brief: null,
    blog_drafts: [],
    social_drafts: [],
    published_urls: null,
    social_media_assets: null,
    created_at: now,
    updated_at: now
  };

  await insertNewRunIntoStorage(newRun);
  return newRun;
}

// Shared by createPendingPipelineRun and createRunFromArticle — inserts a brand new
// run into Supabase (if configured) and the local disk cache.
async function insertNewRunIntoStorage(newRun: ContentPipelineRun): Promise<void> {
  const config = getSupabaseConfig();
  if (config) {
    try {
      const endpoint = `${config.url}/rest/v1/content_pipeline_runs`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(mapRunToRow(newRun)),
      });

      if (!res.ok) {
        console.error("Supabase POST run error:", res.status, await res.text());
      }
    } catch (err) {
      console.error("Error inserting run to Supabase:", err);
    }
  }

  const runs = readRunsFromDisk();
  runs.unshift(newRun);
  writeRunsToDisk(runs);
}

// Seeds a new content pipeline run from an already-published Education Hub article
// (data/articles.ts), converting its structured sections/takeaways/faqs into a single
// markdown body so it can go through the exact same Edit Draft workflow — including
// replacing/regenerating images — as a freshly AI-generated draft. The run starts
// straight at "awaiting_blog_approval" (no research/writing stage needed) and is
// linked back to the source article via lib/educationArticles.linkRunToArticle, so
// approving its blog draft writes an instant article override instead of just
// advancing to the social-caption stage.
export async function createRunFromArticle(article: {
  slug: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  references?: string[];
  takeaways?: string[];
  sections: Array<{
    heading?: string;
    content: string;
    isQuote?: boolean;
    isWarning?: boolean;
    inlineImage?: string;
    inlineImageCaption?: string;
  }>;
  faqs?: Array<{ question: string; answer: string }>;
}): Promise<ContentPipelineRun> {
  const bodyParts: string[] = [];
  const suggestedImages: Array<{ placeholderId: string; label: string; url: string; isFeatured?: boolean }> = [];

  if (article.image) {
    const label = `${article.title} — featured image`;
    suggestedImages.push({ placeholderId: "featured-image", label, url: article.image, isFeatured: true });
    bodyParts.push(`[FEATURED IMAGE PLACEHOLDER: ${label}]`);
  }

  let inlineImageCount = 0;
  article.sections.forEach((section) => {
    if (section.heading) {
      bodyParts.push(`### ${section.heading}`);
    }
    bodyParts.push(section.isWarning ? `**⚠️ Important:** ${section.content}` : section.isQuote ? `> ${section.content}` : section.content);
    if (section.inlineImage) {
      inlineImageCount += 1;
      const placeholderId = `placeholder-${inlineImageCount}`;
      const label = section.inlineImageCaption || `${section.heading || article.title} illustration`;
      suggestedImages.push({ placeholderId, label, url: section.inlineImage });
      bodyParts.push(`[IMAGE PLACEHOLDER: ${label}]`);
    }
  });

  if (article.takeaways && article.takeaways.length > 0) {
    bodyParts.push("### Key Takeaways");
    bodyParts.push(article.takeaways.map((t) => `- ${t}`).join("\n"));
  }

  if (article.faqs && article.faqs.length > 0) {
    bodyParts.push("### Frequently Asked Questions");
    article.faqs.forEach((faq) => {
      bodyParts.push(`**${faq.question}**\n\n${faq.answer}`);
    });
  }

  const body = bodyParts.join("\n\n");
  const now = new Date().toISOString();
  const newRunId = crypto.randomUUID();

  const newRun: ContentPipelineRun = {
    id: newRunId,
    run_id: newRunId,
    topic: article.title,
    triggered_by: "manual",
    topic_source: "education_hub_update",
    status: "awaiting_blog_approval",
    research_brief: null,
    blog_drafts: [
      {
        version: 1,
        title: article.title,
        excerpt: article.description,
        body_markdown: body,
        body,
        suggested_images: suggestedImages,
        references: article.references || [],
        flags: [],
        category: article.category,
        created_at: now,
      },
    ],
    social_drafts: [],
    published_urls: null,
    social_media_assets: null,
    created_at: now,
    updated_at: now,
  };

  await insertNewRunIntoStorage(newRun);
  await linkRunToArticle(newRunId, article.slug);

  return newRun;
}

// Runs the slow Stage 1 (PubMed research) + Stage 2 (Gemini blog draft) work for a run
// already created via createPendingPipelineRun, patching progress into storage as it
// goes. Intended to be started without awaiting so it survives past the HTTP response.
export async function runPipelineGeneration(run: ContentPipelineRun, providedBrief?: ResearchBrief): Promise<void> {
  try {
    // Execute Stage 1 PubMed Literature & Evidence Scan — unless a brief was already
    // researched externally (e.g. via the lincoln-knee-clinic-blog-research skill) and
    // handed in directly, in which case skip straight to drafting with it.
    const researchBrief = providedBrief || await performResearchProcess(run.topic);
    run.research_brief = researchBrief as any;
    run.status = "writing_blog";
    run.updated_at = new Date().toISOString();
    await patchRunInStorage(run);

    const realReferences = researchBrief.sources && researchBrief.sources.length > 0
      ? researchBrief.sources
      : ["NICE Clinical Guidelines on Knee Care", "Journal of Bone and Joint Surgery"];

    // Execute Stage 2: AI Blog Writer & Technical Article Writer in parallel
    let blogDraftData: any;
    let articleDraftData: any;
    
    try {
      const [blogRes, articleRes] = await Promise.all([
        writeBlogDraft(run.topic, researchBrief as any).catch((err) => {
          console.error("Stage 2 Blog Writer failed:", err);
          const errorMessage = err?.message || String(err);
          return {
            title: `[GENERATION ERROR] ${run.topic}`,
            excerpt: `The AI Blog Writer encountered an error: ${errorMessage}`,
            body: `### ⚠️ Stage 2 AI Generation Failed\n\nThe content pipeline attempted to generate a layman blog using Gemini AI, but encountered a system error:\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\n[NEEDS CLINICAL REVIEW] This is an error placeholder, do not publish.`,
            suggestedImages: [] as any[],
            flags: [`[NEEDS CLINICAL REVIEW] AI generation failed with error: ${errorMessage}`],
          };
        }),
        writeTechnicalArticleDraft(run.topic, researchBrief as any).catch((err) => {
          console.error("Stage 2 Technical Article Writer failed:", err);
          const errorMessage = err?.message || String(err);
          return {
            title: `[GENERATION ERROR] ${run.topic} (Clinical Depth)`,
            excerpt: `The AI Technical Article Writer encountered an error: ${errorMessage}`,
            body: `### ⚠️ Stage 2 AI Generation Failed\n\nThe content pipeline attempted to generate a technical deep dive using Gemini AI, but encountered a system error:\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\n[NEEDS CLINICAL REVIEW] This is an error placeholder, do not publish.`,
            suggestedImages: [] as any[],
            flags: [`[NEEDS CLINICAL REVIEW] AI generation failed with error: ${errorMessage}`],
          };
        })
      ]);
      blogDraftData = blogRes;
      articleDraftData = articleRes;
    } catch (err: any) {
      console.error("Stage 2 parallel drafting failed:", err);
      const errorMessage = err?.message || String(err);
      blogDraftData = {
        title: `[GENERATION ERROR] ${run.topic}`,
        excerpt: `The drafting process encountered an error: ${errorMessage}`,
        body: `### ⚠️ Stage 2 AI Generation Failed\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\n[NEEDS CLINICAL REVIEW] AI generation failed with error: ${errorMessage}`,
        suggestedImages: [] as any[],
        flags: [`[NEEDS CLINICAL REVIEW] AI generation failed with error: ${errorMessage}`],
      };
      articleDraftData = {
        title: `[GENERATION ERROR] ${run.topic} (Clinical Depth)`,
        excerpt: `The drafting process encountered an error: ${errorMessage}`,
        body: `### ⚠️ Stage 2 AI Generation Failed\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\n[NEEDS CLINICAL REVIEW] AI generation failed with error: ${errorMessage}`,
        suggestedImages: [] as any[],
        flags: [`[NEEDS CLINICAL REVIEW] AI generation failed with error: ${errorMessage}`],
      };
    }

    const now = new Date().toISOString();
    run.blog_drafts = [
      {
        version: 1,
        title: blogDraftData.title,
        excerpt: blogDraftData.excerpt,
        body_markdown: blogDraftData.body_markdown || blogDraftData.body,
        body: blogDraftData.body_markdown || blogDraftData.body,
        suggested_images: blogDraftData.suggestedImages,
        references: realReferences,
        flags: blogDraftData.flags,
        category: undefined,
        created_at: now,
        faqs: blogDraftData.faqs || [],

        // Technical article fields
        article_title: articleDraftData.title,
        article_excerpt: articleDraftData.excerpt,
        article_body_markdown: articleDraftData.body_markdown || articleDraftData.body,
        article_body: articleDraftData.body_markdown || articleDraftData.body,
        article_suggested_images: articleDraftData.suggestedImages,
        article_references: articleDraftData.references || realReferences,
        article_flags: articleDraftData.flags,
        article_faqs: articleDraftData.faqs || [],
      }
    ];
    run.status = "awaiting_blog_approval";
    run.updated_at = now;
    await patchRunInStorage(run);

    await sendContentPipelineNotificationEmail(run, "blog");
  } catch (err: any) {
    // Stage 1 (research) itself failed — surface a reviewable error draft rather than
    // leaving the run stuck in "researching" forever with no visible explanation.
    console.error("Pipeline generation failed:", err);
    const errorMessage = err?.message || String(err);
    const now = new Date().toISOString();
    run.blog_drafts = [
      {
        version: 1,
        title: `[GENERATION ERROR] ${run.topic}`,
        excerpt: `The content pipeline encountered an error during research: ${errorMessage}`,
        body_markdown: `### ⚠️ Stage 1 Research Failed\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\n[NEEDS CLINICAL REVIEW] This is an error placeholder, do not publish.`,
        body: `### ⚠️ Stage 1 Research Failed\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\n[NEEDS CLINICAL REVIEW] This is an error placeholder, do not publish.`,
        suggested_images: [],
        references: [],
        flags: [`[NEEDS CLINICAL REVIEW] Pipeline generation failed with error: ${errorMessage}`],
        created_at: now
      }
    ];
    run.status = "awaiting_blog_approval";
    run.updated_at = now;
    await patchRunInStorage(run);
  }
}

// Legacy synchronous helper — creates a run and waits for the full pipeline to finish
// before returning. Kept for the (currently unused-by-the-dashboard) research/route.ts
// caller; the live "Start New Run" button in the dashboard uses the split
// createPendingPipelineRun + runPipelineGeneration functions above instead so it isn't
// subject to the hosting platform's request timeout.
export async function triggerPipelineRun(customTopic?: string): Promise<ContentPipelineRun> {
  const run = await createPendingPipelineRun(customTopic);
  await runPipelineGeneration(run);
  return run;
}

/**
 * Submit a review decision (approved | edited | revision_requested) for blog or social stage.
 * Supports independent per-platform decisions for social stage ("instagram" | "facebook" | "linkedin").
 * Transitions run status to "published" ONLY when all 3 social platforms are approved.
 */
export async function submitPipelineReview(
  runId: string,
  payload: {
    stage: "blog" | "social";
    platform?: "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel";
    decision: "approved" | "edited" | "revision_requested" | "revert_to_blog" | "revert_to_social" | "save_progress" | "publish_blog";
    editedContent?: any;
    revisionNotes?: string;
  }
): Promise<{ success: boolean; run: ContentPipelineRun | null; review: ContentPipelineReview }> {
  // Fetch current run detail
  const { run: existingRun } = await getPipelineRunDetail(runId);
  const runs = readRunsFromDisk();
  const runIndex = runs.findIndex((r) => r.run_id === runId || r.id === runId);

  const run = existingRun || (runIndex >= 0 ? runs[runIndex] : null);

  if (!run) {
    throw new Error(`Run ${runId} not found`);
  }

  const now = new Date().toISOString();
  const currentVersion = payload.stage === "blog" ? (run.blog_drafts?.[0]?.version || 1) : (run.social_drafts?.[0]?.version || 1);

  // Create review log
  // content_pipeline_reviews.review_id is also a uuid column — same issue as run_id
  // above. A "rev-<timestamp>" id here silently failed every insert (the table was
  // completely empty as a result), so every review this session only ever existed on
  // disk, never in Supabase.
  const newReviewId = crypto.randomUUID();
  const newReview: ContentPipelineReview = {
    id: newReviewId,
    review_id: newReviewId,
    run_id: run.run_id,
    stage: payload.stage,
    platform: payload.platform || undefined,
    version: currentVersion,
    decision: payload.decision,
    edited_content: payload.editedContent || null,
    revision_notes: payload.revisionNotes || undefined,
    created_at: now
  };

  // Process State Transitions
  if (payload.decision === "revert_to_blog") {
    run.status = "awaiting_blog_approval";
    run.published_urls = null;
    run.social_media_assets = null;
    if (run.social_drafts && run.social_drafts.length > 0) {
      const socialDraft = run.social_drafts[0];
      socialDraft.instagram.status = "pending";
      socialDraft.facebook.status = "pending";
      socialDraft.linkedin.status = "pending";
    }
  } else if (payload.decision === "revert_to_social") {
    run.status = "awaiting_social_approval";
    run.published_urls = null;
    run.social_media_assets = null;
    if (run.social_drafts && run.social_drafts.length > 0) {
      const socialDraft = run.social_drafts[0];
      socialDraft.instagram.status = "pending";
      socialDraft.facebook.status = "pending";
      socialDraft.linkedin.status = "pending";
    }
  } else if (payload.decision === "save_progress") {
    if (payload.stage === "blog" && payload.editedContent) {
      if (run.blog_drafts && run.blog_drafts.length > 0) {
        const latestDraft = run.blog_drafts[0];
        latestDraft.title = payload.editedContent.title || latestDraft.title;
        latestDraft.excerpt = payload.editedContent.excerpt || latestDraft.excerpt;
        latestDraft.body_markdown = payload.editedContent.body_markdown || payload.editedContent.body || latestDraft.body_markdown;
        latestDraft.body = latestDraft.body_markdown;
        latestDraft.suggested_images = payload.editedContent.suggestedImages || latestDraft.suggested_images;
        latestDraft.references = payload.editedContent.references || latestDraft.references;
        latestDraft.flags = payload.editedContent.flags || latestDraft.flags;
        latestDraft.category = payload.editedContent.category !== undefined ? payload.editedContent.category : latestDraft.category;
        latestDraft.faqs = payload.editedContent.faqs || latestDraft.faqs;

        // Also save technical article edits if provided
        latestDraft.article_title = payload.editedContent.article_title || latestDraft.article_title;
        latestDraft.article_excerpt = payload.editedContent.article_excerpt || latestDraft.article_excerpt;
        latestDraft.article_body_markdown = payload.editedContent.article_body_markdown || payload.editedContent.article_body || latestDraft.article_body_markdown;
        latestDraft.article_body = latestDraft.article_body_markdown;
        latestDraft.article_suggested_images = payload.editedContent.article_suggested_images || latestDraft.article_suggested_images;
        latestDraft.article_references = payload.editedContent.article_references || latestDraft.article_references;
        latestDraft.article_flags = payload.editedContent.article_flags || latestDraft.article_flags;
        latestDraft.article_faqs = payload.editedContent.article_faqs || latestDraft.article_faqs;
      }
    } else if (payload.stage === "social" && payload.editedContent) {
      if (run.social_drafts && run.social_drafts.length > 0) {
        const latestSocial = run.social_drafts[0];
        if (latestSocial.instagram && payload.editedContent.instagram) {
          latestSocial.instagram.caption = payload.editedContent.instagram.caption || latestSocial.instagram.caption;
        }
        if (latestSocial.facebook && payload.editedContent.facebook) {
          latestSocial.facebook.caption = payload.editedContent.facebook.caption || latestSocial.facebook.caption;
        }
        if (latestSocial.linkedin && payload.editedContent.linkedin) {
          latestSocial.linkedin.caption = payload.editedContent.linkedin.caption || latestSocial.linkedin.caption;
        }
      }
    }
  } else if (payload.stage === "blog") {
    if (payload.decision === "approved" || payload.decision === "edited" || payload.decision === "publish_blog") {
      if ((payload.decision === "edited" || payload.decision === "publish_blog") && payload.editedContent) {
        const latestVersionNumber = (run.blog_drafts?.[0]?.version || 1) + 1;
        const editedBody = payload.editedContent.body_markdown || payload.editedContent.body || "";
        const editedArticleBody = payload.editedContent.article_body_markdown || payload.editedContent.article_body || "";

        // Scan body for any remaining [IMAGE PLACEHOLDER: ...] markers (i.e. ones not yet replaced
        // with real ![alt](url) syntax). Build suggested_images from these, preserving any URLs that
        // were set during the editing session (via payload.editedContent.suggestedImages) or from
        // the previous saved draft.
        const placeholderRegex = /\[IMAGE PLACEHOLDER:\s*(.*?)\]/gi;
        let match;
        // Carry over any non-placeholder suggestedImages (e.g. string URLs for featured images)
        const payloadImages: any[] = payload.editedContent.suggestedImages || [];
        const previousImages: any[] = run.blog_drafts[0]?.suggested_images || [];
        const suggestedImages: any[] = payloadImages.filter((img: any) => typeof img === "string");
        let count = 1;

        while ((match = placeholderRegex.exec(editedBody)) !== null) {
          const label = match[1].trim();
          // Check payload images first (most up-to-date), then fall back to previous draft images
          const payloadResolved = payloadImages.find(
            (img: any) =>
              typeof img === "object" &&
              img !== null &&
              img.label?.trim().toLowerCase() === label.toLowerCase()
          ) as any;
          const previousResolved = previousImages.find(
            (img: any) =>
              typeof img === "object" &&
              img !== null &&
              img.label?.trim().toLowerCase() === label.toLowerCase()
          ) as any;
          const resolved = payloadResolved || previousResolved;
          suggestedImages.push({
            placeholderId: resolved?.placeholderId || `placeholder-${count++}`,
            label,
            url: resolved?.url || ""
          });
        }

        // Scan article body for any remaining [IMAGE PLACEHOLDER: ...] markers
        const articlePlaceholderRegex = /\[IMAGE PLACEHOLDER:\s*(.*?)\]/gi;
        let articleMatch;
        const payloadArticleImages: any[] = payload.editedContent.article_suggested_images || [];
        const previousArticleImages: any[] = run.blog_drafts[0]?.article_suggested_images || [];
        const articleSuggestedImages: any[] = payloadArticleImages.filter((img: any) => typeof img === "string");
        let articleCount = 1;

        while ((articleMatch = articlePlaceholderRegex.exec(editedArticleBody)) !== null) {
          const label = articleMatch[1].trim();
          const payloadResolved = payloadArticleImages.find(
            (img: any) =>
              typeof img === "object" &&
              img !== null &&
              img.label?.trim().toLowerCase() === label.toLowerCase()
          ) as any;
          const previousResolved = previousArticleImages.find(
            (img: any) =>
              typeof img === "object" &&
              img !== null &&
              img.label?.trim().toLowerCase() === label.toLowerCase()
          ) as any;
          const resolved = payloadResolved || previousResolved;
          articleSuggestedImages.push({
            placeholderId: resolved?.placeholderId || `article-placeholder-${articleCount++}`,
            label,
            url: resolved?.url || ""
          });
        }

        run.blog_drafts.unshift({
          version: latestVersionNumber,
          title: payload.editedContent.title || run.blog_drafts[0]?.title || run.topic,
          excerpt: payload.editedContent.excerpt || run.blog_drafts[0]?.excerpt || "",
          body_markdown: editedBody,
          body: editedBody,
          suggested_images: suggestedImages,
          references: payload.editedContent.references || run.blog_drafts[0]?.references || [],
          flags: payload.editedContent.flags || [],
          category: payload.editedContent.category !== undefined ? payload.editedContent.category : run.blog_drafts[0]?.category,
          created_at: now,
          faqs: payload.editedContent.faqs || run.blog_drafts[0]?.faqs || [],

          // Technical article fields
          article_title: payload.editedContent.article_title || run.blog_drafts[0]?.article_title || "",
          article_excerpt: payload.editedContent.article_excerpt || run.blog_drafts[0]?.article_excerpt || "",
          article_body_markdown: editedArticleBody,
          article_body: editedArticleBody,
          article_suggested_images: articleSuggestedImages,
          article_references: payload.editedContent.article_references || run.blog_drafts[0]?.article_references || [],
          article_flags: payload.editedContent.article_flags || [],
          article_faqs: payload.editedContent.article_faqs || run.blog_drafts[0]?.article_faqs || [],
        });
      }

      // Clean up clinical review flags upon approval
      if (payload.decision === "approved" || payload.decision === "publish_blog") {
        const latestDraft = run.blog_drafts[0];
        if (latestDraft) {
          latestDraft.body_markdown = cleanClinicalReviewFlags(latestDraft.body_markdown || latestDraft.body || "");
          latestDraft.body = latestDraft.body_markdown;
          if (latestDraft.article_body_markdown || latestDraft.article_body) {
            latestDraft.article_body_markdown = cleanClinicalReviewFlags(latestDraft.article_body_markdown || latestDraft.article_body || "");
            latestDraft.article_body = latestDraft.article_body_markdown;
          }
        }
      }

      // If this run was created via createRunFromArticle (an "Update" of an existing
      // Education Hub article rather than a brand new draft), approving the blog draft
      // writes the result as an instant article override instead of waiting on the
      // social-caption stage — the article content update is the point of "Update",
      // social captions are a separate, optional follow-on.
      const sourceArticleSlug = await getArticleSlugForRun(run.run_id);
      if (sourceArticleSlug) {
        const latestDraft = run.blog_drafts[0];
        const featuredImage = (latestDraft.suggested_images || []).find(
          (img: any) => typeof img === "object" && img !== null && img.isFeatured
        ) as any;
        await setArticleOverride(sourceArticleSlug, {
          title: latestDraft.title,
          excerpt: latestDraft.excerpt,
          body_markdown: latestDraft.body_markdown || latestDraft.body || "",
          references: latestDraft.references || [],
          featuredImage: featuredImage?.url || undefined,
          category: latestDraft.category,
          updatedAt: now,
        });

        // Fan out to per-topic subscribers — deliberately scoped to only this
        // "Update an existing article" flow (see notifyTopicSubscribers'
        // own comment for why brand-new AI-topic runs don't trigger this).
        // Fire-and-forget: never blocks or fails the review submission.
        const sourceArticle = blogArticles[sourceArticleSlug];
        if (sourceArticle?.relatedTopicSlugs?.length) {
          const articleUrl = `${SITE_URL}/education/${sourceArticle.category}/${sourceArticleSlug}`;
          notifyTopicSubscribers(sourceArticle.relatedTopicSlugs, latestDraft.title, articleUrl).catch((err) =>
            console.error("Failed to notify topic subscribers:", err)
          );
        }
      }

      if (!run.social_drafts || run.social_drafts.length === 0) {
        // Reuse the blog's hero/featured image (from Stage 2 drafting or the
        // reviewer's own upload) as the starting image for the single-image
        // social formats, so the reviewer isn't looking at a blank image slot
        // for a photo the clinic already has. Story/Carousel/Reel are left
        // alone — those are vertical/multi-slide formats with their own
        // format-specific imagePromptSuggestion, which a horizontal hero
        // image wouldn't fit anyway.
        const heroImage = (run.blog_drafts[0]?.suggested_images || []).find(
          (img: any) => typeof img === "object" && img !== null && img.isFeatured && img.url
        ) as { url: string } | undefined;

        // Instagram/Facebook/LinkedIn stay as quick editable templates (matches existing
        // reviewed behavior). Story/Carousel/Reel need real AI-generated content — they
        // used to be a single hardcoded placeholder slide/script, which made those tabs
        // look broken (one repeated generic slide instead of an actual multi-slide
        // carousel or script). Reuse the same writer the standalone Social Posts feature
        // already calls for these three formats.
        let aiFormats: Pick<SocialDraftVersion, "instagramStory" | "instagramCarousel" | "instagramReel"> | null = null;
        // writeSocialCaptions() already writes real, topic-specific, algorithm-optimized
        // captions (correct hashtag counts, save/share framing, keyword phrasing — see
        // SYSTEM_INSTRUCTION in socialWriterAgent.ts) for instagram/facebook/linkedin too,
        // not just Story/Carousel/Reel. These used to be discarded in favor of a generic
        // hardcoded template with far fewer hashtags than the platform targets (e.g.
        // Instagram needs 8-15, the template only ever had 3; Facebook/LinkedIn had none
        // at all) — now used directly, with the old copy kept only as a failure fallback.
        let feedAiFormats: { instagram?: SocialCaptionPlatform; facebook?: SocialCaptionPlatform; linkedin?: SocialCaptionPlatform } = {};
        try {
          const generated = await writeSocialCaptions(run.topic);
          aiFormats = {
            instagramStory: { caption: generated.instagramStory.caption, status: "pending" },
            instagramCarousel: {
              caption: generated.instagramCarousel.caption,
              imagePromptSuggestion: generated.instagramCarousel.imagePromptSuggestion,
              slides: generated.instagramCarousel.slides || [],
              status: "pending"
            },
            instagramReel: {
              caption: generated.instagramReel.caption,
              imagePromptSuggestion: generated.instagramReel.imagePromptSuggestion,
              script: generated.instagramReel.script || "",
              status: "pending"
            },
          };
          feedAiFormats = {
            instagram: { caption: generated.instagram.caption, status: "pending", imagePromptSuggestion: generated.instagram.imagePromptSuggestion },
            facebook: { caption: generated.facebook.caption, status: "pending", imagePromptSuggestion: generated.facebook.imagePromptSuggestion },
            linkedin: { caption: generated.linkedin.caption, status: "pending", imagePromptSuggestion: generated.linkedin.imagePromptSuggestion },
          };
        } catch (err) {
          console.error("Failed to AI-generate social captions, falling back to generic templates:", err);
        }

        // Apply the same hero-image default to Story/Carousel/Reel, computed
        // once here so the literal below stays readable.
        const storyDraft = aiFormats?.instagramStory || {
          caption: `✨ New Article: ${run.blog_drafts[0]?.title || run.topic}! Tap to read the full guide.`,
          status: "pending" as const,
        };
        const carouselDraft = aiFormats?.instagramCarousel || {
          caption: `Swipe through to learn about "${run.topic}"!`,
          imagePromptSuggestion: `Carousel slides summarizing ${run.topic}`,
          slides: [
            { slideNumber: 1, text: run.blog_drafts[0]?.title || run.topic, imagePromptSuggestion: `Cover slide for "${run.topic}"` }
          ],
          status: "pending" as const,
        };
        const reelDraft = aiFormats?.instagramReel || {
          caption: `Watch our quick guide on "${run.topic}"!`,
          imagePromptSuggestion: `Reel visual thumbnail for "${run.topic}"`,
          script: `Hook: Let's talk about ${run.topic}!\n\nVoiceover: Here is what you need to know...`,
          status: "pending" as const,
        };
        const instagramDraft = feedAiFormats.instagram || {
          caption: `✨ New Blog Article: ${run.blog_drafts[0]?.title || run.topic}!\n\nDiscover patient guidance and non-surgical joint care tips from Lincolnshire Knee Clinic specialists. Link in bio! #KneeHealth #LincolnshireKneeClinic #JointCare`,
          status: "pending" as const,
        };
        const facebookDraft = feedAiFormats.facebook || {
          caption: `Our medical team has published a comprehensive new guide: "${run.blog_drafts[0]?.title || run.topic}". Read the full breakdown on our clinic site today.`,
          status: "pending" as const,
        };
        const linkedinDraft = feedAiFormats.linkedin || {
          caption: `Read our latest clinical update for patients and general practitioners: "${run.blog_drafts[0]?.title || run.topic}". Highlighting evidence-based treatment pathways and rehabilitation protocols.`,
          status: "pending" as const,
        };

        run.social_drafts = [
          {
            version: 1,
            instagram: { ...instagramDraft, imageUrl: heroImage?.url },
            facebook: { ...facebookDraft, imageUrl: heroImage?.url },
            linkedin: { ...linkedinDraft, imageUrl: heroImage?.url },
            instagramStory: { ...storyDraft, imageUrl: heroImage?.url },
            instagramCarousel: {
              ...carouselDraft,
              slides: carouselDraft.slides.length > 0
                ? [{ ...carouselDraft.slides[0], imageUrl: heroImage?.url }, ...carouselDraft.slides.slice(1)]
                : carouselDraft.slides,
            },
            instagramReel: { ...reelDraft, coverImageUrl: heroImage?.url },
            created_at: now
          }
        ];
      }

      const wasAwaitingSocial = run.status === "awaiting_social_approval";

      if (payload.decision === "publish_blog") {
        const latestDraft = run.blog_drafts[0];
        const category = latestDraft.category || "knee-arthritis";
        const slug = (latestDraft.title || run.topic)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        try {
          await publishBlogDraftToWebsite(run);
          run.published_urls = {
            blog_url: `/education/${category}/${slug}`,
            published_at: now
          };
          // Best-effort — a standalone social batch may have auto-triggered this
          // run as its companion article; fill in the real link for reviewers to
          // use once it's live. Never block publishing on this.
          syncLinkedSocialOnlyPosts(run.run_id, `${SITE_URL}${run.published_urls.blog_url}`, latestDraft.title).catch(
            (err) => console.error("Failed to sync linked social-only posts:", err)
          );
        } catch (err) {
          console.error("Failed to publish dynamic blog to website:", err);
        }
      }

      run.status = "awaiting_social_approval";
      if (!wasAwaitingSocial) {
        await sendContentPipelineNotificationEmail(run, "social");
      }
    } else if (payload.decision === "revision_requested") {
      run.status = "writing_blog";
      const latestVersionNumber = (run.blog_drafts?.[0]?.version || 1) + 1;
      const previousDraft = run.blog_drafts?.[0] || null;
      let blogDraftData;
      let articleDraftData;
      try {
        const [blogRes, articleRes] = await Promise.all([
          writeBlogDraft(
            run.topic,
            run.research_brief as any,
            previousDraft,
            payload.revisionNotes
          ),
          writeTechnicalArticleDraft(
            run.topic,
            run.research_brief as any,
            previousDraft,
            payload.revisionNotes
          )
        ]);
        blogDraftData = blogRes;
        articleDraftData = articleRes;
      } catch (err: any) {
        console.error("Stage 2 Blog/Article Writer revision failed:", err);
        const errorMessage = err?.message || String(err);
        blogDraftData = {
          title: previousDraft?.title || `[GENERATION ERROR] ${run.topic} (V${latestVersionNumber})`,
          excerpt: `The AI Blog Writer encountered an error during revision: ${errorMessage}`,
          body: `### ⚠️ Stage 2 AI Generation Failed during Revision\n\nThe content pipeline attempted to generate a revised layman blog using Gemini AI, but encountered a system error:\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\n[NEEDS CLINICAL REVIEW] This is an error placeholder, do not publish.`,
          suggestedImages: previousDraft?.suggested_images || [],
          flags: [`[NEEDS CLINICAL REVIEW] AI revision failed with error: ${errorMessage}`],
          faqs: previousDraft?.faqs || [],
        };
        articleDraftData = {
          title: previousDraft?.article_title || `[GENERATION ERROR] ${run.topic} (Clinical Depth) (V${latestVersionNumber})`,
          excerpt: `The AI Technical Article Writer encountered an error during revision: ${errorMessage}`,
          body: `### ⚠️ Stage 2 AI Generation Failed during Revision\n\nThe content pipeline attempted to generate a revised technical article using Gemini AI, but encountered a system error:\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\n[NEEDS CLINICAL REVIEW] This is an error placeholder, do not publish.`,
          suggestedImages: previousDraft?.article_suggested_images || [],
          flags: [`[NEEDS CLINICAL REVIEW] AI revision failed with error: ${errorMessage}`],
          faqs: previousDraft?.article_faqs || [],
        };
      }

      run.blog_drafts.unshift({
        version: latestVersionNumber,
        title: blogDraftData.title,
        excerpt: blogDraftData.excerpt,
        body_markdown: blogDraftData.body_markdown || blogDraftData.body,
        body: blogDraftData.body_markdown || blogDraftData.body,
        suggested_images: blogDraftData.suggestedImages || [],
        references: previousDraft?.references || ["NICE Clinical Guidelines on Knee Care", "Journal of Bone and Joint Surgery"],
        flags: blogDraftData.flags || [],
        created_at: now,
        faqs: blogDraftData.faqs || previousDraft?.faqs || [],

        // Technical article fields
        article_title: articleDraftData.title,
        article_excerpt: articleDraftData.excerpt,
        article_body_markdown: articleDraftData.body_markdown || articleDraftData.body,
        article_body: articleDraftData.body_markdown || articleDraftData.body,
        article_suggested_images: articleDraftData.suggestedImages || [],
        article_references: previousDraft?.article_references || previousDraft?.references || ["NICE Clinical Guidelines on Knee Care", "Journal of Bone and Joint Surgery"],
        article_flags: articleDraftData.flags || [],
        article_faqs: articleDraftData.faqs || previousDraft?.article_faqs || [],
      });

      run.status = "awaiting_blog_approval";
    }
  } else if (payload.stage === "social") {
    if (run.social_drafts && run.social_drafts.length > 0) {
      const currentDraft = run.social_drafts[0];
      const platform = payload.platform;

      if (platform && ["instagram", "facebook", "linkedin", "instagramStory", "instagramCarousel", "instagramReel"].includes(platform)) {
        // Independent per-platform decision
        if (platform === "instagramCarousel") {
          const draft = currentDraft.instagramCarousel || { caption: "", imagePromptSuggestion: "", slides: [], status: "pending" };
          if (payload.decision === "approved") {
            draft.status = "approved";
          } else if (payload.decision === "edited" && payload.editedContent) {
            draft.caption = payload.editedContent.caption || payload.editedContent.instagramCarousel?.caption || draft.caption;
            draft.slides = payload.editedContent.slides || payload.editedContent.instagramCarousel?.slides || draft.slides;
            draft.status = "approved";
          } else if (payload.decision === "revision_requested") {
            const rewritten = await rewriteCarouselSlides(run.topic, draft.slides || [], payload.revisionNotes);
            draft.caption = rewritten.caption;
            draft.imagePromptSuggestion = rewritten.imagePromptSuggestion;
            draft.slides = rewritten.slides;
            draft.status = "pending";
          }
          currentDraft.instagramCarousel = draft;
        } else if (platform === "instagramReel") {
          const draft = currentDraft.instagramReel || { caption: "", imagePromptSuggestion: "", script: "", status: "pending" };
          if (payload.decision === "approved") {
            draft.status = "approved";
          } else if (payload.decision === "edited" && payload.editedContent) {
            draft.caption = payload.editedContent.caption || draft.caption;
            draft.script = payload.editedContent.script || draft.script;
            // Attaching/replacing the video or cover image is a media update, not
            // a content approval — don't auto-approve the whole reel just because
            // its cover image was swapped, same as the video-attach case below.
            let mediaUpdated = false;
            if (payload.editedContent.videoUrl !== undefined) {
              draft.videoUrl = payload.editedContent.videoUrl;
              draft.videoSource = payload.editedContent.videoSource;
              mediaUpdated = true;
            }
            if (payload.editedContent.coverImageUrl !== undefined) {
              draft.coverImageUrl = payload.editedContent.coverImageUrl;
              mediaUpdated = true;
            }
            if (!mediaUpdated) {
              draft.status = "approved";
            }
          } else if (payload.decision === "revision_requested") {
            const rewritten = await rewriteSocialCaption(run.topic, "instagramReel", draft.script || draft.caption || "", payload.revisionNotes);
            draft.caption = rewritten.caption;
            draft.script = rewritten.caption;
            draft.imagePromptSuggestion = rewritten.imagePromptSuggestion;
            draft.status = "pending";
          }
          currentDraft.instagramReel = draft;
        } else {
          const p = platform as "instagram" | "facebook" | "linkedin" | "instagramStory";
          if (!currentDraft[p]) {
            currentDraft[p] = { caption: "", status: "pending" };
          }
          if (payload.decision === "approved") {
            currentDraft[p]!.status = "approved";
          } else if (payload.decision === "edited") {
            if (payload.editedContent) {
              const newCaption = typeof payload.editedContent === "string"
                ? payload.editedContent
                : (payload.editedContent.caption || payload.editedContent[p]?.caption || currentDraft[p]!.caption);
              const newImageUrl = typeof payload.editedContent === "object" && payload.editedContent !== null
                ? (payload.editedContent.imageUrl || payload.editedContent[p]?.imageUrl || currentDraft[p]!.imageUrl)
                : currentDraft[p]!.imageUrl;

              currentDraft[p]!.caption = newCaption;
              if (newImageUrl !== undefined) {
                currentDraft[p]!.imageUrl = newImageUrl;
              }
            }
            currentDraft[p]!.status = "approved";
          } else if (payload.decision === "revision_requested") {
            const rewritten = await rewriteSocialCaption(run.topic, p, currentDraft[p]!.caption || "", payload.revisionNotes);
            currentDraft[p]!.caption = rewritten.caption;
            currentDraft[p]!.imagePromptSuggestion = rewritten.imagePromptSuggestion;
            currentDraft[p]!.status = "pending";
          }
        }
      } else {
        // Bulk / all platforms fallback
        if (payload.decision === "approved" || payload.decision === "edited") {
          if (payload.editedContent) {
            if (payload.editedContent.instagram?.caption) currentDraft.instagram.caption = payload.editedContent.instagram.caption;
            if (payload.editedContent.facebook?.caption) currentDraft.facebook.caption = payload.editedContent.facebook.caption;
            if (payload.editedContent.linkedin?.caption) currentDraft.linkedin.caption = payload.editedContent.linkedin.caption;

            if (payload.editedContent.instagram?.imageUrl !== undefined) currentDraft.instagram.imageUrl = payload.editedContent.instagram.imageUrl;
            if (payload.editedContent.facebook?.imageUrl !== undefined) currentDraft.facebook.imageUrl = payload.editedContent.facebook.imageUrl;
            if (payload.editedContent.linkedin?.imageUrl !== undefined) currentDraft.linkedin.imageUrl = payload.editedContent.linkedin.imageUrl;
          }
          currentDraft.instagram.status = "approved";
          currentDraft.facebook.status = "approved";
          currentDraft.linkedin.status = "approved";
          if (currentDraft.instagramStory) currentDraft.instagramStory.status = "approved";
          if (currentDraft.instagramCarousel) currentDraft.instagramCarousel.status = "approved";
          if (currentDraft.instagramReel) currentDraft.instagramReel.status = "approved";
        } else if (payload.decision === "revision_requested") {
          const [instagramRewrite, facebookRewrite, linkedinRewrite] = await Promise.all([
            rewriteSocialCaption(run.topic, "instagram", currentDraft.instagram.caption || "", payload.revisionNotes),
            rewriteSocialCaption(run.topic, "facebook", currentDraft.facebook.caption || "", payload.revisionNotes),
            rewriteSocialCaption(run.topic, "linkedin", currentDraft.linkedin.caption || "", payload.revisionNotes),
          ]);
          currentDraft.instagram.caption = instagramRewrite.caption;
          currentDraft.instagram.imagePromptSuggestion = instagramRewrite.imagePromptSuggestion;
          currentDraft.instagram.status = "pending";
          currentDraft.facebook.caption = facebookRewrite.caption;
          currentDraft.facebook.imagePromptSuggestion = facebookRewrite.imagePromptSuggestion;
          currentDraft.facebook.status = "pending";
          currentDraft.linkedin.caption = linkedinRewrite.caption;
          currentDraft.linkedin.imagePromptSuggestion = linkedinRewrite.imagePromptSuggestion;
          currentDraft.linkedin.status = "pending";

          if (currentDraft.instagramStory) {
            const storyRewrite = await rewriteSocialCaption(run.topic, "instagramStory", currentDraft.instagramStory.caption || "", payload.revisionNotes);
            currentDraft.instagramStory.caption = storyRewrite.caption;
            currentDraft.instagramStory.imagePromptSuggestion = storyRewrite.imagePromptSuggestion;
            currentDraft.instagramStory.status = "pending";
          }
          if (currentDraft.instagramCarousel) {
            const carouselRewrite = await rewriteCarouselSlides(run.topic, currentDraft.instagramCarousel.slides || [], payload.revisionNotes);
            currentDraft.instagramCarousel.caption = carouselRewrite.caption;
            currentDraft.instagramCarousel.imagePromptSuggestion = carouselRewrite.imagePromptSuggestion;
            currentDraft.instagramCarousel.slides = carouselRewrite.slides;
            currentDraft.instagramCarousel.status = "pending";
          }
          if (currentDraft.instagramReel) {
            const reelRewrite = await rewriteSocialCaption(run.topic, "instagramReel", currentDraft.instagramReel.script || currentDraft.instagramReel.caption || "", payload.revisionNotes);
            currentDraft.instagramReel.caption = reelRewrite.caption;
            currentDraft.instagramReel.script = reelRewrite.caption;
            currentDraft.instagramReel.imagePromptSuggestion = reelRewrite.imagePromptSuggestion;
            currentDraft.instagramReel.status = "pending";
          }
        }
      }
    }

    // Check if ALL platforms are approved
    const latestSocial = run.social_drafts[0];
    const allApproved =
      latestSocial &&
      latestSocial.instagram.status === "approved" &&
      latestSocial.facebook.status === "approved" &&
      latestSocial.linkedin.status === "approved" &&
      (!latestSocial.instagramStory || latestSocial.instagramStory.status === "approved") &&
      (!latestSocial.instagramCarousel || latestSocial.instagramCarousel.status === "approved") &&
      (!latestSocial.instagramReel || latestSocial.instagramReel.status === "approved");

    if (allApproved) {
      run.status = "published";
      const slug = (run.blog_drafts[0]?.title || run.topic)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const category = run.blog_drafts[0]?.category || "knee-arthritis";

      try {
        await publishBlogDraftToWebsite(run);
      } catch (err) {
        console.error("Failed to publish dynamic blog to website on final approval:", err);
      }

      run.published_urls = {
        blog_url: `/education/${category}/${slug}`,
        published_at: now
      };
      run.social_media_assets = [
        { platform: "Instagram", asset_url: `/assets/social/${slug}-ig.png` },
        { platform: "Facebook", asset_url: `/assets/social/${slug}-fb.png` },
        { platform: "LinkedIn", asset_url: `/assets/social/${slug}-li.pdf` }
      ];
    } else {
      if (payload.decision === "revision_requested" && !payload.platform) {
        run.status = "writing_social";
      } else {
        run.status = "awaiting_social_approval";
      }
    }
  }

  run.updated_at = now;

  // Supabase Sync
  const config = getSupabaseConfig();
  if (config) {
    try {
      // 1. Insert review record
      const reviewEndpoint = `${config.url}/rest/v1/content_pipeline_reviews`;
      await fetch(reviewEndpoint, {
        method: "POST",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(mapReviewToRow(newReview)),
      });

      // 2. Patch run record
      const runEndpoint = `${config.url}/rest/v1/content_pipeline_runs?run_id=eq.${encodeURIComponent(run.run_id)}`;
      await fetch(runEndpoint, {
        method: "PATCH",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          status: run.status,
          blog_drafts: run.blog_drafts,
          social_drafts: run.social_drafts,
          published_urls: run.published_urls || null,
          social_media_assets: run.social_media_assets || null,
          updated_at: run.updated_at,
        }),
      });
    } catch (err) {
      console.error("Error updating Supabase review/run:", err);
    }
  }

  // Update local disk cache
  if (runIndex >= 0) {
    runs[runIndex] = run;
  } else {
    runs.unshift(run);
  }
  writeRunsToDisk(runs);

  const reviews = readReviewsFromDisk();
  reviews.unshift(newReview);
  writeReviewsToDisk(reviews);

  return { success: true, run, review: newReview };
}

// Runs created before Story/Carousel/Reel support existed have social_drafts
// with those three fields entirely missing (not just empty), which renders as a
// blank card in the UI with no way to fix it. Generate just the missing formats
// on demand, without touching the already-reviewed instagram/facebook/linkedin
// captions or approval statuses.
export async function backfillMissingSocialFormats(runId: string): Promise<ContentPipelineRun> {
  const { run: existingRun } = await getPipelineRunDetail(runId);
  const runs = readRunsFromDisk();
  const runIndex = runs.findIndex((r) => r.run_id === runId || r.id === runId);
  const run = existingRun || (runIndex >= 0 ? runs[runIndex] : null);

  if (!run) {
    throw new Error(`Run ${runId} not found`);
  }
  if (!run.social_drafts || run.social_drafts.length === 0) {
    throw new Error("This run hasn't reached social review yet, so there's nothing to backfill.");
  }

  const draft = run.social_drafts[0];
  // Treat present-but-empty the same as missing — an occasional malformed AI response
  // (empty slides array, blank script) otherwise gets "stuck" permanently once it's no
  // longer technically undefined, with no way to regenerate it from the UI.
  const missing = {
    instagramStory: !draft.instagramStory,
    instagramCarousel: !draft.instagramCarousel || (draft.instagramCarousel.slides || []).length === 0,
    instagramReel: !draft.instagramReel || !draft.instagramReel.script?.trim(),
  };
  if (!missing.instagramStory && !missing.instagramCarousel && !missing.instagramReel) {
    return run;
  }

  const heroImage = (run.blog_drafts[0]?.suggested_images || []).find(
    (img: any) => typeof img === "object" && img !== null && img.isFeatured && img.url
  ) as { url: string } | undefined;

  const generated = await writeSocialCaptions(run.topic);
  if (missing.instagramStory) {
    draft.instagramStory = { caption: generated.instagramStory.caption, status: "pending", imageUrl: heroImage?.url };
  }
  if (missing.instagramCarousel) {
    const slides = generated.instagramCarousel.slides || [];
    draft.instagramCarousel = {
      caption: generated.instagramCarousel.caption,
      imagePromptSuggestion: generated.instagramCarousel.imagePromptSuggestion,
      slides: slides.length > 0 ? [{ ...slides[0], imageUrl: heroImage?.url }, ...slides.slice(1)] : slides,
      status: "pending"
    };
  }
  if (missing.instagramReel) {
    draft.instagramReel = {
      caption: generated.instagramReel.caption,
      imagePromptSuggestion: generated.instagramReel.imagePromptSuggestion,
      script: generated.instagramReel.script || "",
      coverImageUrl: heroImage?.url,
      status: "pending"
    };
  }

  run.updated_at = new Date().toISOString();

  const config = getSupabaseConfig();
  if (config) {
    try {
      const runEndpoint = `${config.url}/rest/v1/content_pipeline_runs?run_id=eq.${encodeURIComponent(run.run_id)}`;
      await fetch(runEndpoint, {
        method: "PATCH",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ social_drafts: run.social_drafts, updated_at: run.updated_at }),
      });
    } catch (err) {
      console.error("Error patching Supabase run after backfilling social formats:", err);
    }
  }

  if (runIndex >= 0) {
    runs[runIndex] = run;
  } else {
    runs.unshift(run);
  }
  writeRunsToDisk(runs);

  return run;
}
