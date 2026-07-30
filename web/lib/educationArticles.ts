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
