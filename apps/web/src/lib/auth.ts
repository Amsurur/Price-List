// Admin auth: the API sets an httpOnly cookie on login, so these calls just
// need credentials: "include" — there's no token to store client-side.
//
// These calls only ever run in the browser (no server component imports this
// module), so they always use the relative /api path that next.config.ts
// rewrites to the real API origin — this keeps the cookie same-origin, which
// Safari/WebKit's ITP requires for it to persist across page loads.
const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const API_URL = typeof window === "undefined" ? PUBLIC_API_URL : "/api";

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(", ");
    if (body.message) return body.message;
  } catch {
    // fall through
  }
  return `Request failed (${res.status})`;
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

// Ask the API whether the current session is valid. The request goes through
// the /api rewrite in the browser, so the admin_token cookie (now same-origin
// post-fix) is sent automatically — no token to manage client-side.
export async function getCurrentAdmin(): Promise<{ email: string }> {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}
