// Shared types matching the API's product response (apps/api ProductView).
// Money is a whole-unit integer; memberDiscount is a percent 0–90.

// A colour option: extraPrice adds to the base price; images are a subset of
// the product's photos shown when this colour is picked.
export interface ProductColor {
  name: string;
  hex: string;
  extraPrice: number;
  images: string[];
}

export interface ProductConfig {
  label: string;
  extraPrice: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

// The API's price for one colour × configuration pick.
export interface VariantPrice {
  color: string | null;
  config: string | null;
  price: number;
  memberPrice: number;
  saving: number;
}

// What the student picked on the product page, with its API price.
export interface Selection {
  color: string | null;
  config: string | null;
  price: VariantPrice;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  tags: string[];
  price: number;
  memberDiscount: number;
  stock: number;
  // Photo URLs in display order; the first is the cover shown on the card.
  images: string[];
  active: boolean;
  // Manual display order set via admin drag-and-drop; lower sorts first.
  sortOrder: number;
  colors: ProductColor[];
  configs: ProductConfig[];
  specs: ProductSpec[];
  createdAt: string;
  updatedAt: string;
  // Computed by the API (never recompute discount maths in the web app).
  // listPrice/memberPrice/saving are for the default pick (first options).
  listPrice: number;
  memberPrice: number;
  saving: number;
  stockLabel: string | null;
  variants: VariantPrice[];
}

// Fields the admin form sends when creating or editing a product.
export interface ProductInput {
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  tags?: string[];
  price: number;
  memberDiscount?: number;
  stock?: number;
  images?: string[];
  active?: boolean;
  colors?: ProductColor[];
  configs?: ProductConfig[];
  specs?: ProductSpec[];
}

// One row's outcome from POST /products/bulk (apps/api ProductsService.bulkCreate).
export interface BulkCreateResult {
  index: number;
  status: "created" | "error";
  product?: Product;
  error?: string;
}

// Matches the API's StudentCode entity.
export interface StudentCode {
  id: string;
  code: string;
  studentName: string | null;
  // Stacks on top of each product's own memberDiscount (e.g. product 10% +
  // code 5% = 15%), clamped at 90. Null means no bonus — just the product's own.
  extraDiscount: number | null;
  active: boolean;
  note: string | null;
  usesCount: number;
  lastUsedAt: string | null;
  createdAt: string;
}

// Fields the admin form sends when generating or editing a code.
export interface StudentCodeInput {
  studentName?: string;
  extraDiscount?: number | null;
  note?: string;
  active?: boolean;
}

export interface BatchStudentCodeInput {
  count: number;
  extraDiscount?: number | null;
  note?: string;
}

// The storefront's code-entry result — only what's needed to unlock pricing,
// never the full student_codes table.
export type ValidateCodeResult =
  | { ok: false; reason: "empty" | "invalid" | "disabled" }
  | { ok: true; studentName: string | null; extraDiscount: number | null };

export type ReservationStatus = "new" | "contacted" | "completed" | "cancelled";

// Matches the API's ReservationView (the entity plus the joined code string).
export interface Reservation {
  id: string;
  codeId: string | null;
  code: string;
  studentName: string | null;
  studentContact: string;
  productId: string | null;
  productName: string;
  // Snapshot of the picked colour / configuration, e.g. "Серебристый · 16/512".
  variant: string | null;
  unitPrice: number;
  quantity: number;
  status: ReservationStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

// Fields the storefront's Reserve form sends when creating a reservation.
// `code` is optional — omitted, the reservation is priced at regular price.
export interface ReservationInput {
  code?: string;
  productId: string;
  color?: string;
  config?: string;
  studentName?: string;
  studentContact: string;
  quantity?: number;
  note?: string;
}

// Matches the API's AnalyticsSummary (GET /analytics/summary).
export interface AnalyticsSummary {
  days: number;
  totalViews: number;
  uniqueVisitors: number;
  topPaths: { path: string; views: number }[];
  daily: { date: string; views: number; uniqueVisitors: number }[];
}
