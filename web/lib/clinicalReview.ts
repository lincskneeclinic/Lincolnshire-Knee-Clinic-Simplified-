import fs from "fs";
import path from "path";
import { symptomsData } from "@/data/symptoms";
import { conditionsData } from "@/data/conditions";
import { treatmentsData } from "@/data/treatments";
import { injectionsData } from "@/data/injections";

export type ContentType = "symptoms" | "conditions" | "treatments" | "injections";

export interface ReviewablePage {
  pageId: string;
  contentType: ContentType;
  slug: string;
  name: string;
  url: string;
}

export interface ClinicalReviewEntry {
  reviewed: boolean;
  reviewerName?: string;
  reviewerTitle?: string;
  lastReviewedDate?: string;
  evidenceSource?: string;
  updatedAt?: string;
}

const REGISTRY_PATH = path.join(process.cwd(), "data", "clinical-review-status.json");

/**
 * Full manifest of every page that shows a ClinicalMetadataBlock, built from the
 * existing content data files plus the 2 standalone injection pages that have no
 * backing data record. This is the source of truth for what the dashboard lists —
 * the JSON registry only stores review status for pages an admin has touched.
 */
export function getAllReviewablePages(): ReviewablePage[] {
  const pages: ReviewablePage[] = [];

  for (const symptom of Object.values(symptomsData)) {
    pages.push({
      pageId: `symptoms/${symptom.slug}`,
      contentType: "symptoms",
      slug: symptom.slug,
      name: symptom.name,
      url: `/symptoms/${symptom.slug}`,
    });
  }

  for (const condition of Object.values(conditionsData)) {
    pages.push({
      pageId: `conditions/${condition.slug}`,
      contentType: "conditions",
      slug: condition.slug,
      name: condition.name,
      url: `/conditions/${condition.slug}`,
    });
  }

  for (const treatment of Object.values(treatmentsData)) {
    pages.push({
      pageId: `treatments/${treatment.slug}`,
      contentType: "treatments",
      slug: treatment.slug,
      name: treatment.name,
      url: `/treatments/${treatment.slug}`,
    });
  }

  for (const injection of injectionsData) {
    pages.push({
      pageId: `injections/${injection.slug}`,
      contentType: "injections",
      slug: injection.slug,
      name: injection.title,
      url: `/injections/${injection.slug}`,
    });
  }

  pages.push({
    pageId: "injections/hub",
    contentType: "injections",
    slug: "hub",
    name: "Injections Hub",
    url: "/injections",
  });
  pages.push({
    pageId: "injections/ultrasound-guided-knee-injections",
    contentType: "injections",
    slug: "ultrasound-guided-knee-injections",
    name: "Ultrasound-Guided Knee Injections",
    url: "/injections/ultrasound-guided-knee-injections",
  });

  return pages;
}

export function getReviewRegistry(): Record<string, ClinicalReviewEntry> {
  try {
    if (!fs.existsSync(REGISTRY_PATH)) return {};
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8") || "{}");
  } catch (err) {
    console.error("Failed to read clinical review registry:", err);
    return {};
  }
}

export function writeReviewRegistry(registry: Record<string, ClinicalReviewEntry>): boolean {
  try {
    const dir = path.dirname(REGISTRY_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Failed to write clinical review registry:", err);
    return false;
  }
}

/** Used by public page templates to render ClinicalMetadataBlock. */
export function getClinicalReviewStatus(pageId: string): ClinicalReviewEntry {
  const registry = getReviewRegistry();
  return registry[pageId] || { reviewed: false };
}
