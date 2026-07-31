import { NextResponse } from "next/server";
import { blogArticles } from "@/data/articles";
import { getRemovedArticles, getArticleOverrides, getArticleViewCounts } from "@/lib/educationArticles";

export async function GET() {
  try {
    const [removedArticles, overrides, viewCounts] = await Promise.all([
      getRemovedArticles(),
      getArticleOverrides(),
      getArticleViewCounts(),
    ]);

    const articles = Object.values(blogArticles)
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        category: a.category,
        categoryLabel: a.categoryLabel,
        image: a.image,
        datePublished: a.datePublished,
        removed: Boolean(removedArticles[a.slug]),
        removedAt: removedArticles[a.slug] || null,
        updatedAt: overrides[a.slug]?.updatedAt || null,
        views: viewCounts[a.slug] || 0,
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
