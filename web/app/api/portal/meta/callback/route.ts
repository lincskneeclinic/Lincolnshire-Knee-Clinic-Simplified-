import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, exchangeForLongLivedToken, getManagedPages, getInstagramBusinessAccountId } from "@/lib/metaGraphApi";
import { saveConnectedAccount } from "@/lib/metaAccounts";
import { SITE_URL } from "@/lib/site";

const STATE_COOKIE = "meta_oauth_state";

function redirectWithResult(result: "connected" | "error", detail?: string) {
  const url = new URL("/portal/business", SITE_URL);
  url.searchParams.set("tab", "socialOnly");
  url.searchParams.set("metaConnect", result);
  if (detail) url.searchParams.set("metaConnectDetail", detail.slice(0, 200));
  const response = NextResponse.redirect(url);
  response.cookies.delete(STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const storedState = request.cookies.get(STATE_COOKIE)?.value;
    const oauthError = request.nextUrl.searchParams.get("error_description") || request.nextUrl.searchParams.get("error");

    if (oauthError) return redirectWithResult("error", oauthError);
    if (!code) return redirectWithResult("error", "No authorization code returned.");
    if (!state || !storedState || state !== storedState) {
      return redirectWithResult("error", "State mismatch — please try connecting again.");
    }

    const redirectUri = `${SITE_URL}/api/portal/meta/callback`;
    const shortLivedToken = await exchangeCodeForToken(code, redirectUri);
    const longLivedToken = await exchangeForLongLivedToken(shortLivedToken);

    const pages = await getManagedPages(longLivedToken);
    if (pages.length === 0) {
      return redirectWithResult("error", "No Facebook Pages found for this account. Make sure you're an admin of the clinic's Page.");
    }

    // Only the first managed Page is connected — matches the single-clinic-account
    // scope of this feature. The connected Page's name is shown in the dashboard
    // so staff can confirm the right one was picked.
    const page = pages[0];
    await saveConnectedAccount({
      platform: "facebook",
      account_id: page.id,
      account_name: page.name,
      access_token: page.access_token,
      token_expires_at: null, // Page tokens derived from a long-lived user token don't expire under normal conditions
    });

    const igAccountId = await getInstagramBusinessAccountId(page.id, page.access_token);
    if (igAccountId) {
      await saveConnectedAccount({
        platform: "instagram",
        account_id: igAccountId,
        account_name: `${page.name} (Instagram)`,
        access_token: page.access_token,
        token_expires_at: null,
      });
    }

    return redirectWithResult("connected", igAccountId ? `${page.name} + linked Instagram` : `${page.name} (no linked Instagram account found)`);
  } catch (error) {
    console.error("Meta OAuth callback error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return redirectWithResult("error", message);
  }
}
