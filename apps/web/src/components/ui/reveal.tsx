"use client";

import { useEffect, useRef, useState } from "react";

// Fades its content up as it scrolls into view. Only content that starts
// below the fold is hidden first, so nothing visible on load ever flickers;
// reduced-motion users get no animation (globals.css).
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    const hide = requestAnimationFrame(() => setPhase("hidden"));
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPhase("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => {
      cancelAnimationFrame(hide);
      observer.disconnect();
    };
  }, []);

  const motion = phase === "hidden" ? "reveal" : phase === "shown" ? "reveal reveal-in" : "";
  return (
    <Tag ref={ref} className={`${className} ${motion}`}>
      {children}
    </Tag>
  );
}
