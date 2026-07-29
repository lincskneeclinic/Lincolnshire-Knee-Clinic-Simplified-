import fs from "fs";
import path from "path";
import crypto from "crypto";
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
  // null for pages with no backing data-file entry (e.g. injections/hub) —
  // there's nothing to diff, so they're manual-review-only.
  contentHash: string | null;
}

export interface ClinicalReviewEntry {
  reviewed: boolean;
  reviewerName?: string;
  reviewerTitle?: string;
  lastReviewedDate?: string;
  evidenceSource?: string;
  updatedAt?: string;
  // Content hash captured at the moment `reviewed` was set true, so later
  // edits to the underlying data can be detected.
  reviewedContentHash?: string;
  // Runtime-only, never persisted: true when reviewed was auto-reverted to
  // false because the page's content changed since reviewedContentHash was
  // captured. Computed fresh on every read by getClinicalReviewStatus().
  staleReview?: boolean;
}

function hashContent(entry: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(entry)).digest("hex");
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
      contentHash: hashContent(symptom),
    });
  }

  for (const condition of Object.values(conditionsData)) {
    pages.push({
      pageId: `conditions/${condition.slug}`,
      contentType: "conditions",
      slug: condition.slug,
      name: condition.name,
      url: `/conditions/${condition.slug}`,
      contentHash: hashContent(condition),
    });
  }

  for (const treatment of Object.values(treatmentsData)) {
    pages.push({
      pageId: `treatments/${treatment.slug}`,
      contentType: "treatments",
      slug: treatment.slug,
      name: treatment.name,
      url: `/treatments/${treatment.slug}`,
      contentHash: hashContent(treatment),
    });
  }

  for (const injection of injectionsData) {
    pages.push({
      pageId: `injections/${injection.slug}`,
      contentType: "injections",
      slug: injection.slug,
      name: injection.title,
      url: `/injections/${injection.slug}`,
      contentHash: hashContent(injection),
    });
  }

  pages.push({
    pageId: "injections/hub",
    contentType: "injections",
    slug: "hub",
    name: "Injections Hub",
    url: "/injections",
    contentHash: null,
  });
  pages.push({
    pageId: "injections/ultrasound-guided-knee-injections",
    contentType: "injections",
    slug: "ultrasound-guided-knee-injections",
    name: "Ultrasound-Guided Knee Injections",
    url: "/injections/ultrasound-guided-knee-injections",
    contentHash: null,
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

/** Current content hash for a page, or null if it has no backing data entry. */
export function getCurrentContentHash(pageId: string): string | null {
  const page = getAllReviewablePages().find((p) => p.pageId === pageId);
  return page?.contentHash ?? null;
}

/**
 * Used by public page templates to render ClinicalMetadataBlock, and by the
 * dashboard's list/detail views. If a page was marked reviewed but its
 * content has since changed (current hash no longer matches what was
 * reviewed), this auto-reports reviewed:false (with staleReview:true) even
 * though the stored registry entry still says reviewed:true — the
 * underlying reviewer/date/evidence fields are left untouched so the
 * dashboard can still show what was last approved.
 */
export function getClinicalReviewStatus(pageId: string): ClinicalReviewEntry {
  const registry = getReviewRegistry();
  const entry = registry[pageId];
  if (!entry) return { reviewed: false };

  if (entry.reviewed) {
    const currentHash = getCurrentContentHash(pageId);
    if (currentHash !== null && currentHash !== entry.reviewedContentHash) {
      return { ...entry, reviewed: false, staleReview: true };
    }
  }

  return entry;
}
