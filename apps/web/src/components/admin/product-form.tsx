"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  createProduct,
  imageSrc,
  updateProduct,
  uploadProductImage,
} from "@/lib/api";
import type { Product, ProductInput } from "@/lib/types";

const inputClass =
  "w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";
const labelClass = "block text-sm font-medium text-ink";

// Shared create/edit form. `product` present → edit; absent → create.
export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const editing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [tags, setTags] = useState((product?.tags ?? []).join(", "));
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [memberDiscount, setMemberDiscount] = useState(
    String(product?.memberDiscount ?? 15),
  );
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [description, setDescription] = useState(product?.description ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [images, setImages] = useState<string[]>(product?.images ?? []);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImages(files: File[]) {
    setError(null);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        uploaded.push(await uploadProductImage(file));
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const input: ProductInput = {
      name: name.trim(),
      category: category.trim() || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      price: Number(price),
      memberDiscount: Number(memberDiscount),
      stock: Number(stock),
      description: description.trim() || undefined,
      active,
      images,
    };
    try {
      if (product) {
        await updateProduct(product.id, input);
      } else {
        await createProduct(input);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-[10px] border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <div className="grid gap-5">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            className={`mt-1 ${inputClass}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <input
              id="category"
              className={`mt-1 ${inputClass}`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Laptops"
            />
          </div>
          <div>
            <label htmlFor="tags" className={labelClass}>
              Tags
            </label>
            <input
              id="tags"
              className={`mt-1 ${inputClass}`}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comma separated, e.g. laptop, design"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="price" className={labelClass}>
              Regular price
            </label>
            <input
              id="price"
              type="number"
              min={0}
              className={`mt-1 tabular ${inputClass}`}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="discount" className={labelClass}>
              Member discount %
            </label>
            <input
              id="discount"
              type="number"
              min={0}
              max={90}
              className={`mt-1 tabular ${inputClass}`}
              value={memberDiscount}
              onChange={(e) => setMemberDiscount(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="stock" className={labelClass}>
              Stock
            </label>
            <input
              id="stock"
              type="number"
              min={0}
              className={`mt-1 tabular ${inputClass}`}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>

        <div>
          <span className={labelClass}>Photos</span>
          <p className="mt-1 text-xs text-muted">
            The first photo is the cover shown on the storefront card.
          </p>
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-3">
              {images.map((url, index) => {
                const preview = imageSrc(url);
                return (
                  <div key={url + index} className="flex flex-col gap-1">
                    <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[10px] border border-line bg-brand-tint">
                      {preview && (
                        <Image
                          src={preview}
                          alt=""
                          width={80}
                          height={80}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      )}
                      {index === 0 && (
                        <span className="absolute left-1 top-1 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white">
                          Cover
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        aria-label="Move earlier"
                        className="rounded px-1 text-xs text-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label="Remove photo"
                        className="rounded px-1 text-xs text-danger hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                      >
                        ×
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === images.length - 1}
                        aria-label="Move later"
                        className="rounded px-1 text-xs text-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-3 flex flex-col gap-1">
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length > 0) handleImages(files);
                e.target.value = "";
              }}
              className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand-tint file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-strong"
            />
            {uploading && (
              <span className="text-xs text-muted">Uploading…</span>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className={`mt-1 ${inputClass}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short text shown on the card"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Active (visible in the store)
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-xl bg-brand px-4 py-2.5 font-display text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {saving ? "Saving…" : "Save product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-xl border border-line px-4 py-2.5 font-display text-sm font-semibold text-ink hover:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Cancel
        </button>
        {editing && (
          <span className="mt-1 w-full text-xs text-muted sm:mt-0 sm:ml-auto sm:w-auto">
            Editing never changes past reservations — they keep their snapshot.
          </span>
        )}
      </div>
    </form>
  );
}
