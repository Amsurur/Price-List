"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// Shared full-screen overlay primitive: portal, backdrop, focus trap,
// Escape-to-close, and scroll-lock. Positions its content with `align` —
// consumers (BottomSheet, ImageLightbox) supply their own visual chrome via
// contentClassName.
export function Overlay({
  onClose,
  align = "center",
  labelledBy,
  contentClassName,
  children,
}: {
  onClose: () => void;
  align?: "center" | "bottom" | "right";
  labelledBy?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const node = contentRef.current;
    node?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = node.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const edgeAligned = align === "bottom" || align === "right";

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex flex-col ${edgeAligned ? "" : "p-4"}`}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50"
      />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative focus:outline-none ${
          align === "bottom" ? "mt-auto" : align === "right" ? "ml-auto h-full" : "m-auto"
        } ${contentClassName ?? ""}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
