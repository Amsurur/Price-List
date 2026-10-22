// Thin REST client for the NestJS API. The API is the single source of truth;
// the web app only reads/writes through it.
import type {
  AnalyticsSummary,
  BatchStudentCodeInput,
  BulkCreateResult,
  Product,
  ProductInput,
  Reservation,
  ReservationInput,
  ReservationStatus,
  StudentCode,
  StudentCodeInput,
  ValidateCodeResult,
} from "./types";

// On the server (SSR), there's no same-origin proxy to go through, so hit the
// API directly. In the browser, use the relative /api path that next.config.ts
// rewrites to the API — this keeps the admin_token cookie same-origin, which
// Safari/WebKit's ITP requires for it to persist (see auth.ts for the fuller
// story).
const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const API_URL = typeof window === "undefined" ? PUBLIC_API_URL : "/api";

// Turn a stored image_url into something the browser can load.
//
// Never prepend the API origin here. The API stores relative paths like
// "/api/products/images/<id>", and this value is only ever used as an <img>
// src — the browser resolves it against the page origin and next.config.ts's
// /api rewrite forwards it to the API. NEXT_PUBLIC_API_URL is not necessarily
// reachable from the browser: in the Docker deploy it's the internal service
// name http://api:3001/api, which no browser can resolve. (Every <Image> here
// passes `unoptimized`, so there's no /_next/image proxy to paper over it.)
// Legacy absolute http(s) URLs already work as-is.
export function imageSrc(url: string | null | undefined): string | null {
  return url || null;
}

// Thrown by request() on a non-ok response. Callers that need to tell a 404
// apart from a network/server failure (e.g. the product edit page) can check
// `status` instead of parsing the message.
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Read the error message the API sends (class-validator returns string[]).
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (res.status === 401 && typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
  if (!res.ok) throw new ApiError(await errorMessage(res), res.status);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function listProducts(params?: {
  search?: string;
  tag?: string;
  active?: boolean;
  // A validated student code, to price the listing for that student.
  code?: string;
}): Promise<Product[]> {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.tag) q.set("tag", params.tag);
  if (params?.active !== undefined) q.set("active", String(params.active));
  if (params?.code) q.set("code", params.code);
  const qs = q.toString();
  return request<Product[]>(`/products${qs ? `?${qs}` : ""}`);
}

export function getProduct(id: string): Promise<Product> {
  return request<Product>(`/products/${id}`);
}

export function createProduct(input: ProductInput): Promise<Product> {
  return request<Product>(`/products`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<Product> {
  return request<Product>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteProduct(id: string): Promise<void> {
  return request<void>(`/products/${id}`, { method: "DELETE" });
}

// Admin drag-and-drop reorder. `ids` must be every product id, in the new
// display order — the API rejects a list that doesn't match its own count.
export function reorderProducts(ids: string[]): Promise<void> {
  return request<void>(`/products/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ ids }),
  });
}

// Bulk upload from the review screen — each item is validated and saved
// independently on the API, so the response reports per-row success/failure
// rather than accepting or rejecting the whole batch.
export function createProductsBulk(
  items: ProductInput[],
): Promise<BulkCreateResult[]> {
  return request<BulkCreateResult[]>(`/products/bulk`, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

// Upload an image file; returns the stored URL to save on the product.
export async function uploadProductImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/products/upload`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  const body = (await res.json()) as { imageUrl: string };
  return body.imageUrl;
}

export function listStudentCodes(params?: {
  search?: string;
}): Promise<StudentCode[]> {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  const qs = q.toString();
  return request<StudentCode[]>(`/student-codes${qs ? `?${qs}` : ""}`);
}

export function createStudentCode(
  input: StudentCodeInput,
): Promise<StudentCode> {
  return request<StudentCode>(`/student-codes`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createStudentCodeBatch(
  input: BatchStudentCodeInput,
): Promise<StudentCode[]> {
  return request<StudentCode[]>(`/student-codes/batch`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateStudentCode(
  id: string,
  input: Partial<StudentCodeInput>,
): Promise<StudentCode> {
  return request<StudentCode>(`/student-codes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteStudentCode(id: string): Promise<void> {
  return request<void>(`/student-codes/${id}`, { method: "DELETE" });
}

// A plain link target — the browser sends the admin cookie on this top-level
// GET, and the API responds with a Content-Disposition download.
export function studentCodesExportUrl(): string {
  return `${API_URL}/student-codes/export`;
}

// The storefront's verification step. Public — never exposes the full table.
export function validateStudentCode(code: string): Promise<ValidateCodeResult> {
  return request<ValidateCodeResult>(`/student-codes/validate`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function listReservations(params?: {
  status?: ReservationStatus;
  search?: string;
}): Promise<Reservation[]> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.search) q.set("search", params.search);
  const qs = q.toString();
  return request<Reservation[]>(`/reservations${qs ? `?${qs}` : ""}`);
}

// The storefront's Reserve step. Public — gated server-side on a valid code.
export function createReservation(
  input: ReservationInput,
): Promise<Reservation> {
  return request<Reservation>(`/reservations`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateReservationStatus(
  id: string,
  status: ReservationStatus,
): Promise<Reservation> {
  return request<Reservation>(`/reservations/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  return request<AnalyticsSummary>(`/analytics/summary?days=${days}`);
}
