import { getStoreValue, setStoreValue } from "./dataStore";
import { createAdminClient } from "./supabase/admin";
import { type ArticleContent } from "@/data/articles";

// Articles live as static entries in data/articles.ts (title, body, images, etc. are
// authored/edited via code changes and a redeploy, same as the rest of the site).
// "Removing" one from the Education Hub doesn't touch that source content — it just
// records the slug here so the public pages (which re-check this list on a short ISR
// interval, see app/education/[category]/page.tsx and [article]/page.tsx) filter it
// out. That makes remove/restore an instant, code-free action from the dashboard.
const REMOVED_ARTICLES_KEY = "removed-education-articles";

// Maps slug -> the ISO timestamp it was removed at, so the dashboard archive view can
// show "Removed: <date>". Kept as a map (not a bare array) for that reason; the public
// pages only ever need to know WHETHER a slug is removed, so getRemovedArticleSlugs()
// below stays as a simple string[] derived from this map's keys — no changes needed to
// any code that only checked slug membership.
export async function getRemovedArticles(): Promise<Record<string, string>> {
  return getStoreValue<Record<string, string>>(REMOVED_ARTICLES_KEY, {});
}

export async function getRemovedArticleSlugs(): Promise<string[]> {
  return Object.keys(await getRemovedArticles());
}

export async function removeArticleFromEducationHub(slug: string): Promise<void> {
  const current = await getRemovedArticles();
  if (!(slug in current)) {
    await setStoreValue(REMOVED_ARTICLES_KEY, { ...current, [slug]: new Date().toISOString() });
  }
}

export async function restoreArticleToEducationHub(slug: string): Promise<void> {
  const current = await getRemovedArticles();
  const { [slug]: _removed, ...rest } = current;
  await setStoreValue(REMOVED_ARTICLES_KEY, rest);
}

// An "Update" run (see contentPipeline.createRunFromArticle) lets an editor revise an
// already-published article through the normal content pipeline editor. Approving that
// run's blog draft writes the result here instead of touching data/articles.ts, so the
// revision goes live on an ISR refresh (see app/education/[category]/[article]/page.tsx)
// rather than needing a code change + redeploy, exactly like remove/restore above.
export interface ArticleOverride {
  title: string;
  excerpt: string;
  body_markdown: string;
  references: string[];
  featuredImage?: string;
  imageAlt?: string;
  category?: string;
  updatedAt: string;
}

const ARTICLE_OVERRIDES_KEY = "education-article-overrides";

export async function getArticleOverrides(): Promise<Record<string, ArticleOverride>> {
  return getStoreValue<Record<string, ArticleOverride>>(ARTICLE_OVERRIDES_KEY, {});
}

export async function getArticleOverride(slug: string): Promise<ArticleOverride | null> {
  const overrides = await getArticleOverrides();
  return overrides[slug] || null;
}

export async function setArticleOverride(slug: string, override: ArticleOverride): Promise<void> {
  const overrides = await getArticleOverrides();
  overrides[slug] = override;
  await setStoreValue(ARTICLE_OVERRIDES_KEY, overrides);
}

// Links a content pipeline run_id back to the Education Hub article slug it's
// revising. Kept in its own KV entry (rather than a column on content_pipeline_runs)
// since that table's schema is fixed and adding a column there needs a DB migration
// this app can't run itself through the Supabase REST API.
const UPDATE_RUN_LINKS_KEY = "education-update-run-links";

export async function linkRunToArticle(runId: string, slug: string): Promise<void> {
  const links = await getStoreValue<Record<string, string>>(UPDATE_RUN_LINKS_KEY, {});
  links[runId] = slug;
  await setStoreValue(UPDATE_RUN_LINKS_KEY, links);
}

export async function getArticleSlugForRun(runId: string): Promise<string | null> {
  const links = await getStoreValue<Record<string, string>>(UPDATE_RUN_LINKS_KEY, {});
  return links[runId] || null;
}

// Public-facing view counter. The article page is ISR-rendered (5-minute revalidate),
// so its server code only re-runs once per revalidation window rather than once per
// real visitor — incrementing here has to be driven by a client-side beacon on page
// load (see components/ArticleViewCounter.tsx + app/api/education-views/[slug]/route.ts)
// rather than during server render, or it would drastically undercount real traffic.
//
// Prefers a real atomic Postgres counter (the article_view_counts table +
// increment_article_view() function — see docs/sql/article-view-counts.sql) so
// concurrent views can't clobber each other. Until that one-time SQL snippet has been
// run in the Supabase SQL Editor, both functions silently fall back to the original
// unlocked read-modify-write against a KV blob (same tradeoff
// app/api/newsletter/poll/route.ts already accepts for its vote counts) — so the
// feature works today either way, and upgrades itself automatically once the table
// exists, with no code change needed at that point.
const ARTICLE_VIEWS_KEY = "education-article-views";

