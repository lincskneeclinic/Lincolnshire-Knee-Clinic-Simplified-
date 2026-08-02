import { NextRequest, NextResponse } from "next/server";
import { getAllReviewablePages } from "@/lib/clinicalReview";
import {
  EDITABLE_FIELDS,
  getSymptomWithOverrides,
  getConditionWithOverrides,
  getTreatmentWithOverrides,
  getInjectionWithOverrides,
} from "@/lib/contentFieldOverrides";

export async function GET(request: NextRequest) {
  const pageId = request.nextUrl.searchParams.get("pageId");
  if (!pageId) {
    return NextResponse.json({ success: false, error: "pageId is required" }, { status: 400 });
  }

  const page = getAllReviewablePages().find((p) => p.pageId === pageId);
  if (!page) {
    return NextResponse.json({ success: false, error: "Unknown pageId" }, { status: 400 });
  }

  const data =
    page.contentType === "symptoms"
      ? await getSymptomWithOverrides(page.slug)
      : page.contentType === "conditions"
        ? await getConditionWithOverrides(page.slug)
        : page.contentType === "treatments"
          ? await getTreatmentWithOverrides(page.slug)
          : await getInjectionWithOverrides(page.slug);

  if (!data) {
    // The 2 hand-authored injection pages with no data-file entry — nothing structured to edit.
    return NextResponse.json({ success: true, available: false });
  }

  const editableFields = EDITABLE_FIELDS[page.contentType];
  const fields: Record<string, string | string[]> = {};
  for (const fieldName of Object.keys(editableFields)) {
    fields[fieldName] = (data as unknown as Record<string, unknown>)[fieldName] as string | string[];
  }

  return NextResponse.json({ success: true, available: true, fields, fieldTypes: editableFields });
}
