import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetType, targetId, reason } = body;

    if (targetType !== "post" && targetType !== "reply") {
      return NextResponse.json({ success: false, message: "Invalid report target." }, { status: 400 });
    }
    if (!targetId || typeof targetId !== "string") {
      return NextResponse.json({ success: false, message: "Invalid report target." }, { status: 400 });
    }
    const cleanReason = typeof reason === "string" ? reason.trim() : "";
    if (cleanReason.length < 3 || cleanReason.length > 500) {
      return NextResponse.json({ success: false, message: "Please provide a short reason (3-500 characters)." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Please log in to report content." }, { status: 401 });
    }

    const { error } = await supabase.from("community_reports").insert({
      target_type: targetType,
      target_id: targetId,
      reporter_id: user.id,
      reason: cleanReason,
    });

    if (error) {
      console.error("Error creating community report:", error);
      return NextResponse.json({ success: false, message: "Failed to submit report." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Thank you — our team will review this." });
  } catch (error) {
    console.error("Error in POST /api/community/reports:", error);
    return NextResponse.json({ success: false, message: "An error occurred." }, { status: 500 });
  }
}
