import { NextResponse } from "next/server";
import { blogArticles } from "@/data/articles";
import { removeArticleFromEducationHub, restoreArticleToEducationHub } from "@/lib/educationArticles";

export async function POST(request: Request) {
  try {
    const { slug, action } = await request.json();

    if (!slug || typeof slug !== "string" || !blogArticles[slug]) {
      return NextResponse.json(
        { success: false, error: "Unknown article slug." },
        { status: 400 }
      );
    }

    if (action === "restore") {
      await restoreArticleToEducationHub(slug);
    } else {
      await removeArticleFromEducationHub(slug);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in POST /api/portal/education-articles/remove:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update the article's Education Hub visibility" },
      { status: 500 }
    );
  }
}
