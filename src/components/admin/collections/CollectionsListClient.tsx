"use client";

import { useState } from "react";
import { Sparkles, Plus, X } from "lucide-react";

export type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { products: number };
};

export default function CollectionsListClient({
  initialCollections = [],
}: {
  initialCollections: CollectionRow[];
}) {
  const [collections, setCollections] = useState<CollectionRow[]>(initialCollections);
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
      const res = await fetch("/api/admin/collections", {
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
        setError(data.error || "Failed to create collection");
      } else {
        setCollections((prev) => [...prev, { ...data.collection, _count: { products: 0 } }]);
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
          Thematic and seasonal drops (Festive Edit, Everyday Wear, Under ₹999, etc.)
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Collection</span>
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200 font-semibold">
            <tr>
              <th className="py-3 px-4">Collection Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Sort Order</th>
              <th className="py-3 px-4 text-right">Products</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {collections.map((col) => (
              <tr key={col.id} className="hover:bg-stone-50 transition-colors">
                <td className="py-3 px-4 font-medium text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B8922A]" />
                  <span>{col.name}</span>
                </td>
                <td className="py-3 px-4 font-mono text-stone-500">/collections/{col.slug}</td>
                <td className="py-3 px-4 text-stone-400 max-w-xs truncate">{col.description || "—"}</td>
                <td className="py-3 px-4 font-mono">{col.sortOrder}</td>
                <td className="py-3 px-4 text-right font-medium text-stone-900">
                  {col._count?.products ?? 0}
                </td>
              </tr>
            ))}
            {collections.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-stone-400">
                  No collections created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg text-stone-900">New Curated Collection</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Collection Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Bridal Edit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B8922A]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Slug (optional)</label>
                <input
                  type="text"
                  placeholder="royal-bridal-edit"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B8922A] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Short description for storefront curation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B8922A]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B8922A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#6B2737] text-white rounded-lg font-medium hover:bg-[#521e2a] transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Save Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

