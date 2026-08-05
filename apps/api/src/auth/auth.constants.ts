// Solo-operator app: one admin account, credentials configured via env
// (ADMIN_EMAIL / ADMIN_PASSWORD_HASH), not a users table.
export const ADMIN_COOKIE_NAME = 'admin_token';

export function adminCookieOptions() {
  const expiresInSeconds = parseInt(
    process.env.JWT_EXPIRES_IN_SECONDS ?? '604800',
    10,
  );
  // When the web app and API are on different domains (e.g. Vercel + Render),
  // browsers treat that as cross-site — a "Lax" cookie is dropped on
  // cross-site fetch() calls, so login would silently not stick. "None"
  // requires Secure, which needs HTTPS. Driven by its own env var (not
  // NODE_ENV) because a production build can still be served over plain
  // HTTP (e.g. a bare-IP deploy before a domain/TLS exists) — a Secure
  // cookie would be silently refused by the browser in that case.
  const cookieSecure = process.env.COOKIE_SECURE === 'true';
  return {
    httpOnly: true,
    sameSite: (cookieSecure ? 'none' : 'lax') as 'none' | 'lax',
    secure: cookieSecure,
    path: '/',
    maxAge: expiresInSeconds * 1000,
  };
}
