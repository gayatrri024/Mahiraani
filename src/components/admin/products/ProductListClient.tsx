"use client";
// src/components/admin/products/ProductListClient.tsx
// Client-side search/filter UI for the product list

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/money";
import type { ProductWithPreview } from "@/app/admin/products/page";

const STATUS_COLOURS: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-stone-100 text-stone-600",
  archived: "bg-red-100 text-red-600",
};

export default function ProductListClient({
  initialProducts,
}: {
  initialProducts: ProductWithPreview[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const filtered = initialProducts.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleDuplicate(id: string) {
    if (!confirm("Duplicate this product as a draft?")) return;
    setDuplicating(id);
    try {
      const res = await fetch(`/api/admin/products/${id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        router.push(`/admin/products/${data.product.id}/edit`);
      } else {
        alert(data.error ?? "Duplicate failed");
      }
    } finally {
      setDuplicating(null);
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Count */}
      <p className="text-xs text-stone-400 mb-3">
        {filtered.length} product{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">◈</p>
          <p className="text-sm">No products found</p>
          <a
            href="/admin/products/new"
            className="mt-4 inline-block text-sm text-stone-600 underline underline-offset-2"
          >
            Add your first product
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 shadow-sm">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors"
            >
              {/* Cover image */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].altText ?? product.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300 text-xl">
                    ◈
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-stone-800 truncate">
                    {product.name}
                  </span>
                  {product.isSample && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                      Sample
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      STATUS_COLOURS[product.status] ?? "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {product.category?.name ?? "No category"} ·{" "}
                  {product.hasVariants
                    ? `${product._count.variants} variant${product._count.variants !== 1 ? "s" : ""}`
                    : product.basePrice
                    ? formatINR(product.basePrice)
                    : "No price set"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`/admin/products/${product.id}/edit`}
                  className="text-xs text-stone-500 hover:text-stone-800 border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  Edit
                </a>
                <button
                  onClick={() => handleDuplicate(product.id)}
                  disabled={duplicating === product.id}
                  className="text-xs text-stone-400 hover:text-stone-700 px-2 py-1.5 rounded-lg hover:bg-stone-100 transition-colors disabled:opacity-40"
                  title="Duplicate product"
                >
                  {duplicating === product.id ? "…" : "⊕"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
