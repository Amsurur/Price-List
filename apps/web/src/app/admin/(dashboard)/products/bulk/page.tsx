import Link from "next/link";
import { BulkProductUpload } from "@/components/admin/bulk-product-upload";

export default function BulkProductsPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm text-brand-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        ← Назад к товарам
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">
        Загрузить товары из файла
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Загрузите список товаров, проверьте и дополните каждую карточку, затем сохраните всё разом.
      </p>
      <BulkProductUpload />
    </div>
  );
}
