"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/lib/api";
import type { ShopSettings } from "@/lib/types";

// One request per page load, shared by every component that asks.
let pending: Promise<ShopSettings | null> | null = null;

function load(): Promise<ShopSettings | null> {
  pending ??= getSettings().catch(() => {
    pending = null; // let a later mount retry
    return null;
  });
  return pending;
}

// The shop's public details (address, phone, Telegram, hours, hold days).
// Null while loading or if the request failed — callers just hide the bits
// they can't show.
export function useShopSettings(): ShopSettings | null {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((s) => alive && setSettings(s));
    return () => {
      alive = false;
    };
  }, []);
  return settings;
}

export function telegramLink(handle: string, text?: string): string {
  const base = `https://t.me/${encodeURIComponent(handle)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
