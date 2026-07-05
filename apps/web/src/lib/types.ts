// Shared types matching the API's product response (apps/api ProductView).
// Money is a whole-unit integer; memberDiscount is a percent 0–90.

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  tags: string[];
  price: number;
  memberDiscount: number;
  stock: number;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed by the API (never recompute discount maths in the web app).
  memberPrice: number;
  saving: number;
  stockLabel: string | null;
}

// Fields the admin form sends when creating or editing a product.
export interface ProductInput {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  price: number;
  memberDiscount?: number;
  stock?: number;
  imageUrl?: string;
  active?: boolean;
}

// Matches the API's StudentCode entity.
export interface StudentCode {
  id: string;
  code: string;
  studentName: string | null;
  discountOverride: number | null;
  active: boolean;
  note: string | null;
  usesCount: number;
  lastUsedAt: string | null;
  createdAt: string;
}

// Fields the admin form sends when generating or editing a code.
export interface StudentCodeInput {
  studentName?: string;
  discountOverride?: number | null;
  note?: string;
  active?: boolean;
}

export interface BatchStudentCodeInput {
  count: number;
  discountOverride?: number | null;
  note?: string;
}

// The storefront's code-entry result — only what's needed to unlock pricing,
// never the full student_codes table.
export type ValidateCodeResult =
  | { ok: false; reason: "empty" | "invalid" | "disabled" }
  | { ok: true; studentName: string | null; discountOverride: number | null };

export type ReservationStatus = "new" | "contacted" | "completed" | "cancelled";

// Matches the API's ReservationView (the entity plus the joined code string).
export interface Reservation {
  id: string;
  codeId: string;
  code: string;
  studentName: string | null;
  studentContact: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  status: ReservationStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

// Fields the storefront's Reserve form sends when creating a reservation.
export interface ReservationInput {
  code: string;
  productId: string;
  studentName?: string;
  studentContact: string;
  quantity?: number;
  note?: string;
}
