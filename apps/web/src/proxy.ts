import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic check only (cookie presence, not signature) — the API's
// JwtAuthGuard is the real enforcement on every mutating /admin action.
const ADMIN_COOKIE = "admin_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    if (!request.cookies.has(ADMIN_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
