import { createAdminClient } from "@/lib/supabase/admin";
import { ContentType } from "@/lib/clinicalReview";
import { symptomsData, SymptomData } from "@/data/symptoms";
import { conditionsData, ConditionData } from "@/data/conditions";
import { treatmentsData, TreatmentData } from "@/data/treatments";
import { injectionsData, InjectionData } from "@/data/injections";

export type EditableFieldType = "string" | "string[]";

/**
 * Prose/list fields it's safe to let the AI Content Review panel propose a
 * fix for and a reviewer approve. Deliberately excludes structured fields
 * (faqs, related*, references, slug/name/category) — those need a different
 * editing shape than a single text/array swap, and aren't the kind of thing
 * an accuracy/clarity review would normally touch.
 */
export const EDITABLE_FIELDS: Record<ContentType, Record<string, EditableFieldType>> = {
  symptoms: {
    introduction: "string",
    whatIs: "string",
    durationPattern: "string",
    commonPresentations: "string[]",
    warningSigns: "string[]",
    assessment: "string[]",
    investigations: "string[]",
    initialManagement: "string[]",
    whenToConsult: "string[]",
  },
  conditions: {
    introduction: "string",
    whatIs: "string",
    symptoms: "string[]",
    causes: "string[]",
    assessment: "string[]",
    investigations: "string[]",
    treatments: "string[]",
    surgeryDetails: "string[]",
  },
  treatments: {
    introduction: "string",
    whatIs: "string",
    whatItInvolves: "string[]",
    suitability: "string[]",
    notSuitable: "string[]",
    alternatives: "string[]",
    risks: "string[]",
    recovery: "string[]",
    rehabilitation: "string[]",
  },
  injections: {
    description: "string",
    howItWorks: "string",
    whoConsidered: "string[]",
    whoNotSuitable: "string[]",
    benefits: "string[]",
    risksLimitations: "string[]",
    procedureSteps: "string[]",
    aftercareSteps: "string[]",
  },
};

export function getEditableFieldType(contentType: ContentType, fieldName: string): EditableFieldType | null {
  return EDITABLE_FIELDS[contentType][fieldName] || null;
}

/** All field overrides currently approved for one page, keyed by field name. */
export async function getFieldOverrides(pageId: string): Promise<Record<string, any>> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("content_field_overrides")
      .select("field_name, field_value")
      .eq("page_id", pageId);
    if (error || !data) return {};
    const overrides: Record<string, any> = {};
    for (const row of data as { field_name: string; field_value: any }[]) {
      overrides[row.field_name] = row.field_value;
    }
    return overrides;
  } catch (err) {
    console.error(`Failed to read field overrides for "${pageId}":`, err);
    return {};
  }
}

/** Persists one approved field fix. Throws on failure so the caller can surface a clear error. */
export async function setFieldOverride(pageId: string, fieldName: string, value: string | string[]): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("content_field_overrides").upsert({
    page_id: pageId,
    field_name: fieldName,
    field_value: value,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    throw new Error(`Failed to save field override: ${error.message}`);
  }
}

export async function getSymptomWithOverrides(slug: string): Promise<SymptomData | undefined> {
  const base = symptomsData[slug];
  if (!base) return undefined;
  const overrides = await getFieldOverrides(`symptoms/${slug}`);
  return { ...base, ...overrides };
}

export async function getConditionWithOverrides(slug: string): Promise<ConditionData | undefined> {
  const base = conditionsData[slug];
  if (!base) return undefined;
  const overrides = await getFieldOverrides(`conditions/${slug}`);
  return { ...base, ...overrides };
}

export async function getTreatmentWithOverrides(slug: string): Promise<TreatmentData | undefined> {
  const base = treatmentsData[slug];
  if (!base) return undefined;
  const overrides = await getFieldOverrides(`treatments/${slug}`);
  return { ...base, ...overrides };
}

export async function getInjectionWithOverrides(slug: string): Promise<InjectionData | undefined> {
  const base = injectionsData.find((i) => i.slug === slug);
  if (!base) return undefined;
  const overrides = await getFieldOverrides(`injections/${slug}`);
  return { ...base, ...overrides };
}
