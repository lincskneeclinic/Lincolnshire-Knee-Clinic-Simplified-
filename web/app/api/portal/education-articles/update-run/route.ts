import { NextResponse } from "next/server";
import { blogArticles } from "@/data/articles";
import { createRunFromArticle } from "@/lib/contentPipeline";

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== "string" || !blogArticles[slug]) {
      return NextResponse.json(
        { success: false, error: "Unknown article slug." },
        { status: 400 }
      );
    }

    const article = blogArticles[slug];
    const run = await createRunFromArticle(article);

    return NextResponse.json({ success: true, run });
  } catch (error: any) {
    console.error("Error in POST /api/portal/education-articles/update-run:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to start an update run for this article" },
      { status: 500 }
    );
  }
}
