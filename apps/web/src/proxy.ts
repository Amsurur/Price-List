import { NextResponse } from "next/server";

// This used to redirect to /admin/login when the admin_token cookie was
// missing. That only worked by coincidence in local dev, where the web app
// and API share a hostname (just different ports) and browsers scope
// cookies by hostname, not port. In production the API lived on a different
// domain (e.g. Render vs. Vercel), so the cookie it set was never visible to
// requests to the web app's own domain — this check would always see "no
// cookie" and redirect, even right after a successful login.
//
// Now that /api/* is rewritten through the web app's own origin (see
// next.config.ts), the cookie is host-only on the web domain and *would* be
// visible here. Real middleware-side enforcement is a valid follow-up, but
// out of scope for this change — the client-side check in AdminAuthGuard
// (apps/web/src/components/admin/auth-guard.tsx) plus the API's
// JwtAuthGuard already enforce auth correctly now that the cookie itself
// persists.
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
