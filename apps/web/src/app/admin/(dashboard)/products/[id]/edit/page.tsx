import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getProduct } from "@/lib/api";

// Route params are a Promise in Next 16 — await them.
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product;
  try {
    product = await getProduct(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm text-brand-strong hover:underline"
      >
        ← Back to products
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">
        Edit product
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">{product.name}</p>
      <ProductForm product={product} />
    </div>
  );
}
