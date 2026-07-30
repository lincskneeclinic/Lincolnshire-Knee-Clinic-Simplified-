import { MetadataRoute } from "next";
import { blogArticles } from "@/data/articles";
import { conditionsData } from "@/data/conditions";
import { symptomsData } from "@/data/symptoms";
import { treatmentsData } from "@/data/treatments";
import { injectionsData } from "@/data/injections";
import { SITE_URL } from "@/lib/site";
import { getRemovedArticleSlugs } from "@/lib/educationArticles";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const removedSlugs = await getRemovedArticleSlugs();

  const staticPages = [
    "",
    "/about",
    "/symptoms",
    "/conditions",
    "/treatments",
    "/injections",
    "/education",
    "/clinics",
    "/contact",
    "/book-appointment",
    "/patient-reviews",
    // "/hospital-affiliations" and "/professional-registrations" are intentionally
    // excluded: both still show a "Draft Content Notice" banner and are noindex'd
    // (see their page.tsx metadata) pending clinical/legal review.
    "/urgent-advice",
    "/clinical-knowledge-hub",
    "/recovery",
    "/research",
    "/diagnostics",
    "/newsletter",
  ];

  const conditionSlugs = Object.keys(conditionsData);
  const symptomSlugs = Object.keys(symptomsData);
  const treatmentSlugs = Object.keys(treatmentsData);

  // injectionsData backs 4 of the 5 injection routes; "ultrasound-guided-knee-injections"
  // is a standalone route (app/injections/ultrasound-guided-knee-injections/page.tsx)
  // not driven by injections.ts, so it's added explicitly here.
  const injectionSlugs = [
    ...injectionsData.map((injection) => injection.slug),
    "ultrasound-guided-knee-injections",
  ];

  // lastModified is intentionally omitted: none of the content sources below
  // (data/*.ts) track a real per-page last-edited date, and stamping every
  // entry with the request-time `new Date()` made every page look freshly
  // modified on every crawl, which undermines the signal for search engines.
  // Add real per-page lastModified values once content authoring tracks them.
  const sitemapEntries: MetadataRoute.Sitemap = [
    ...staticPages.map((route) => ({
      url: `${baseUrl}${route}`,
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1.0 : 0.8,
    })),
    ...conditionSlugs.map((slug) => ({
      url: `${baseUrl}/conditions/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...symptomSlugs.map((slug) => ({
      url: `${baseUrl}/symptoms/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...treatmentSlugs.map((slug) => ({
      url: `${baseUrl}/treatments/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...injectionSlugs.map((slug) => ({
      url: `${baseUrl}/injections/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...Object.values(blogArticles)
      .filter((article) => !removedSlugs.includes(article.slug))
      .map((article) => ({
        url: `${baseUrl}/education/${article.category}/${article.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
  ];

  return sitemapEntries;
}
