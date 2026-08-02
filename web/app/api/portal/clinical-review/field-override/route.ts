import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllReviewablePages } from "@/lib/clinicalReview";
import { getEditableFieldType, setFieldOverride } from "@/lib/contentFieldOverrides";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageId, fieldName, value } = body;

    if (!pageId || typeof pageId !== "string") {
      return NextResponse.json({ success: false, error: "pageId is required" }, { status: 400 });
    }
    if (!fieldName || typeof fieldName !== "string") {
      return NextResponse.json({ success: false, error: "fieldName is required" }, { status: 400 });
    }

    const page = getAllReviewablePages().find((p) => p.pageId === pageId);
    if (!page) {
      return NextResponse.json({ success: false, error: "Unknown pageId" }, { status: 400 });
    }

    const expectedType = getEditableFieldType(page.contentType, fieldName);
    if (!expectedType) {
      return NextResponse.json({ success: false, error: `"${fieldName}" is not an editable field.` }, { status: 400 });
    }

    const isCorrectShape = expectedType === "string[]" ? Array.isArray(value) : typeof value === "string";
    if (!isCorrectShape) {
      return NextResponse.json({ success: false, error: `Value for "${fieldName}" is the wrong shape.` }, { status: 400 });
    }

    await setFieldOverride(pageId, fieldName, value);
    revalidatePath(page.url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clinical review field-override error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 200 });
  }
}