export async function getArticleViewCounts(): Promise<Record<string, number>> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("article_view_counts").select("slug, views");
    if (!error && Array.isArray(data)) {
      const result: Record<string, number> = {};
      data.forEach((row: { slug: string; views: number }) => {
        result[row.slug] = row.views;
      });
      return result;
    }
  } catch {
    // article_view_counts probably doesn't exist yet — fall through to the KV store.
  }
  return getStoreValue<Record<string, number>>(ARTICLE_VIEWS_KEY, {});
}

// "Was this helpful?" feedback — see components/education/ArticleFeedbackWidget.tsx
// and app/api/education-feedback/[slug]/route.ts. Plain KV read-modify-write, same
// accepted concurrency tradeoff as app/api/newsletter/poll/route.ts's vote counts —
// feedback volume per article is low enough that a lost increment under a race is an
// acceptable risk, so this doesn't need the atomic-Postgres-counter treatment
// getArticleViewCounts() above has.
const ARTICLE_FEEDBACK_KEY = "article-feedback";

export interface ArticleFeedbackSummary {
  up: number;
  down: number;
  commentCount: number;
}

export async function getArticleFeedbackCounts(): Promise<Record<string, ArticleFeedbackSummary>> {
  const feedback = await getStoreValue<Record<string, { up: number; down: number; comments: unknown[] }>>(
    ARTICLE_FEEDBACK_KEY,
    {}
  );
  const result: Record<string, ArticleFeedbackSummary> = {};
  for (const [slug, entry] of Object.entries(feedback)) {
    result[slug] = { up: entry.up || 0, down: entry.down || 0, commentCount: entry.comments?.length || 0 };
  }
  return result;
}

export async function incrementArticleView(slug: string): Promise<number> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("increment_article_view", { p_slug: slug });
    if (!error && typeof data === "number") {
      return data;
    }
  } catch {
    // increment_article_view() probably doesn't exist yet — fall through to the KV store.
  }

  const counts = await getStoreValue<Record<string, number>>(ARTICLE_VIEWS_KEY, {});
  const next = (counts[slug] || 0) + 1;
  counts[slug] = next;
  await setStoreValue(ARTICLE_VIEWS_KEY, counts);
  return next;
}

export const DYNAMIC_ARTICLES_KEY = "education-dynamic-articles";

export async function getDynamicArticles(): Promise<Record<string, ArticleContent>> {
  return getStoreValue<Record<string, ArticleContent>>(DYNAMIC_ARTICLES_KEY, {});
}

export async function saveDynamicArticle(slug: string, article: ArticleContent): Promise<void> {
  const articles = await getDynamicArticles();
  articles[slug] = article;
  await setStoreValue(DYNAMIC_ARTICLES_KEY, articles);
}

// Below this, a "technical article" is really just the clinic logo, a title,
// and a references list — not a real page. Guards against publishing that as
// live content regardless of how the draft ended up empty (a generation
// failure whose error-placeholder text got stripped by cleanClinicalReviewFlags,
// a version that lost its article_* fields some other way, etc.) — silently
// shipping a near-blank "article" page is worse than blocking the publish and
// telling the reviewer to fix or regenerate it first.
const MIN_ARTICLE_BODY_LENGTH = 200;

