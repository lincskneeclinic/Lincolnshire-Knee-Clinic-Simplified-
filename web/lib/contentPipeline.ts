import fs from "fs";
import path from "path";
import { sendContentPipelineNotificationEmail } from "./graphMail";

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
}

export interface BlogDraftVersion {
  version: number;
  title: string;
  excerpt: string;
  body: string;
  suggested_images: string[];
  references: string[];
  flags: string[];
  created_at: string;
}

export interface SocialCaptionPlatform {
  caption: string;
  status: "pending" | "approved";
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
  id: string;
  run_id: string;
  stage: "blog" | "social";
  decision: "approved" | "edited" | "revision_requested";
  edited_content?: any;
  revision_notes?: string;
  created_at: string;
}

const RUNS_FILE_PATH = path.join(process.cwd(), "data", "content-pipeline-runs.json");
const REVIEWS_FILE_PATH = path.join(process.cwd(), "data", "content-pipeline-reviews.json");

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
 */
export async function getPipelineRuns(statusFilter?: string): Promise<ContentPipelineRun[]> {
  let runs = readRunsFromDisk();

  if (statusFilter) {
    runs = runs.filter((r) => r.status === statusFilter);
  }

  // Sort most recent first
  runs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return runs;
}

/**
 * Get single run with complete detail and associated review history
 */
