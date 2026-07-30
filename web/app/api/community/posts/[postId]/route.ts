import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { attachDisplayNames } from "@/lib/community";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const supabase = await createClient();

    const { data: post, error } = await supabase
      .from("community_posts")
      .select("id, room_id, title, body, author_id, status, created_at")
      .eq("id", postId)
      .maybeSingle();

    if (error || !post) {
      return NextResponse.json({ success: false, message: "Post not found." }, { status: 404 });
    }

    const [{ data: room }, [postWithAuthor]] = await Promise.all([
      supabase.from("community_rooms").select("slug, name").eq("id", post.room_id).maybeSingle(),
      attachDisplayNames(supabase, [post]),
    ]);

    return NextResponse.json({ success: true, room, post: postWithAuthor });
  } catch (error) {
    console.error("Error in GET /api/community/posts/[postId]:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}

/** Author-only soft delete. Moderator hide/remove goes through the admin route instead. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Please log in." }, { status: 401 });
    }

    const { error } = await supabase
      .from("community_posts")
      .update({ status: "deleted" })
      .eq("id", postId)
      .eq("author_id", user.id);

    if (error) {
      console.error("Error deleting community post:", error);
      return NextResponse.json({ success: false, message: "Failed to delete post." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/community/posts/[postId]:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}
