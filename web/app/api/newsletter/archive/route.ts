import { NextResponse } from "next/server";
import { blogArticles } from "@/data/articles";

export async function GET() {
  const archives = Object.values(blogArticles)
    .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime())
    .map((article) => ({
      id: article.id || article.slug,
      slug: article.slug,
      title: article.title,
      excerpt: article.description,
      dateSent: article.datePublished,
      category: article.categoryLabel,
      readTime: article.readTime,
      url: `/clinical-knowledge-hub/${article.slug}`,
    }));

  return NextResponse.json({
    success: true,
    archives,
  });
}
