import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { maintenanceHtmlString } from "@/components/MaintenancePage";

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // MAINTENANCE MODE CHECK (at the very top of middleware function)
  if (process.env.MAINTENANCE_MODE === "true") {
    const isExcludedFromMaintenance =
      pathname === "/portal/business" ||
      pathname.startsWith("/portal/business/") ||
      pathname === "/api/portal/stats" ||
      pathname.startsWith("/api/");

    if (!isExcludedFromMaintenance) {
      return new NextResponse(maintenanceHtmlString, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  }

  const isDashboardRoute =
    pathname === "/portal/business" ||
    pathname.startsWith("/portal/business/") ||
    pathname === "/api/portal/stats" ||
    pathname.startsWith("/api/portal/content-pipeline");

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
