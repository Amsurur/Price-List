/**
 * The signature circular "member" seal (design system §Signature element).
 * Placeholder for M0 — a ring with the shop initial in brand violet.
 */
export function Seal() {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand bg-brand-tint font-display text-sm font-bold text-brand-strong"
    >
      C
    </span>
  );
}
