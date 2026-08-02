import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, attachDisplayNames } from "@/lib/community";
import { notifyPostAuthorOfReply } from "@/lib/communityNotifications";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const supabase = await createClient();

    const { data: replies, error } = await supabase
      .from("community_replies")
      .select("id, post_id, body, author_id, status, created_at")
      .eq("post_id", postId)
      .eq("status", "visible")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching community replies:", error);
      return NextResponse.json({ success: false, message: "Failed to load replies." }, { status: 500 });
    }

    const withAuthors = await attachDisplayNames(supabase, replies || []);
    return NextResponse.json({ success: true, replies: withAuthors });
  } catch (error) {
    console.error("Error in GET /api/community/posts/[postId]/replies:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    const cleanBody = typeof body.body === "string" ? body.body.trim() : "";

    if (cleanBody.length < 2 || cleanBody.length > 4000) {
      return NextResponse.json({ success: false, message: "Reply must be between 2 and 4000 characters." }, { status: 400 });
    }

    const supabase = await createClient();
    const { userId, profile } = await getCurrentProfile(supabase);

    if (!userId || !profile) {
      return NextResponse.json({ success: false, message: "Please log in to reply." }, { status: 401 });
    }
    if (profile.status !== "active") {
      return NextResponse.json({ success: false, message: "Your account cannot currently reply in the community." }, { status: 403 });
    }

    const { data: reply, error: insertError } = await supabase
      .from("community_replies")
      .insert({ post_id: postId, author_id: userId, body: cleanBody })
      .select("id")
      .single();

    if (insertError) {
      console.error("Error creating community reply:", insertError);
      return NextResponse.json({ success: false, message: "Failed to post reply." }, { status: 500 });
    }

    // Fire-and-forget — never blocks or fails the reply on email delivery.
    notifyPostAuthorOfReply(postId, userId, cleanBody).catch((err) =>
      console.error("Failed to notify post author of reply:", err)
    );

    return NextResponse.json({ success: true, replyId: reply.id });
  } catch (error) {
    console.error("Error in POST /api/community/posts/[postId]/replies:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}
