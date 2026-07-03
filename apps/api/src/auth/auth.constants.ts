// Solo-operator app: one admin account, credentials configured via env
// (ADMIN_EMAIL / ADMIN_PASSWORD_HASH), not a users table.
export const ADMIN_COOKIE_NAME = 'admin_token';

export function adminCookieOptions() {
  const expiresInSeconds = parseInt(
    process.env.JWT_EXPIRES_IN_SECONDS ?? '604800',
    10,
  );
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: expiresInSeconds * 1000,
  };
}
