/**
 * Supabase Auth helpers for middleware.
 *
 * Community routes use this for cookie refresh only. Dashboard routes also
 * require the signed-in user to have `community_profiles.is_admin = true`.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return {
    supabase,
    get response() {
      return response;
    },
  };
}

function isApiRequest(request: NextRequest): boolean {
  return request.nextUrl.pathname.startsWith("/api/");
}

function blockedAdminResponse(request: NextRequest, status: 401 | 403, message: string) {
  if (isApiRequest(request)) {
    return NextResponse.json({ success: false, message }, { status });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/portal/business/login";
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  if (status === 403) {
    loginUrl.searchParams.set("error", "not-authorized");
  }

  return NextResponse.redirect(loginUrl);
}

function mfaRequiredResponse(request: NextRequest) {
  if (isApiRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Admin multi-factor verification required." },
      { status: 401 }
    );
  }

  const mfaUrl = request.nextUrl.clone();
  mfaUrl.pathname = "/portal/business/mfa";
  mfaUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(mfaUrl);
}

export async function updateCommunitySession(request: NextRequest) {
  const client = createMiddlewareClient(request);

  // Required: this refreshes the session token and re-issues cookies if needed.
  await client.supabase.auth.getUser();

  return client.response;
}

export async function requireAdminSession(request: NextRequest) {
  const client = createMiddlewareClient(request);

  const {
    data: { user },
  } = await client.supabase.auth.getUser();

  if (!user) {
    return blockedAdminResponse(request, 401, "Admin login required.");
  }

  const { data: profile, error } = await client.supabase
    .from("community_profiles")
    .select("is_admin, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile?.is_admin || profile.status !== "active") {
    return blockedAdminResponse(request, 403, "Admin access required.");
  }

  if (process.env.REQUIRE_ADMIN_MFA?.toLowerCase() === "true") {
    const { data: assurance, error: assuranceError } =
      await client.supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (assuranceError || assurance?.currentLevel !== "aal2") {
      return mfaRequiredResponse(request);
    }
  }

  return client.response;
}
