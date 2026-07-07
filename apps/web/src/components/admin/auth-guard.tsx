"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";

// Gates every /admin/* page. Checks the session directly against the API
// (see lib/auth.ts for why this can't be done in Next.js middleware once
// web and API are on different production domains).
export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentAdmin()
      .then(() => {
        if (!cancelled) setChecked(true);
      })
      .catch(() => {
        if (!cancelled) router.replace("/admin/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted">Проверка сеанса…</p>
      </div>
    );
  }

  return <>{children}</>;
}