export async function getPipelineRunDetail(runId: string): Promise<{
  run: ContentPipelineRun | null;
  reviews: ContentPipelineReview[];
}> {
  const runs = readRunsFromDisk();
  const run = runs.find((r) => r.run_id === runId || r.id === runId) || null;

  const reviews = readReviewsFromDisk()
    .filter((rev) => rev.run_id === runId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { run, reviews };
}

/**
 * Trigger a new run. If topic is not provided, pick top trending query or fallback.
 */
export async function triggerPipelineRun(customTopic?: string): Promise<ContentPipelineRun> {
  let selectedTopic = customTopic?.trim();

  if (!selectedTopic) {
    try {
      const topicsPath = path.join(process.cwd(), "data", "dynamic-topics.json");
      if (fs.existsSync(topicsPath)) {
        const topics = JSON.parse(fs.readFileSync(topicsPath, "utf8") || "[]");
        if (topics.length > 0) {
          // Sort by enquiryCount desc
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

  const now = new Date().toISOString();
  const newRunId = `run-${Date.now()}`;

  const newRun: ContentPipelineRun = {
    id: newRunId,
    run_id: newRunId,
    topic: selectedTopic,
    status: "awaiting_blog_approval", // Initial draft ready for review demonstration
    research_brief: {
      summary: `Automated evidence scan and patient enquiry synthesis for "${selectedTopic}".`,
      key_points: [
        "Patient-focused educational content addressing core clinical indications.",
        "Clinical reference integration from PubMed and orthopaedics evidence base.",
        "Clear guidance on conservative management vs surgical referral."
      ],
      sources: ["PubMed Orthopaedics Journal Index", "Lincolnshire Knee Clinic Patient FAQ Registry"],
      target_audience: "Patients in Lincolnshire experiencing knee pain or joint stiffness"
    },
    blog_drafts: [
      {
        version: 1,
        title: selectedTopic,
        excerpt: `An evidence-based guide on ${selectedTopic.toLowerCase()} for patients across Lincolnshire.`,
        body: `### Overview of ${selectedTopic}\n\nUnderstanding your options for knee care is key to restoring active mobility. Knee joint health relies on timely diagnosis, conservative physical therapy, and expert medical assessment.\n\n[NEEDS CLINICAL REVIEW] Verify clinical indication parameters and referral criteria before publishing.\n\n### Clinical Guidance\nAt Lincolnshire Knee Clinic, we provide personalized care tailored to individual patient needs. Contact our clinic reception to book your consultation.`,
        suggested_images: ["Clinical consultation room photograph", "Knee joint anatomical diagnostic diagram"],
        references: ["Journal of Bone and Joint Surgery, 2024", "NICE Clinical Guidelines on Knee Pain"],
        flags: ["[NEEDS CLINICAL REVIEW] Verify clinical indication parameters and referral criteria before publishing."],
        created_at: now
      }
    ],
    social_drafts: [],
    published_urls: null,
    social_media_assets: null,
    created_at: now,
    updated_at: now
  };

  const runs = readRunsFromDisk();
  runs.unshift(newRun);
  writeRunsToDisk(runs);

  // Trigger notification email for new run awaiting blog approval
  await sendContentPipelineNotificationEmail(newRun, "blog");

  return newRun;
}

/**
 * Submit a review decision (approved | edited | revision_requested) for blog or social stage
 */
export async function submitPipelineReview(
  runId: string,
  payload: {
    stage: "blog" | "social";
    decision: "approved" | "edited" | "revision_requested";
    editedContent?: any;
    revisionNotes?: string;
  }
): Promise<{ success: boolean; run: ContentPipelineRun | null; review: ContentPipelineReview }> {
  const runs = readRunsFromDisk();
  const runIndex = runs.findIndex((r) => r.run_id === runId || r.id === runId);

  if (runIndex === -1) {
    throw new Error(`Run ${runId} not found`);
  }

  const run = runs[runIndex];
  const now = new Date().toISOString();

  // Create review log
  const newReview: ContentPipelineReview = {
    id: `rev-${Date.now()}`,
    run_id: run.run_id,
    stage: payload.stage,
    decision: payload.decision,
    edited_content: payload.editedContent || null,
    revision_notes: payload.revisionNotes || undefined,
    created_at: now
  };

  const reviews = readReviewsFromDisk();
  reviews.unshift(newReview);
  writeReviewsToDisk(reviews);

  // Process State Transitions
  if (payload.stage === "blog") {
    if (payload.decision === "approved" || payload.decision === "edited") {
      if (payload.decision === "edited" && payload.editedContent) {
        const latestVersionNumber = (run.blog_drafts?.[0]?.version || 1) + 1;
        run.blog_drafts.unshift({
          version: latestVersionNumber,
          title: payload.editedContent.title || run.blog_drafts[0]?.title || run.topic,
          excerpt: payload.editedContent.excerpt || run.blog_drafts[0]?.excerpt || "",
          body: payload.editedContent.body || run.blog_drafts[0]?.body || "",
          suggested_images: payload.editedContent.suggestedImages || run.blog_drafts[0]?.suggested_images || [],
          references: payload.editedContent.references || run.blog_drafts[0]?.references || [],
          flags: payload.editedContent.flags || [],
          created_at: now
        });
      }

      // Generate initial social drafts if not present
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

      // Transition to awaiting_social_approval
      run.status = "awaiting_social_approval";
      await sendContentPipelineNotificationEmail(run, "social");
    } else if (payload.decision === "revision_requested") {
      run.status = "writing_blog";
    }
  } else if (payload.stage === "social") {
    if (payload.decision === "approved" || payload.decision === "edited") {
      if (payload.editedContent && run.social_drafts.length > 0) {
        const currentDraft = run.social_drafts[0];
        if (payload.editedContent.instagram) {
          currentDraft.instagram = {
            caption: payload.editedContent.instagram.caption || currentDraft.instagram.caption,
            status: payload.editedContent.instagram.status || "approved"
          };
        }
        if (payload.editedContent.facebook) {
          currentDraft.facebook = {
            caption: payload.editedContent.facebook.caption || currentDraft.facebook.caption,
            status: payload.editedContent.facebook.status || "approved"
          };
        }
        if (payload.editedContent.linkedin) {
          currentDraft.linkedin = {
            caption: payload.editedContent.linkedin.caption || currentDraft.linkedin.caption,
            status: payload.editedContent.linkedin.status || "approved"
          };
        }
      } else if (run.social_drafts.length > 0) {
        // Mark all platform captions approved
        run.social_drafts[0].instagram.status = "approved";
        run.social_drafts[0].facebook.status = "approved";
        run.social_drafts[0].linkedin.status = "approved";
      }

      // Check if all platforms are approved
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
      }
    } else if (payload.decision === "revision_requested") {
      run.status = "writing_social";
    }
  }

  run.updated_at = now;
  runs[runIndex] = run;
  writeRunsToDisk(runs);

  return { success: true, run, review: newReview };
}
