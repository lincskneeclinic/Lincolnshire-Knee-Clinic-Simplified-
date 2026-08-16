import { NextResponse } from "next/server";
import { blogArticles } from "@/data/articles";
import { getRemovedArticles, getArticleOverrides, getArticleViewCounts, getArticleFeedbackCounts, getDynamicArticles } from "@/lib/educationArticles";

export async function GET() {
  try {
    const [removedArticles, overrides, viewCounts, feedbackCounts, dynamicArticles] = await Promise.all([
      getRemovedArticles(),
      getArticleOverrides(),
      getArticleViewCounts(),
      getArticleFeedbackCounts(),
      // Every AI-published blog/technical article (content pipeline + the
      // standalone social batch's auto-triggered companion articles) lives
      // here, not in data/articles.ts — omitting these meant every AI-
      // published article was invisible on this tab, views/feedback included.
      getDynamicArticles(),
    ]);

    const allArticles: Record<string, (typeof blogArticles)[keyof typeof blogArticles]> = {
      ...blogArticles,
      ...dynamicArticles,
    };

    // Group active (non-removed) articles by category to determine which ones are "archived" (older than top 6)
    const categoryGroups: Record<string, typeof blogArticles[keyof typeof blogArticles][]> = {};

    Object.values(allArticles).forEach((a) => {
      const isRemoved = Boolean(removedArticles[a.slug]);
      if (!isRemoved) {
        if (!categoryGroups[a.category]) {
          categoryGroups[a.category] = [];
        }
        categoryGroups[a.category].push(a);
      }
    });

    // Sort each category by datePublished descending
    Object.keys(categoryGroups).forEach((cat) => {
      categoryGroups[cat].sort(
        (a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime()
      );
    });

    const articles = Object.values(allArticles)
      .map((a) => {
        const isRemoved = Boolean(removedArticles[a.slug]);
        let isArchived = false;
        
        if (!isRemoved && categoryGroups[a.category]) {
          const indexInCat = categoryGroups[a.category].findIndex((item) => item.slug === a.slug);
          if (indexInCat >= 6) {
            isArchived = true;
          }
        }

        return {
          slug: a.slug,
          title: a.title,
          category: a.category,
          categoryLabel: a.categoryLabel,
          image: a.image,
          datePublished: a.datePublished,
          removed: isRemoved,
          removedAt: removedArticles[a.slug] || null,
          updatedAt: overrides[a.slug]?.updatedAt || null,
          views: viewCounts[a.slug] || 0,
          feedbackUp: feedbackCounts[a.slug]?.up || 0,
          feedbackDown: feedbackCounts[a.slug]?.down || 0,
          archived: isArchived,
        };
      })
      .sort((a, b) => {
        // Sort removed to the bottom, archived to the bottom of active, then title
        if (a.removed !== b.removed) return a.removed ? 1 : -1;
        if (a.archived !== b.archived) return a.archived ? 1 : -1;
        return a.title.localeCompare(b.title);
      });

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    console.error("Error in GET /api/portal/education-articles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load Education Hub articles" },
      { status: 500 }
    );
  }
}
