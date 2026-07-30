import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, attachDisplayNames } from "@/lib/community";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomSlug = searchParams.get("room");
    if (!roomSlug) {
      return NextResponse.json({ success: false, message: "A room is required." }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: room, error: roomError } = await supabase
      .from("community_rooms")
      .select("id, slug, name, description")
      .eq("slug", roomSlug)
      .maybeSingle();

    if (roomError || !room) {
      return NextResponse.json({ success: false, message: "Room not found." }, { status: 404 });
    }

    const { data: posts, error: postsError } = await supabase
      .from("community_posts")
      .select("id, title, body, author_id, status, created_at")
      .eq("room_id", room.id)
      .eq("status", "visible")
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("Error fetching community posts:", postsError);
      return NextResponse.json({ success: false, message: "Failed to load posts." }, { status: 500 });
    }

    const postIds = (posts || []).map((post) => post.id);
    const replyCounts: Record<string, number> = {};
    if (postIds.length > 0) {
      const { data: replies } = await supabase
        .from("community_replies")
        .select("post_id")
        .eq("status", "visible")
        .in("post_id", postIds);
      (replies || []).forEach((reply: { post_id: string }) => {
        replyCounts[reply.post_id] = (replyCounts[reply.post_id] || 0) + 1;
      });
    }

    const withAuthors = await attachDisplayNames(supabase, posts || []);

    return NextResponse.json({
      success: true,
      room,
      posts: withAuthors.map((post) => ({ ...post, replyCount: replyCounts[post.id] || 0 })),
    });
  } catch (error) {
    console.error("Error in GET /api/community/posts:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomSlug, title, body: postBody } = body;

    if (!roomSlug || typeof roomSlug !== "string") {
      return NextResponse.json({ success: false, message: "A room is required." }, { status: 400 });
    }
    const cleanTitle = typeof title === "string" ? title.trim() : "";
    const cleanBody = typeof postBody === "string" ? postBody.trim() : "";
    if (cleanTitle.length < 3 || cleanTitle.length > 150) {
      return NextResponse.json({ success: false, message: "Title must be between 3 and 150 characters." }, { status: 400 });
    }
    if (cleanBody.length < 10 || cleanBody.length > 8000) {
      return NextResponse.json({ success: false, message: "Post must be between 10 and 8000 characters." }, { status: 400 });
    }

    const supabase = await createClient();
    const { userId, profile } = await getCurrentProfile(supabase);

    if (!userId || !profile) {
      return NextResponse.json({ success: false, message: "Please log in to post." }, { status: 401 });
    }
    if (profile.status !== "active") {
      return NextResponse.json({ success: false, message: "Your account cannot currently post in the community." }, { status: 403 });
    }

    const { data: room, error: roomError } = await supabase
      .from("community_rooms")
      .select("id")
      .eq("slug", roomSlug)
      .maybeSingle();

    if (roomError || !room) {
      return NextResponse.json({ success: false, message: "Room not found." }, { status: 404 });
    }

    const { data: post, error: insertError } = await supabase
      .from("community_posts")
      .insert({ room_id: room.id, author_id: userId, title: cleanTitle, body: cleanBody })
      .select("id")
      .single();

    if (insertError) {
      console.error("Error creating community post:", insertError);
      return NextResponse.json({ success: false, message: "Failed to create post." }, { status: 500 });
    }

    return NextResponse.json({ success: true, postId: post.id });
  } catch (error) {
    console.error("Error in POST /api/community/posts:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}
