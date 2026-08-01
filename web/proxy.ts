import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateCommunitySession } from "./lib/supabase/middleware";

function decodeBase64(str: string): string {
  try {
    if (typeof atob === "function") {
      return atob(str);
    }
    if (typeof Buffer !== "undefined") {
      return Buffer.from(str, "base64").toString("utf-8");
    }
    return "";
  } catch {
    return "";
  }
}

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) return false;

  try {
    const base64Credentials = authHeader.split(" ")[1];
    const decoded = decodeBase64(base64Credentials);
    const [user, pass] = decoded.split(":");

    const expectedUser = process.env.DASHBOARD_USER;
    const expectedPass = process.env.DASHBOARD_PASSWORD;

    if (!expectedUser || !expectedPass) return false;

    return user === expectedUser && pass === expectedPass;
  } catch (err) {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const maintenanceMode = process.env.MAINTENANCE_MODE?.toLowerCase() === "true";

  if (maintenanceMode) {
    const isExempt =
      pathname === "/portal/business" ||
      pathname.startsWith("/portal/business/") ||
      pathname === "/api/portal/stats" ||
      pathname.startsWith("/api/");

    if (!isExempt) {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Lincolnshire Knee Clinic — Site Update</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: system-ui, sans-serif; background: #0f1f1a; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; padding: 2rem; }
            .box { max-width: 480px; }
            h1 { font-size: 1.5rem; margin-bottom: 1rem; }
            p { font-size: 1rem; line-height: 1.6; opacity: 0.9; }
            a { color: #7fd1ae; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>Lincolnshire Knee Clinic</h1>
            <p>Our website is currently being updated. For appointments or enquiries, please call <a href="tel:07770473437">07770 473437</a> or email <a href="mailto:admin@lincsknee.com">admin@lincsknee.com</a>.</p>
          </div>
        </body>
        </html>
      `;
      return new NextResponse(html, {
        status: 503,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "Retry-After": "3600",
        },
      });
    }
  }

  // Community routes need the Supabase Auth session cookie refreshed on
  // every server-rendered navigation, or logged-in members get silently
  // signed out. This only refreshes the cookie — it does not redirect or
  // enforce login; pages/API routes under /community decide that themselves.
  const isCommunityRoute =
    pathname === "/community" ||
    pathname.startsWith("/community/") ||
    pathname.startsWith("/api/community/");

  if (isCommunityRoute) {
    return updateCommunitySession(request);
  }

  const isDashboardRoute =
    pathname === "/portal/business" ||
    pathname.startsWith("/portal/business/") ||
    pathname === "/portal/clinician-intake" ||
    pathname.startsWith("/portal/clinician-intake/") ||
    pathname === "/api/portal/stats" ||
    pathname.startsWith("/api/portal/clinical-review") ||
    pathname.startsWith("/api/portal/content-pipeline") ||
    pathname.startsWith("/api/portal/patients") ||
    pathname.startsWith("/api/portal/injections") ||
    pathname.startsWith("/api/portal/messages") ||
    pathname.startsWith("/api/portal/community-reports") ||
    pathname.startsWith("/api/portal/education-articles") ||
    pathname.startsWith("/api/portal/social-only") ||
    pathname.startsWith("/api/portal/newsletter") ||
    pathname === "/api/portal/verify-pin" ||
    pathname === "/api/intake";

  if (isDashboardRoute) {
    if (!isAuthorized(request)) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Dashboard"' },
      });
    }
    return NextResponse.next();
  }

  // Everything else under /portal and /api/portal stays fully blocked with 404.
  // /api/intake is NOT included here — it's gated via isDashboardRoute above
  // instead, since it's the submit endpoint for the Basic-Auth-protected
  // /portal/clinician-intake tool and must actually be reachable by staff.
  if (
    pathname === "/portal" ||
    pathname.startsWith("/portal/") ||
    pathname === "/api/portal" ||
    pathname.startsWith("/api/portal/")
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files & brand assets
     */
    "/((?!_next/static|_next/image|favicon.ico|brand/).*)",
  ],
};
