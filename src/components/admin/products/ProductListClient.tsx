"use client";
// src/components/admin/products/ProductListClient.tsx
// Non-technical owner friendly product list with:
// - Direct status toggling (Published / Draft / Archived)
// - Stock warnings and badges
// - Category filtering and real-time search
// - One-click "View on Storefront"
// - Safe deletion with order-protection confirmation
// - Product duplication

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/money";
import type { ProductWithPreview } from "@/app/admin/(dashboard)/products/page";

const STATUS_BADGES: Record<string, { label: string; badge: string }> = {
  published: { label: "Live", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  draft: { label: "Draft", badge: "bg-stone-100 text-stone-700 border-stone-200" },
  archived: { label: "Archived", badge: "bg-rose-100 text-rose-800 border-rose-200" },
};

export default function ProductListClient({
  initialProducts,
  categories = [],
}: {
  initialProducts: ProductWithPreview[];
  categories?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithPreview[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function showNotice(type: "success" | "error", message: string) {
    setNotice({ type, message });
    setTimeout(() => {
      setNotice((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || (p.category && p.category.id === categoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  async function handleStatusChange(productId: string, newStatus: string) {
    setBusyId(productId);
    const oldStatus = products.find((p) => p.id === productId)?.status;
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
    );

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update status");
      }
      showNotice(
        "success",
        `Status changed to "${newStatus === "published" ? "Live on Store" : newStatus}"`
      );
    } catch (err) {
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === productId && oldStatus ? { ...p, status: oldStatus } : p))
      );
      showNotice("error", (err as Error).message || "Could not update status.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDuplicate(productId: string, productName: string) {
    if (!confirm(`Duplicate "${productName}" as a new draft product?`)) return;
    setBusyId(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.product?.id) {
        showNotice("success", `Duplicated as "${data.product.name}"`);
        router.push(`/admin/products/${data.product.id}/edit`);
      } else {
        showNotice("error", data.error ?? "Could not duplicate product.");
      }
    } catch {
      showNotice("error", "Network error duplicating product.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(productId: string, productName: string) {
    const confirmed = confirm(
      `Are you sure you want to delete "${productName}"?\n\nIf this product has been ordered by customers in the past, it will be safely archived instead to protect your order history.`
    );
    if (!confirmed) return;

    setBusyId(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to delete product");
      }

      if (data.archived) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, status: "archived" } : p))
        );
        showNotice(
          "success",
          `"${productName}" has past orders and was safely archived instead of deleted.`
        );
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        showNotice("success", `"${productName}" has been permanently removed.`);
      }
    } catch (err) {
      showNotice("error", (err as Error).message || "Could not delete product.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {notice && (
        <div
          role="alert"
          className={`p-3.5 rounded-lg text-sm font-medium border transition-all ${
            notice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {notice.message}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <input
              type="search"
              placeholder="Search by product name or handle…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
            <span className="absolute left-3 top-2.5 text-stone-400 text-xs">🔍</span>
          </div>

          <div className="sm:col-span-3">
            <select
              aria-label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
            >
              <option value="all">All Statuses ({products.length})</option>
              <option value="published">
                Live on Store ({products.filter((p) => p.status === "published").length})
              </option>
              <option value="draft">
                Drafts ({products.filter((p) => p.status === "draft").length})
              </option>
              <option value="archived">
                Archived ({products.filter((p) => p.status === "archived").length})
              </option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              aria-label="Filter by Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Count summary */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
          <span>
            Showing <strong className="text-stone-800">{filtered.length}</strong> of{" "}
            {products.length} jewellery pieces
          </span>
          {(search || statusFilter !== "all" || categoryFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className="text-stone-600 hover:text-stone-900 underline text-xs cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Product List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-xl mb-3">
            💎
          </div>
          <h3 className="text-base font-medium text-stone-800 mb-1">No products found</h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto mb-5">
            {search || statusFilter !== "all" || categoryFilter !== "all"
              ? "Try adjusting your search keywords or filters to see more pieces."
              : "You haven't added any jewellery pieces to your catalogue yet."}
          </p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            <span>＋</span> Add Your First Piece
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 shadow-2xs overflow-hidden">
          {filtered.map((product) => {
            const isBusy = busyId === product.id;
            const isOutOfStock = !product.hasVariants && (product.stock === 0 || product.stock === null);
            const isLowStock =
              !product.hasVariants &&
              product.stock !== null &&
              product.stock > 0 &&
              product.stock <= (product.lowStockThreshold ?? 3);

            return (
              <div
                key={product.id}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  isBusy ? "opacity-50 pointer-events-none" : "hover:bg-stone-50/70"
                }`}
              >
                {/* Left: Thumbnail & Core Details */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0 relative">
                    {product.images[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].altText ?? product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs text-center p-1 font-mono">
                        No Photo
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-sm font-semibold text-stone-900 hover:underline truncate"
                      >
                        {product.name}
                      </Link>

                      {/* Stock Warning Pills */}
                      {isOutOfStock && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                          Out of Stock
                        </span>
                      )}
                      {isLowStock && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Low Stock: {product.stock} left
                        </span>
                      )}
                      {!isOutOfStock && !isLowStock && !product.hasVariants && product.stock !== null && (
                        <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                          {product.stock} in stock
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                      <span className="font-medium text-stone-800">
                        {product.hasVariants
                          ? `${product._count.variants} variant${
                              product._count.variants !== 1 ? "s" : ""
                            }`
                          : product.basePrice !== null
                          ? formatINR(product.basePrice)
                          : "Price unset"}
                      </span>
                      <span>·</span>
                      <span>{product.category?.name ?? "Uncategorized"}</span>
                      {product.isSample && (
                        <>
                          <span>·</span>
                          <span className="text-amber-700 font-medium">Sample</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status Switcher & Direct Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                  {/* Status Dropdown */}
                  <div className="relative">
                    <select
                      aria-label="Change product status"
                      value={product.status}
                      disabled={isBusy}
                      onChange={(e) => handleStatusChange(product.id, e.target.value)}
                      className={`text-xs font-medium rounded-lg px-2.5 py-1.5 border cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-400 ${
                        STATUS_BADGES[product.status]?.badge ?? "bg-stone-100 text-stone-700"
                      }`}
                    >
                      <option value="published">● Live on Store</option>
                      <option value="draft">○ Draft (Hidden)</option>
                      <option value="archived">✕ Archived</option>
                    </select>
                  </div>

                  {/* View on Storefront Link */}
                  {product.status === "published" ? (
                    <a
                      href={`/products/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                      title="View live on website"
                    >
                      <span>View ↗</span>
                    </a>
                  ) : (
                    <a
                      href={`/products/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 border border-stone-100 px-2.5 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                      title="Preview draft layout"
                    >
                      <span>Preview ↗</span>
                    </a>
                  )}

                  {/* Edit Button */}
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Edit
                  </Link>

                  {/* Duplicate Button */}
                  <button
                    type="button"
                    onClick={() => handleDuplicate(product.id, product.name)}
                    disabled={isBusy}
                    className="text-xs text-stone-500 hover:text-stone-800 border border-stone-200 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                    title="Duplicate product"
                  >
                    Duplicate
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={isBusy}
                    className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-transparent hover:border-rose-200 px-2 py-1.5 rounded-lg transition-colors"
                    title="Delete or archive product"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
