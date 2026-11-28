"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

const EVENT = "themechange";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

const isDark = () => document.documentElement.classList.contains("dark");

// Light/dark switch for the storefront. The root layout's inline script
// applies the saved choice before paint; this just flips and remembers it.
export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Storage blocked: the theme still applies for this visit.
    }
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Светлая тема" : "Тёмная тема"}
      className="flex h-10 w-10 shrink-0 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-bg text-ink transition-colors hover:bg-sunken"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
