import Link from "next/link";
import { Seal } from "@/components/seal";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <Seal />
      <h1 className="font-display text-2xl font-bold text-ink">
        Page not found
      </h1>
      <p className="max-w-sm text-sm text-muted">
        That page doesn&apos;t exist, or it moved. Check the link, or head back
        to the store.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-brand px-4 py-2.5 font-display text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Back to the store
      </Link>
    </div>
  );
}
