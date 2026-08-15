import { NextResponse } from "next/server";
import {
  getSocialOnlyPost,
  updateSocialOnlyPost,
  deleteSocialOnlyPost,
  archiveSocialOnlyPost,
  unarchiveSocialOnlyPost,
  SocialOnlyPost,
} from "@/lib/socialOnlyPosts";
import { rewriteSocialCaption, rewriteCarouselSlides } from "@/lib/socialWriterAgent";

export const maxDuration = 60;

type Platform = "instagram" | "facebook" | "linkedin" | "instagramStory" | "instagramCarousel" | "instagramReel";

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

    // Post-level actions — apply to the whole post, not one platform's caption.
    if (body.action === "archive" || body.action === "unarchive") {
      const updated =
        body.action === "archive" ? await archiveSocialOnlyPost(id) : await unarchiveSocialOnlyPost(id);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Post not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, post: updated });
    }

    const platform: Platform | undefined = body.platform;

    if (!platform || !["instagram", "facebook", "linkedin", "instagramStory", "instagramCarousel", "instagramReel"].includes(platform)) {
      return NextResponse.json({ success: false, error: "A valid platform is required." }, { status: 400 });
    }

    const existing = await getSocialOnlyPost(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Post not found." }, { status: 404 });
    }

    if (platform === "instagramCarousel") {
      if (body.action === "regenerate") {
        const rewritten = await rewriteCarouselSlides(
          existing.topic,
          existing.instagramCarousel?.slides || [],
          body.revisionNotes
        );
        const updated = await updateSocialOnlyPost(id, (post) => ({
          ...post,
          instagramCarousel: {
            caption: rewritten.caption,
            imagePromptSuggestion: rewritten.imagePromptSuggestion,
            slides: rewritten.slides,
            status: "pending",
          },
        }));
        return NextResponse.json({ success: true, post: updated });
      }

      const updated = await updateSocialOnlyPost(id, (post) => {
        const next: SocialOnlyPost = { ...post };
        const existingCarousel = post.instagramCarousel || { caption: "", imagePromptSuggestion: "", slides: [], status: "pending" };
        next.instagramCarousel = {
          caption: body.caption !== undefined ? body.caption : existingCarousel.caption,
          imagePromptSuggestion: body.imagePromptSuggestion !== undefined ? body.imagePromptSuggestion : existingCarousel.imagePromptSuggestion,
          slides: body.slides !== undefined ? body.slides : existingCarousel.slides,
          status: body.status !== undefined ? body.status : existingCarousel.status,
        };
        return next;
      });
      return NextResponse.json({ success: true, post: updated });
    }

    if (platform === "instagramReel") {
      if (body.action === "regenerate") {
        const rewritten = await rewriteSocialCaption(
          existing.topic,
          platform,
          existing.instagramReel?.script || "",
          body.revisionNotes
        );
        const updated = await updateSocialOnlyPost(id, (post) => ({
          ...post,
          instagramReel: {
            caption: rewritten.caption,
            imagePromptSuggestion: rewritten.imagePromptSuggestion,
            script: rewritten.caption,
            status: "pending",
          },
        }));
        return NextResponse.json({ success: true, post: updated });
      }

      const updated = await updateSocialOnlyPost(id, (post) => {
        const next: SocialOnlyPost = { ...post };
        const existingReel = post.instagramReel || { caption: "", imagePromptSuggestion: "", script: "", status: "pending" };
        next.instagramReel = {
          caption: body.caption !== undefined ? body.caption : existingReel.caption,
          imagePromptSuggestion: body.imagePromptSuggestion !== undefined ? body.imagePromptSuggestion : existingReel.imagePromptSuggestion,
          script: body.script !== undefined ? body.script : existingReel.script,
          status: body.status !== undefined ? body.status : existingReel.status,
          videoUrl: body.videoUrl !== undefined ? body.videoUrl : existingReel.videoUrl,
          videoSource: body.videoSource !== undefined ? body.videoSource : existingReel.videoSource,
        };
        return next;
      });
      return NextResponse.json({ success: true, post: updated });
    }

    // instagram, facebook, linkedin, instagramStory
    const p = platform as "instagram" | "facebook" | "linkedin" | "instagramStory";

    if (body.action === "regenerate") {
      const rewritten = await rewriteSocialCaption(
        existing.topic,
        p,
        existing[p]?.caption || "",
        body.revisionNotes
      );
      const updated = await updateSocialOnlyPost(id, (post) => ({
        ...post,
        [p]: {
          ...post[p],
          caption: rewritten.caption,
          imagePromptSuggestion: rewritten.imagePromptSuggestion,
          status: "pending",
        },
      }));
      return NextResponse.json({ success: true, post: updated });
    }

    const updated = await updateSocialOnlyPost(id, (post) => {
      const next: SocialOnlyPost = { ...post };
      next[p] = {
        ...post[p],
        caption: body.caption !== undefined ? body.caption : post[p]?.caption || "",
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : post[p]?.imageUrl,
        status: body.status !== undefined ? body.status : post[p]?.status || "pending",
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
