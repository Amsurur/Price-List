"use client";

import { useId, useState } from "react";

// Shows `content` on hover/focus (desktop) and on tap (touch, since the
// trigger is focusable). Only mounts when the trigger's own text is
// truncated, so untruncated text never gets a redundant tooltip.
export function Tooltip({
  content,
  children,
  className,
}: {
  content: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      <span
        tabIndex={0}
        aria-describedby={id}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        className="block cursor-help focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-64 max-w-[80vw] rounded-lg border border-line bg-ink px-3 py-2 text-xs leading-snug text-white shadow-lg"
        >
          {content}
        </span>
      )}
    </span>
  );
}
