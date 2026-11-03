"use client";

import { useState } from "react";
import { FolderTree, Plus, X } from "lucide-react";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count: { products: number };
};

export default function CategoriesListClient({
  initialCategories = [],
}: {
  initialCategories: CategoryRow[];
}) {
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || undefined,
          description: description || undefined,
          sortOrder: Number(sortOrder),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create category");
      } else {
        setCategories((prev) => [...prev, { ...data.category, _count: { products: 0 } }]);
        setShowAddModal(false);
        setName("");
        setSlug("");
        setDescription("");
        setSortOrder(0);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500">
          Categories organize your catalogue silhouettes (Earrings, Necklaces, Bangles, etc.)
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200 font-semibold">
            <tr>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Sort Order</th>
              <th className="py-3 px-4 text-right">Products</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-stone-50 transition-colors">
                <td className="py-3 px-4 font-medium text-stone-900 flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-[#B8922A]" />
                  <span>{cat.name}</span>
                </td>
                <td className="py-3 px-4 font-mono text-stone-500">/collections/{cat.slug}</td>
                <td className="py-3 px-4 text-stone-400 max-w-xs truncate">{cat.description || "—"}</td>
                <td className="py-3 px-4 font-mono">{cat.sortOrder}</td>
                <td className="py-3 px-4 text-right font-medium text-stone-900">
                  {cat._count.products} product(s)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-semibold text-stone-900 text-sm">Add New Category</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chokers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg p-2 text-xs focus:outline-hidden focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. chokers"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg p-2 text-xs focus:outline-hidden focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief category description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg p-2 text-xs focus:outline-hidden focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg p-2 text-xs focus:outline-hidden focus:border-stone-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-xs font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 disabled:opacity-50"
                >
                  {loading ? "Creating…" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

