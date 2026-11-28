"use client";

import { useCallback, useEffect, useState } from "react";
import { validateStudentCode } from "@/lib/api";
import type { ValidateCodeResult } from "@/lib/types";

export interface AppliedCode {
  code: string;
  studentName: string | null;
  // The extra % this code adds on top of each product's own discount.
  extraDiscount: number | null;
}

const KEY = "computerra.code";

function read(): AppliedCode | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppliedCode) : null;
  } catch {
    return null;
  }
}

function write(value: AppliedCode | null) {
  try {
    if (value) localStorage.setItem(KEY, JSON.stringify(value));
    else localStorage.removeItem(KEY);
  } catch {
    // Private mode or blocked storage: the code just won't survive a reload.
  }
}

// The student's code, remembered across pages and visits so the member price
// follows them from the catalogue to the product page. `ready` turns true once
// the saved code (if any) has been re-checked with the API — pages wait for it
// before loading prices, so they never flash the wrong price.
export function useAppliedCode() {
  const [appliedCode, setAppliedCode] = useState<AppliedCode | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = read();
    // Re-validate: the shop may have disabled the code since it was saved.
    const check = saved
      ? validateStudentCode(saved.code).then((result) => {
          if (result.ok) {
            const fresh = {
              code: saved.code,
              studentName: result.studentName,
              extraDiscount: result.extraDiscount,
            };
            write(fresh);
            setAppliedCode(fresh);
          } else {
            write(null);
          }
        })
      : Promise.resolve();
    check
      // Network hiccup: trust the saved code; the API re-checks on reserve.
      .catch(() => setAppliedCode(saved))
      .finally(() => setReady(true));
  }, []);

  const apply = useCallback(async (code: string): Promise<ValidateCodeResult> => {
    const result = await validateStudentCode(code);
    if (result.ok) {
      const value = {
        code: code.trim().toUpperCase(),
        studentName: result.studentName,
        extraDiscount: result.extraDiscount,
      };
      write(value);
      setAppliedCode(value);
    }
    return result;
  }, []);

  const remove = useCallback(() => {
    write(null);
    setAppliedCode(null);
  }, []);

  return { appliedCode, ready, apply, remove };
}
