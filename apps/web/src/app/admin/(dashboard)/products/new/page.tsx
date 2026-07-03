import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm text-brand-strong hover:underline"
      >
        ← Back to products
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">
        Add product
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Fill in the details students will see on the card.
      </p>
      <ProductForm />
    </div>
  );
}
