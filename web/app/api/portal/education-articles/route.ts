import { NextResponse } from "next/server";
import { blogArticles } from "@/data/articles";
import { getRemovedArticleSlugs } from "@/lib/educationArticles";

export async function GET() {
  try {
    const removedSlugs = await getRemovedArticleSlugs();

    const articles = Object.values(blogArticles)
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        category: a.category,
        categoryLabel: a.categoryLabel,
        image: a.image,
        datePublished: a.datePublished,
        removed: removedSlugs.includes(a.slug),
      }))
      .sort((a, b) => (a.removed === b.removed ? a.title.localeCompare(b.title) : a.removed ? 1 : -1));

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    console.error("Error in GET /api/portal/education-articles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load Education Hub articles" },
      { status: 500 }
    );
  }
}
