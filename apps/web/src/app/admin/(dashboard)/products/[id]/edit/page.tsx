import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { ApiError, getProduct } from "@/lib/api";

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
  } catch (err) {
    // A missing product is a real 404; anything else (API down, network
    // error) is a transient failure and shouldn't render as "not found".
    if (err instanceof ApiError && err.status === 404) notFound();
    return (
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-brand-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          ← Назад к товарам
        </Link>
        <div className="mt-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-6 text-center">
          <p className="text-sm text-danger">
            {err instanceof Error ? err.message : "Не удалось загрузить этот товар"}
          </p>
          <Link
            href={`/admin/products/${id}/edit`}
            className="mt-3 inline-block rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Повторить
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm text-brand-strong hover:underline"
      >
        ← Назад к товарам
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">
        Изменить товар
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">{product.name}</p>
      <ProductForm product={product} />
    </div>
  );
}
