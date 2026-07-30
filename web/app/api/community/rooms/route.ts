import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: rooms, error } = await supabase
      .from("community_rooms")
      .select("id, slug, name, description, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching community rooms:", error);
      return NextResponse.json({ success: false, message: "Failed to load rooms." }, { status: 500 });
    }

    const roomIds = (rooms || []).map((room) => room.id);
    const counts: Record<string, number> = {};

    if (roomIds.length > 0) {
      const { data: posts } = await supabase
        .from("community_posts")
        .select("room_id")
        .eq("status", "visible")
        .in("room_id", roomIds);

      (posts || []).forEach((post: { room_id: string }) => {
        counts[post.room_id] = (counts[post.room_id] || 0) + 1;
      });
    }

    return NextResponse.json({
      success: true,
      rooms: (rooms || []).map((room) => ({ ...room, postCount: counts[room.id] || 0 })),
    });
  } catch (error) {
    console.error("Error in GET /api/community/rooms:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}
