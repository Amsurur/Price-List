import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm text-brand-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        ← Назад к товарам
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">
        Добавить товар
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Заполните данные, которые студенты увидят на карточке.
      </p>
      <ProductForm />
    </div>
  );
}
