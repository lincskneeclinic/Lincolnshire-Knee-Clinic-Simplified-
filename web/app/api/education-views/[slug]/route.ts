import { NextResponse } from "next/server";
import { blogArticles } from "@/data/articles";
import { getArticleViewCounts, incrementArticleView } from "@/lib/educationArticles";

// Deliberately outside /api/portal/* — real anonymous site visitors need to reach
// this (everything under /api/portal/ is Basic-Auth gated per middleware.ts).

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug || !blogArticles[slug]) {
    return NextResponse.json({ success: false, error: "Unknown article slug." }, { status: 400 });
  }
  const counts = await getArticleViewCounts();
  return NextResponse.json({ success: true, views: counts[slug] || 0 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug || !blogArticles[slug]) {
    return NextResponse.json({ success: false, error: "Unknown article slug." }, { status: 400 });
  }
  const views = await incrementArticleView(slug);
  return NextResponse.json({ success: true, views });
}
