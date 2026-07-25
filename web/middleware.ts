import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Business Dashboard and its stats API endpoint
  if (
    pathname === "/portal/business" ||
    pathname.startsWith("/portal/business/") ||
    pathname === "/api/portal/stats"
  ) {
    return NextResponse.next();
  }

  // Gate all other patient portal & portal API routes with 404
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
    "/portal",
    "/portal/:path*",
    "/api/portal",
    "/api/portal/:path*",
  ],
};
