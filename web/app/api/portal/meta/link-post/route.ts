import { NextRequest, NextResponse } from "next/server";
import { linkPostToPermalink, getLatestMetrics, isPostLinked, PostSourceType } from "@/lib/metaPostMetrics";
import { MetaPlatform } from "@/lib/metaAccounts";

/** Status check for a single post: is it linked, and what's the latest stored snapshot (if any). */
export async function GET(request: NextRequest) {
  const sourceType = request.nextUrl.searchParams.get("sourceType");
  const sourceId = request.nextUrl.searchParams.get("sourceId");
  const platform = request.nextUrl.searchParams.get("platform");

  if (
    (sourceType !== "pipeline" && sourceType !== "social_only") ||
    !sourceId ||
    (platform !== "facebook" && platform !== "instagram")
  ) {
    return NextResponse.json({ success: false, error: "Invalid query parameters." }, { status: 400 });
  }

  const linked = await isPostLinked(sourceType as PostSourceType, sourceId, platform as MetaPlatform);
  const metrics = linked ? await getLatestMetrics(sourceType as PostSourceType, sourceId, platform as MetaPlatform) : null;
  return NextResponse.json({ success: true, linked, metrics });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceType, sourceId, platform, permalinkUrl } = body;

    if (sourceType !== "pipeline" && sourceType !== "social_only") {
      return NextResponse.json({ success: false, error: "Invalid sourceType." }, { status: 400 });
    }
    if (!sourceId || typeof sourceId !== "string") {
      return NextResponse.json({ success: false, error: "sourceId is required." }, { status: 400 });
    }
    if (platform !== "facebook" && platform !== "instagram") {
      return NextResponse.json({ success: false, error: "Invalid platform." }, { status: 400 });
    }
    if (!permalinkUrl || typeof permalinkUrl !== "string") {
      return NextResponse.json({ success: false, error: "permalinkUrl is required." }, { status: 400 });
    }

    await linkPostToPermalink(sourceType as PostSourceType, sourceId, platform as MetaPlatform, permalinkUrl);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Meta link-post error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 200 });
  }
}
