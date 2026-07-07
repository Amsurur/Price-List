"use client";

import { useSyncExternalStore } from "react";

// Matches the Tailwind `sm` breakpoint (640px) so mobile-only UI (e.g. the
// Reserve bottom sheet) switches at the same width the CSS does.
const QUERY = "(max-width: 639.98px)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
