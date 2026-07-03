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
