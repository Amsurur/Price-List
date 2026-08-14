import Image from "next/image";

/**
 * The signature circular "member" seal (design system §Signature element):
 * a ring holding the Computerra logo.
 */
export function Seal({ size = "sm" }: { size?: "sm" | "lg" }) {
  const dimension = size === "lg" ? "h-20 w-20" : "h-9 w-9";

  return (
    <span
      aria-hidden="true"
      className={`flex ${dimension} items-center justify-center overflow-hidden rounded-full border-2 border-brand bg-brand-tint`}
    >
      <Image
        src="/Computerra-logo.jpg"
        alt="Computerra"
        width={499}
        height={499}
        unoptimized
        className="h-full w-full object-cover"
      />
    </span>
  );
}
