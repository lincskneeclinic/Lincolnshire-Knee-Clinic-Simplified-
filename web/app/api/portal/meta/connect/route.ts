import { NextResponse } from "next/server";
import { getOAuthDialogUrl } from "@/lib/metaGraphApi";
import { SITE_URL } from "@/lib/site";

const STATE_COOKIE = "meta_oauth_state";

export async function GET() {
  try {
    const state = crypto.randomUUID();
    const redirectUri = `${SITE_URL}/api/portal/meta/callback`;
    const dialogUrl = getOAuthDialogUrl(redirectUri, state);

    const response = NextResponse.redirect(dialogUrl);
    response.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/api/portal/meta",
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
