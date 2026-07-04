// Solo-operator app: one admin account, credentials configured via env
// (ADMIN_EMAIL / ADMIN_PASSWORD_HASH), not a users table.
export const ADMIN_COOKIE_NAME = 'admin_token';

export function adminCookieOptions() {
  const expiresInSeconds = parseInt(
    process.env.JWT_EXPIRES_IN_SECONDS ?? '604800',
    10,
  );
  // In production the web app (Vercel) and API (Render) are on different
  // domains, which browsers treat as cross-site — a "Lax" cookie is dropped
  // on cross-site fetch() calls, so login would silently not stick. "None"
  // requires Secure, which is only available over the HTTPS we get in prod.
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    secure: isProduction,
    path: '/',
    maxAge: expiresInSeconds * 1000,
  };
}
