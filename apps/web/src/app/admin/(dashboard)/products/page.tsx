"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { deleteProduct, imageSrc, listProducts } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; products: Product[] };

export default function ProductsPage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  async function load() {
    setState({ kind: "loading" });
    try {
      setState({ kind: "ready", products: await listProducts() });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not load products",
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const products = state.kind === "ready" ? state.products : [];

  // Tag chips built from the loaded catalogue.
  const allTags = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [products]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesTag = !activeTag || p.tags.includes(activeTag);
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.description ?? "").toLowerCase().includes(term) ||
        (p.category ?? "").toLowerCase().includes(term) ||
        p.tags.some((t) => t.includes(term));
      return matchesTag && matchesSearch;
    });
  }, [products, search, activeTag]);

  async function handleDeleted(id: string) {
    if (state.kind !== "ready") return;
    setState({
      kind: "ready",
      products: state.products.filter((p) => p.id !== id),
    });
    try {
      await deleteProduct(id);
    } catch {
      // Reload to restore truth if the delete failed on the server.
      load();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Products</h1>
          <p className="mt-1 text-sm text-muted">
            Manage the catalogue students browse.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-brand px-4 py-2.5 font-display text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Add product
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, category, or tag"
          className="w-full max-w-sm rounded-[10px] border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <TagChip
              label="All"
              active={activeTag === null}
              onClick={() => setActiveTag(null)}
            />
            {allTags.map((tag) => (
              <TagChip
                key={tag}
                label={tag}
                active={activeTag === tag}
                onClick={() => setActiveTag(tag)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        {state.kind === "loading" && <SkeletonList />}

        {state.kind === "error" && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-6 text-center">
            <p className="text-sm text-danger">{state.message}</p>
            <button
              onClick={load}
              className="mt-3 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Try again
            </button>
          </div>
        )}

        {state.kind === "ready" && filtered.length === 0 && (
          <div className="rounded-xl border border-line bg-surface px-4 py-12 text-center">
            <p className="text-sm text-muted">
              {products.length === 0
                ? "No products yet — add your first one."
                : "No products match your search."}
            </p>
          </div>
        )}

        {state.kind === "ready" && filtered.length > 0 && (
          <ul className="flex flex-col gap-3">
            {filtered.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onDeleted={handleDeleted}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TagChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        active
          ? "border-brand bg-brand text-white"
          : "border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function ProductRow({
  product,
  onDeleted,
}: {
  product: Product;
  onDeleted: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const src = imageSrc(product.images[0] ?? null);
  const discounted = product.saving > 0;

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-3 transition-transform hover:-translate-y-0.5">
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-line bg-brand-tint">
        {src ? (
          <Image
            src={src}
            alt=""
            width={56}
            height={56}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[10px] text-brand-strong">No image</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-display font-semibold text-ink">
            {product.name}
          </span>
          {!product.active && (
            <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-medium text-muted">
              Hidden
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          {product.category && <span>{product.category}</span>}
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-tint px-2 py-0.5 text-brand-strong"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full text-left sm:w-auto sm:text-right">
        {product.stockLabel ? (
          <span
            className={`text-xs font-medium ${
              product.stock <= 0 ? "text-danger" : "text-warn"
            }`}
          >
            {product.stockLabel}
          </span>
        ) : (
          <span className="text-xs text-muted">{product.stock} in stock</span>
        )}
      </div>

      <div className="w-28 text-right tabular">
        {discounted && (
          <div className="text-xs text-muted line-through">
            {formatMoney(product.price)}
          </div>
        )}
        <div className="font-display font-semibold text-ink">
          {formatMoney(product.memberPrice)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {confirming ? (
          <>
            <button
              onClick={() => onDeleted(product.id)}
              className="rounded-lg bg-danger px-3 py-2 text-xs font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Keep
            </button>
          </>
        ) : (
          <>
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Edit
            </Link>
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-danger hover:bg-danger/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

function SkeletonList() {
  return (
    <ul className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex items-center gap-4 rounded-xl border border-line bg-surface p-3"
        >
          <div className="h-14 w-14 animate-pulse rounded-[10px] bg-bg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-bg" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-bg" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-bg" />
        </li>
      ))}
    </ul>
  );
}
