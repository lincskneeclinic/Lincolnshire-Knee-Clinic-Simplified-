import { getStoreValue, setStoreValue } from "./dataStore";

// Articles live as static entries in data/articles.ts (title, body, images, etc. are
// authored/edited via code changes and a redeploy, same as the rest of the site).
// "Removing" one from the Education Hub doesn't touch that source content — it just
// records the slug here so the public pages (which re-check this list on a short ISR
// interval, see app/education/[category]/page.tsx and [article]/page.tsx) filter it
// out. That makes remove/restore an instant, code-free action from the dashboard.
const REMOVED_ARTICLES_KEY = "removed-education-articles";

export async function getRemovedArticleSlugs(): Promise<string[]> {
  return getStoreValue<string[]>(REMOVED_ARTICLES_KEY, []);
}

export async function removeArticleFromEducationHub(slug: string): Promise<void> {
  const current = await getRemovedArticleSlugs();
  if (!current.includes(slug)) {
    await setStoreValue(REMOVED_ARTICLES_KEY, [...current, slug]);
  }
}

export async function restoreArticleToEducationHub(slug: string): Promise<void> {
  const current = await getRemovedArticleSlugs();
  await setStoreValue(REMOVED_ARTICLES_KEY, current.filter((s) => s !== slug));
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
