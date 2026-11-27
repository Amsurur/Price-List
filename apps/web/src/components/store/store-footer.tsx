import Link from "next/link";
import { Seal } from "@/components/seal";

// Dark footer shared by every storefront page.
export function StoreFooter() {
  return (
    <footer className="mt-16 bg-night text-white">
      <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <Seal />
            <span className="font-display text-lg font-bold">
              Computerra<span className="text-brand">.store</span>
            </span>
          </div>
          <p className="max-w-xs text-sm text-white/60">
            Техника для учёбы и работы. Бронируйте онлайн — забирайте и оплачивайте в магазине.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-semibold">Покупателям</span>
          <Link href="/#how" className="text-white/60 hover:text-white">
            Как купить
          </Link>
          <Link href="/#code" className="text-white/60 hover:text-white">
            Личный код студента
          </Link>
          <Link href="/#catalog" className="text-white/60 hover:text-white">
            Каталог
          </Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-semibold">Оплата</span>
          <span className="text-white/60">Онлайн-оплаты нет.</span>
          <span className="text-white/60">Оплата при получении в магазине.</span>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1240px] px-4 py-5 text-xs text-white/40 sm:px-6">
          © {new Date().getFullYear()} Computerra Store
        </p>
      </div>
    </footer>
  );
}
