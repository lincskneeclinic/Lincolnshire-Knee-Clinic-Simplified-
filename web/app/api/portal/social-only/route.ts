import { NextResponse } from "next/server";
import { listSocialOnlyPosts } from "@/lib/socialOnlyPosts";

export async function GET() {
  try {
    const posts = await listSocialOnlyPosts();
    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error("Error in GET /api/portal/social-only:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load social posts" },
      { status: 500 }
    );
  }
}