export async function publishBlogDraftToWebsite(run: any): Promise<string> {
  const draft = run.blog_drafts?.[0];
  if (!draft) {
    throw new Error("No blog draft found in the run to publish");
  }

  const technicalBodyCheck = cleanClinicalReviewFlags(draft.article_body_markdown || draft.article_body || "");
  if (technicalBodyCheck.trim().length < MIN_ARTICLE_BODY_LENGTH) {
    throw new Error(
      "The technical article's content is missing or too short to publish (this usually means generation failed silently or the draft lost its article content). Go to the article's editor, regenerate or rewrite the technical article body, then try publishing again."
    );
  }

  const slug = (draft.title || run.topic)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const category = draft.category || "knee-arthritis";
  
  // Format category label
  let categoryLabel = "Knee Arthritis";
  if (category === "knee-replacement") categoryLabel = "Knee Replacement";
  else if (category === "sports-knee-injuries") categoryLabel = "Sports Knee Injuries";
  else if (category === "injections") categoryLabel = "Injections";
  else if (category === "recovery-and-rehabilitation") categoryLabel = "Recovery & Rehab";
  else if (category === "patient-guides") categoryLabel = "Patient Guides";
  else if (category === "faqs") categoryLabel = "FAQs";

  // 1. Publish the Technical Deep-Dive Article first
  const technicalSlug = `${slug}-technical`;
  const technicalTitle = draft.article_title || `${draft.title || run.topic} (Clinical Depth)`;
  const technicalExcerpt = draft.article_excerpt || draft.excerpt || "";
  const technicalCleanBody = technicalBodyCheck;

  // The technical article always uses the same hero image as its paired blog
  // post — product requirement, not just a fallback. Technical articles rarely
  // get their own separately-generated image list filled in, so sourcing the
  // hero from article_suggested_images (the previous behavior) meant almost
  // every published technical article silently fell back to the clinic logo
  // as its "hero image" instead.
  const blogFeaturedImage = (draft.suggested_images || []).find(
    (img: any) => typeof img === "object" && img !== null && img.isFeatured
  ) as any;
  const blogImageUrl =
    blogFeaturedImage?.url || (typeof draft.suggested_images?.[0] === "string" ? draft.suggested_images[0] : "");
  const technicalImageUrl = blogImageUrl || "/brand/lkc-logo-k-transparent.png";
  const technicalImageAlt = blogFeaturedImage?.label || draft.title || run.topic || technicalTitle;

  const technicalArticle: ArticleContent = {
    id: technicalSlug,
    slug: technicalSlug,
    category,
    categoryLabel,
    title: technicalTitle,
    description: technicalExcerpt,
    readTime: "15 min read", // Technical deep dive is 12-15 min read
    datePublished: new Date().toISOString().split("T")[0],
    author: "Mr Ricardo J Pacheco",
    authorTitle: "Consultant Orthopedic Surgeon",
    image: technicalImageUrl,
    imageAlt: technicalImageAlt,
    takeaways: [],
    sections: [],
    faqs: draft.article_faqs || [],
    references: draft.article_references || draft.references || [],
    relatedTopicSlugs: [],
    contentType: "article"
  };

  (technicalArticle as any).body_markdown = technicalCleanBody;
  await saveDynamicArticle(technicalSlug, technicalArticle);

  // 2. Format Layman Blog body and append link to technical article
  const cleanBody = cleanClinicalReviewFlags(draft.body_markdown || draft.body || "");
  const readMoreBlock = `\n\n---\n\n### 📖 Deep Dive & Scientific Evidence\nIf you want to know more about the clinical evidence, surgical techniques, and research on this topic, read our in-depth, technical article: **[${technicalTitle}](/education/${category}/${technicalSlug})** (12-15 min read).`;
  const blogBodyWithLink = `${cleanBody}${readMoreBlock}`;

  const featuredImage = (draft.suggested_images || []).find(
    (img: any) => typeof img === "object" && img !== null && img.isFeatured
  ) as any;
  const imageUrl = featuredImage?.url || (typeof draft.suggested_images?.[0] === "string" ? draft.suggested_images[0] : "") || "/brand/lkc-logo-k-transparent.png";

  const newArticle: ArticleContent = {
    id: slug,
    slug,
    category,
    categoryLabel,
    title: draft.title || run.topic,
    description: draft.excerpt || "",
    readTime: "8 min read", // Layman blog is 8-10 min read
    datePublished: new Date().toISOString().split("T")[0],
    author: "Mr Ricardo J Pacheco",
    authorTitle: "Consultant Orthopedic Surgeon",
    image: imageUrl,
    imageAlt: featuredImage?.label || draft.title || run.topic,
    takeaways: [],
    sections: [],
    faqs: draft.faqs || [],
    references: draft.references || [],
    relatedTopicSlugs: [],
    contentType: "blog"
  };

  // Attach the markdown body with the link
  (newArticle as any).body_markdown = blogBodyWithLink;
  await saveDynamicArticle(slug, newArticle);

  return slug;
}

export function cleanClinicalReviewFlags(text: string): string {
  // Removes any line containing [NEEDS CLINICAL REVIEW] (gi handles global, case-insensitive)
  return text.replace(/\[NEEDS CLINICAL REVIEW[^\n\r]*/gi, "").trim();
}

