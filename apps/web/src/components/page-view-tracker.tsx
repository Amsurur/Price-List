"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

// Mounted once in the root layout — records a beacon on first load and on
// every client-side navigation. trackPageView itself skips /admin paths.
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) trackPageView(pathname);
  }, [pathname]);

  return null;
}
