import fs from "fs";
import path from "path";
import { sendContentPipelineNotificationEmail } from "./graphMail";
import { performResearchProcess } from "./researchAgent";
import { writeBlogDraft } from "./blogWriterAgent";

export type RunStatus =
  | "researching"
  | "writing_blog"
  | "awaiting_blog_approval"
  | "writing_social"
  | "awaiting_social_approval"
  | "published"
  | "abandoned";

export interface ResearchBrief {
  summary: string;
  key_points: string[];
  sources: string[];
  target_audience: string;
  conflicting_findings?: string[];
  clinical_indications?: string[];
  pubmed_articles?: Array<{
    pmid: string;
    title: string;
    authors: string;
    journal: string;
    pubdate: string;
    url: string;
  }>;
}

export interface BlogDraftVersion {
  version: number;
  title: string;
  excerpt: string;
  body_markdown?: string;
  body?: string;
  suggested_images: Array<string | { placeholderId?: string; label: string; url?: string }>;
  references: string[];
  flags: string[];
  created_at: string;
}

export interface SocialCaptionPlatform {
  caption: string;
  status: "pending" | "approved";
  imageUrl?: string;
}

export interface SocialDraftVersion {
  version: number;
  instagram: SocialCaptionPlatform;
  facebook: SocialCaptionPlatform;
  linkedin: SocialCaptionPlatform;
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
  platform?: "instagram" | "facebook" | "linkedin";
  version?: number;
  decision: "approved" | "edited" | "revision_requested" | "revert_to_blog" | "revert_to_social";
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
  return {
    review_id: review.review_id || review.id || `rev-${Date.now()}`,
    run_id: review.run_id,
    stage: review.stage,
    platform: review.platform || null,
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
      let endpoint = `${config.url}/rest/v1/content_pipeline_runs?select=*&order=created_at.desc`;
      if (statusFilter) {
        endpoint = `${config.url}/rest/v1/content_pipeline_runs?select=*&status=eq.${encodeURIComponent(statusFilter)}&order=created_at.desc`;
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
  runs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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

/**
 * Trigger a new run. Automatically executes Stage 1 Research (PubMed NCBI Entrez API search)
 * to populate genuine clinical literature citations and indications into research_brief.
 */
export async function triggerPipelineRun(customTopic?: string): Promise<ContentPipelineRun> {
  let selectedTopic = customTopic?.trim();
  const topicSource = customTopic?.trim() ? "custom_user_input" : "trending_enquiry";

  if (!selectedTopic) {
    try {
      const topicsPath = path.join(process.cwd(), "data", "dynamic-topics.json");
      if (fs.existsSync(topicsPath)) {
        const topics = JSON.parse(fs.readFileSync(topicsPath, "utf8") || "[]");
        if (topics.length > 0) {
          topics.sort((a: any, b: any) => (b.enquiryCount || 0) - (a.enquiryCount || 0));
          selectedTopic = topics[0].label || topics[0].category;
        }
      }
    } catch {
      // Fallback
    }
  }

  if (!selectedTopic) {
    selectedTopic = "Robotic Total Knee Replacement: Pre-Op Preparation & Recovery Milestones";
  }

  // Execute Stage 1 PubMed Literature & Evidence Scan
  const researchBrief = await performResearchProcess(selectedTopic);

  const realReferences = researchBrief.sources && researchBrief.sources.length > 0
    ? researchBrief.sources
    : ["NICE Clinical Guidelines on Knee Care", "Journal of Bone and Joint Surgery"];

  const now = new Date().toISOString();
  const newRunId = `run-${Date.now()}`;

  // Execute Stage 2: AI Blog Writer
  let blogDraftData;
  try {
    blogDraftData = await writeBlogDraft(selectedTopic, researchBrief as any);
  } catch (err: any) {
    console.error("Stage 2 Blog Writer failed:", err);
    const errorMessage = err?.message || String(err);
    blogDraftData = {
      title: `[GENERATION ERROR] ${selectedTopic}`,
      excerpt: `The AI Blog Writer encountered an error: ${errorMessage}`,
      body: `### ⚠️ Stage 2 AI Generation Failed\n\nThe content pipeline attempted to generate a full-length article using Gemini AI, but encountered a system error:\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\n**Please check:**\n1. Did you completely restart your local development server (\`npm run dev\`) after updates?\n2. Is the \`GEMINI_API_KEY\` valid in your \`.env\` file?\n3. Check terminal logs for detailed stack trace.\n\n[NEEDS CLINICAL REVIEW] This is an error placeholder, do not publish.`,
      suggestedImages: ["Error icon placeholder"],
      flags: [`[NEEDS CLINICAL REVIEW] AI generation failed with error: ${errorMessage}`],
    };
  }

  const newRun: ContentPipelineRun = {
    id: newRunId,
    run_id: newRunId,
    topic: selectedTopic,
    triggered_by: "manual",
    topic_source: topicSource,
    status: "awaiting_blog_approval",
    research_brief: researchBrief as any,
    blog_drafts: [
      {
        version: 1,
        title: blogDraftData.title,
        excerpt: blogDraftData.excerpt,
        body_markdown: blogDraftData.body_markdown || blogDraftData.body,
        body: blogDraftData.body_markdown || blogDraftData.body,
        suggested_images: blogDraftData.suggestedImages,
        references: realReferences,
        flags: blogDraftData.flags,
        created_at: now
      }
    ],
    social_drafts: [],
    published_urls: null,
    social_media_assets: null,
    created_at: now,
    updated_at: now
  };

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

  // Update local disk cache
  const runs = readRunsFromDisk();
  runs.unshift(newRun);
  writeRunsToDisk(runs);

  // Trigger notification email for new run awaiting blog approval
  await sendContentPipelineNotificationEmail(newRun, "blog");

  return newRun;
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
    platform?: "instagram" | "facebook" | "linkedin";
    decision: "approved" | "edited" | "revision_requested" | "revert_to_blog" | "revert_to_social";
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
  const newReview: ContentPipelineReview = {
    id: `rev-${Date.now()}`,
    review_id: `rev-${Date.now()}`,
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
  } else if (payload.stage === "blog") {
    if (payload.decision === "approved" || payload.decision === "edited") {
      if (payload.decision === "edited" && payload.editedContent) {
        const latestVersionNumber = (run.blog_drafts?.[0]?.version || 1) + 1;
        const editedBody = payload.editedContent.body_markdown || payload.editedContent.body || "";

        // Parse placeholders from the edited body to keep suggested_images in sync!
        const placeholderRegex = /\[IMAGE PLACEHOLDER:\s*(.*?)\]/gi;
        let match;
        const suggestedImages: any[] = [
          "Patient undergoing functional knee rehabilitation and symmetry testing with a physical therapist",
          "Anatomical diagram illustrating knee joint structures and surgical repair integrity"
        ];
        let count = 1;
        const previousImages = run.blog_drafts[0]?.suggested_images || [];
        while ((match = placeholderRegex.exec(editedBody)) !== null) {
          const label = match[1].trim();
          const previousResolved = previousImages.find(
            (img: any) =>
              typeof img === "object" &&
              img !== null &&
              img.label?.trim().toLowerCase() === label.toLowerCase()
          ) as any;
          suggestedImages.push({
            placeholderId: previousResolved?.placeholderId || `placeholder-${count++}`,
            label,
            url: previousResolved?.url || ""
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
          created_at: now
        });
      }

      if (!run.social_drafts || run.social_drafts.length === 0) {
        run.social_drafts = [
          {
            version: 1,
            instagram: {
              caption: `✨ New Blog Article: ${run.blog_drafts[0]?.title || run.topic}!\n\nDiscover patient guidance and non-surgical joint care tips from Lincolnshire Knee Clinic specialists. Link in bio! #KneeHealth #LincolnshireKneeClinic #JointCare`,
              status: "pending"
            },
            facebook: {
              caption: `Our medical team has published a comprehensive new guide: "${run.blog_drafts[0]?.title || run.topic}". Read the full breakdown on our clinic site today.`,
              status: "pending"
            },
            linkedin: {
              caption: `Read our latest clinical update for patients and general practitioners: "${run.blog_drafts[0]?.title || run.topic}". Highlighting evidence-based treatment pathways and rehabilitation protocols.`,
              status: "pending"
            },
            created_at: now
          }
        ];
      }

      run.status = "awaiting_social_approval";
      await sendContentPipelineNotificationEmail(run, "social");
    } else if (payload.decision === "revision_requested") {
      run.status = "writing_blog";
      const latestVersionNumber = (run.blog_drafts?.[0]?.version || 1) + 1;
      const previousDraft = run.blog_drafts?.[0] || null;
      let blogDraftData;
      try {
        blogDraftData = await writeBlogDraft(
          run.topic,
          run.research_brief as any,
          previousDraft,
          payload.revisionNotes
        );
      } catch (err: any) {
        console.error("Stage 2 Blog Writer revision failed:", err);
        const errorMessage = err?.message || String(err);
        blogDraftData = {
          title: `[GENERATION ERROR] ${run.topic} (V${latestVersionNumber})`,
          excerpt: `The AI Blog Writer encountered an error during revision: ${errorMessage}`,
          body: `### ⚠️ Stage 2 AI Generation Failed during Revision\n\nThe content pipeline attempted to generate a revised article using Gemini AI, but encountered a system error:\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\n[NEEDS CLINICAL REVIEW] This is an error placeholder, do not publish.`,
          suggestedImages: previousDraft?.suggested_images || ["Error icon placeholder"],
          flags: [`[NEEDS CLINICAL REVIEW] AI revision failed with error: ${errorMessage}`],
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
        created_at: now
      });

      run.status = "awaiting_blog_approval";
    }
  } else if (payload.stage === "social") {
    if (run.social_drafts && run.social_drafts.length > 0) {
      const currentDraft = run.social_drafts[0];
      const platform = payload.platform;

      if (platform && ["instagram", "facebook", "linkedin"].includes(platform)) {
        // Independent per-platform decision
        if (payload.decision === "approved") {
          currentDraft[platform].status = "approved";
        } else if (payload.decision === "edited") {
          if (payload.editedContent) {
            const newCaption = typeof payload.editedContent === "string"
              ? payload.editedContent
              : (payload.editedContent.caption || payload.editedContent[platform]?.caption || currentDraft[platform].caption);
            const newImageUrl = typeof payload.editedContent === "object" && payload.editedContent !== null
              ? (payload.editedContent.imageUrl || payload.editedContent[platform]?.imageUrl || currentDraft[platform].imageUrl)
              : currentDraft[platform].imageUrl;

            currentDraft[platform].caption = newCaption;
            if (newImageUrl !== undefined) {
              currentDraft[platform].imageUrl = newImageUrl;
            }
          }
          currentDraft[platform].status = "approved";
        } else if (payload.decision === "revision_requested") {
          currentDraft[platform].status = "pending";
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
        } else if (payload.decision === "revision_requested") {
          currentDraft.instagram.status = "pending";
          currentDraft.facebook.status = "pending";
          currentDraft.linkedin.status = "pending";
        }
      }
    }

    // Check if ALL THREE platforms are approved
    const latestSocial = run.social_drafts[0];
    const allApproved =
      latestSocial &&
      latestSocial.instagram.status === "approved" &&
      latestSocial.facebook.status === "approved" &&
      latestSocial.linkedin.status === "approved";

    if (allApproved) {
      run.status = "published";
      const slug = (run.blog_drafts[0]?.title || run.topic)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      run.published_urls = {
        blog_url: `/blog/${slug}`,
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
