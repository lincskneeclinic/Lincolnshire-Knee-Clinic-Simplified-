import { NextResponse } from "next/server";
import { getSocialOnlyPost, updateSocialOnlyPost, deleteSocialOnlyPost, SocialOnlyPost } from "@/lib/socialOnlyPosts";
import { rewriteSocialCaption } from "@/lib/socialWriterAgent";

export const maxDuration = 60;

type Platform = "instagram" | "facebook" | "linkedin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await getSocialOnlyPost(id);
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error("Error in GET /api/portal/social-only/[id]:", error);
    return NextResponse.json({ success: false, error: "Failed to load post" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const platform: Platform | undefined = body.platform;

    if (!platform || !["instagram", "facebook", "linkedin"].includes(platform)) {
      return NextResponse.json({ success: false, error: "A valid platform is required." }, { status: 400 });
    }

    const existing = await getSocialOnlyPost(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Post not found." }, { status: 404 });
    }

    if (body.action === "regenerate") {
      const rewritten = await rewriteSocialCaption(
        existing.topic,
        platform,
        existing[platform].caption,
        body.revisionNotes
      );
      const updated = await updateSocialOnlyPost(id, (post) => ({
        ...post,
        [platform]: {
          ...post[platform],
          caption: rewritten.caption,
          imagePromptSuggestion: rewritten.imagePromptSuggestion,
          status: "pending",
        },
      }));
      return NextResponse.json({ success: true, post: updated });
    }

    const updated = await updateSocialOnlyPost(id, (post) => {
      const next: SocialOnlyPost = { ...post };
      next[platform] = {
        ...post[platform],
        caption: body.caption !== undefined ? body.caption : post[platform].caption,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : post[platform].imageUrl,
        status: body.status !== undefined ? body.status : post[platform].status,
      };
      return next;
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    console.error("Error in PATCH /api/portal/social-only/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSocialOnlyPost(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/portal/social-only/[id]:", error);
    return NextResponse.json({ success: false, error: "Failed to delete post" }, { status: 500 });
  }
}
