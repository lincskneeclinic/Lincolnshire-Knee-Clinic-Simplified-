import { NextResponse } from "next/server";
import { getArticleFeedbackComments } from "@/lib/educationArticles";

// Surfaces the free-text "what could we improve?" comments left alongside a
// thumbs-down on ArticleFeedbackWidget — captured since the widget shipped
// but never previously readable anywhere in the portal, only the up/down
// counts were. Fetched on demand per article rather than bundled into the
// main education-articles list response, since most articles have none.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const comments = await getArticleFeedbackComments(slug);
    return NextResponse.json({ success: true, comments });
  } catch (error: any) {
    console.error("Error in GET /api/portal/education-articles/:slug/comments:", error);
    return NextResponse.json({ success: false, error: "Failed to load comments" }, { status: 500 });
  }
}
