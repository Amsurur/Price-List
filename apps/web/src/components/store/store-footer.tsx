"use client";

import Link from "next/link";
import { Seal } from "@/components/seal";
import { ClockIcon, MapPinIcon, PhoneIcon, TelegramIcon } from "@/components/ui/icons";
import { telegramLink, useShopSettings } from "@/lib/use-shop-settings";

// Dark footer shared by every storefront page. Contact details come from the
// admin's Настройки page; anything not filled in is simply left out.
export function StoreFooter() {
  const shop = useShopSettings();
  const hasContacts = Boolean(shop && (shop.address || shop.phone || shop.telegram || shop.hours));

  return (
    <footer className="mt-16 bg-night text-white">
      <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <Seal />
            <span className="font-display text-lg font-bold">
              Computerra<span className="text-brand">.store</span>
            </span>
          </div>
          <p className="max-w-xs text-sm text-white/60">
            Компьютерная техника для учёбы и работы. Бронь на сайте, оплата в магазине.
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
          <Link href="/saved" className="text-white/60 hover:text-white">
            Сохранённые
          </Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-semibold">Оплата и получение</span>
          <span className="text-white/60">Онлайн-оплаты нет.</span>
          <span className="text-white/60">Оплата при получении в магазине.</span>
          {shop && <span className="text-white/60">Бронь держим {holdDaysText(shop.holdDays)}.</span>}
        </div>
        {hasContacts && shop && (
          <address className="flex flex-col gap-2.5 text-sm not-italic">
            <span className="font-semibold">Магазин</span>
            {shop.address && (
              <FooterLine icon={<MapPinIcon className="h-4 w-4" />}>
                {shop.mapUrl ? (
                  <a href={shop.mapUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                    {shop.address}
                  </a>
                ) : (
                  shop.address
                )}
              </FooterLine>
            )}
            {shop.hours && <FooterLine icon={<ClockIcon className="h-4 w-4" />}>{shop.hours}</FooterLine>}
            {shop.phone && (
              <FooterLine icon={<PhoneIcon className="h-4 w-4" />}>
                <a href={`tel:${shop.phone.replace(/[^\d+]/g, "")}`} className="tabular hover:text-white">
                  {shop.phone}
                </a>
              </FooterLine>
            )}
            {shop.telegram && (
              <FooterLine icon={<TelegramIcon className="h-4 w-4" />}>
                <a href={telegramLink(shop.telegram)} target="_blank" rel="noreferrer" className="hover:text-white">
                  @{shop.telegram}
                </a>
              </FooterLine>
            )}
          </address>
        )}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1240px] px-4 py-5 text-xs text-white/40 sm:px-6">
          © {new Date().getFullYear()} Computerra Store
        </p>
      </div>
    </footer>
  );
}

function FooterLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="flex items-start gap-2 text-white/60">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{children}</span>
    </span>
  );
}

export function holdDaysText(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  const word =
    mod10 === 1 && mod100 !== 11
      ? "день"
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? "дня"
        : "дней";
  return `${n} ${word}`;
}
