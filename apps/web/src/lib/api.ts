// Thin REST client for the NestJS API. The API is the single source of truth;
// the web app only reads/writes through it.
import type { Product, ProductInput } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

// The API's origin (without the /api prefix), for resolving image URLs like
// "/uploads/abc.png" that it serves as static files.
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Turn a stored image_url into something the browser can load. Absolute URLs
// pass through; relative "/uploads/..." paths get the API origin.
export function imageSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${API_ORIGIN}${url}`;
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
  if (!res.ok) throw new Error(await errorMessage(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function listProducts(params?: {
  search?: string;
  tag?: string;
}): Promise<Product[]> {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.tag) q.set("tag", params.tag);
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
