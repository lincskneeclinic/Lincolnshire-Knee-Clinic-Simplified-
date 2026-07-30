import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Author-only soft delete. Moderator hide/remove goes through the admin route instead. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ replyId: string }> }
) {
  try {
    const { replyId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Please log in." }, { status: 401 });
    }

    const { error } = await supabase
      .from("community_replies")
      .update({ status: "deleted" })
      .eq("id", replyId)
      .eq("author_id", user.id);

    if (error) {
      console.error("Error deleting community reply:", error);
      return NextResponse.json({ success: false, message: "Failed to delete reply." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/community/replies/[replyId]:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}
