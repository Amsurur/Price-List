// Admin auth: the API sets an httpOnly cookie on login, so these calls just
// need credentials: "include" — there's no token to store client-side.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

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
