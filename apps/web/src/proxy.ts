import { NextResponse } from "next/server";

// This used to redirect to /admin/login when the admin_token cookie was
// missing. That only worked by coincidence in local dev, where the web app
// and API share a hostname (just different ports) and browsers scope
// cookies by hostname, not port. In production the API lives on a different
// domain (e.g. Render vs. Vercel), so the cookie it sets is never visible to
// requests to the web app's own domain — this check would always see "no
// cookie" and redirect, even right after a successful login. The real check
// now lives client-side in AdminAuthGuard (apps/web/src/components/admin/
// auth-guard.tsx), which asks the API directly and does receive the cookie.
// The API's JwtAuthGuard remains the actual enforcement either way.
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
