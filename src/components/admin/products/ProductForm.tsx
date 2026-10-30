"use client";
// src/components/admin/products/ProductForm.tsx
// Complete product create/edit form with:
// - Image upload with drag-to-reorder, cover select, alt text
// - Simple price/stock for products without variants
// - Variant generator: size × colour matrix, remove unwanted combos
// - Rich product details accordion
// - Save draft / Publish / Archive actions

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ProductFormData } from "@/app/admin/products/[id]/edit/page";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Category { id: string; name: string }
interface Collection { id: string; name: string }

interface VariantRow {
  id?: string;
  name: string;
  options: Record<string, string>;
  price: number;
  comparePrice?: number | null;
  sku?: string | null;
  stock: number;
  isActive: boolean;
  sortOrder: number;
}

interface ImageRow {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isCover: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function rupeesToPaise(r: string): number {
  const n = parseFloat(r.replace(/,/g, ""));
  if (isNaN(n)) return 0;
  return Math.round(n * 100);
}

function paiseToRupees(p: number | null | undefined): string {
  if (!p) return "";
  return (p / 100).toFixed(2);
}

function generateCombinations(sizes: string[], colours: string[]): VariantRow[] {
  const combos: VariantRow[] = [];
  let i = 0;
  if (sizes.length && colours.length) {
    for (const size of sizes) {
      for (const colour of colours) {
        combos.push({
          name: `${size} / ${colour}`,
          options: { size: size.trim(), colour: colour.trim() },
          price: 0,
          sku: null,
          stock: 0,
          isActive: true,
          sortOrder: i++,
        });
      }
    }
  } else if (sizes.length) {
    for (const size of sizes) {
      combos.push({ name: size.trim(), options: { size: size.trim() }, price: 0, sku: null, stock: 0, isActive: true, sortOrder: i++ });
    }
  } else if (colours.length) {
    for (const colour of colours) {
      combos.push({ name: colour.trim(), options: { colour: colour.trim() }, price: 0, sku: null, stock: 0, isActive: true, sortOrder: i++ });
    }
  }
  return combos;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ProductForm({
  product,
  categories,
  collections,
}: {
  product: ProductFormData | null;
  categories: Category[];
  collections: Collection[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Core fields ──
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!product?.slug);
  const [description, setDescription] = useState(product?.description ?? "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    product?.collections.map((c) => c.collectionId) ?? []
  );

  // ── Pricing (simple) ──
  const [basePrice, setBasePrice] = useState(paiseToRupees(product?.basePrice));
  const [comparePrice, setComparePrice] = useState(paiseToRupees(product?.comparePrice));
  const [sku, setSku] = useState(product?.sku ?? "");
  const [stock, setStock] = useState(String(product?.stock ?? "0"));
  const [lowStockThreshold, setLowStockThreshold] = useState(String(product?.lowStockThreshold ?? "3"));

  // ── Details ──
  const [material, setMaterial] = useState(product?.material ?? "");
  const [finish, setFinish] = useState(product?.finish ?? "");
  const [dimensions, setDimensions] = useState(product?.dimensions ?? "");
  const [weight, setWeight] = useState(product?.weight ?? "");
  const [closureType, setClosureType] = useState(product?.closureType ?? "");
  const [careInstructions, setCareInstructions] = useState(product?.careInstructions ?? "");
  const [originDetails, setOriginDetails] = useState(product?.originDetails ?? "");
  const [packageContents, setPackageContents] = useState(product?.packageContents ?? "");

  // ── Variants ──
  const [hasVariants, setHasVariants] = useState(product?.hasVariants ?? false);
  const [sizeOptions, setSizeOptions] = useState(product?.sizeOptions ?? "");
  const [colourOptions, setColourOptions] = useState(product?.colourOptions ?? "");
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.map((v) => ({
      id: v.id,
      name: v.name,
      options: JSON.parse(v.options) as Record<string, string>,
      price: v.price,
      comparePrice: v.comparePrice,
      sku: v.sku,
      stock: v.stock,
      isActive: v.isActive,
      sortOrder: v.sortOrder,
    })) ?? []
  );

  // ── Images ──
  const [images, setImages] = useState<ImageRow[]>(
    product?.images.map((i) => ({
      id: i.id,
      url: i.url,
      altText: i.altText,
      sortOrder: i.sortOrder,
      isCover: i.isCover,
    })) ?? []
  );
  const [uploading, setUploading] = useState(false);

  // ── UI state ──
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(!!product?.material);

  // ── Slug auto-generate ──
  function handleNameChange(v: string) {
    setName(v);
    if (!slugEdited) {
      setSlug(
        v.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-")
      );
    }
  }

  // ── Collection toggle ──
  function toggleCollection(id: string) {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  // ── Image upload ──
  const handleFileChange = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      if (!product?.id) {
        setError("Save the product first before uploading images.");
        return;
      }
      setUploading(true);
      setError("");
      try {
        const fd = new FormData();
        for (const f of Array.from(files)) fd.append("images", f);
        const res = await fetch(`/api/admin/products/${product.id}/images`, {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        setImages((prev) => [
          ...prev,
          ...data.images.map((img: ImageRow) => ({ ...img })),
        ]);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setUploading(false);
      }
    },
    [product?.id]
  );

  async function setCoverImage(imageId: string) {
    if (!product?.id) return;
    await fetch(`/api/admin/products/${product.id}/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCover: true }),
    });
    setImages((prev) =>
      prev.map((img) => ({ ...img, isCover: img.id === imageId }))
    );
  }

  async function updateAltText(imageId: string, altText: string) {
    if (!product?.id) return;
    await fetch(`/api/admin/products/${product.id}/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ altText }),
    });
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, altText } : img))
    );
  }

  async function deleteImage(imageId: string) {
    if (!product?.id) return;
    if (!confirm("Remove this image?")) return;
    await fetch(`/api/admin/products/${product.id}/images/${imageId}`, {
      method: "DELETE",
    });
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  function moveImage(fromIdx: number, toIdx: number) {
    setImages((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr.map((img, i) => ({ ...img, sortOrder: i }));
    });
  }

  // ── Variant generation ──
  function generateVariants() {
    const sizes = sizeOptions.split(",").map((s) => s.trim()).filter(Boolean);
    const colours = colourOptions.split(",").map((c) => c.trim()).filter(Boolean);
    if (!sizes.length && !colours.length) {
      setError("Enter at least one size or colour option before generating.");
      return;
    }
    const generated = generateCombinations(sizes, colours);
    // Preserve price/stock from existing variants with matching name
    const updated = generated.map((g) => {
      const existing = variants.find((v) => v.name === g.name);
      return existing ? { ...existing, ...g, id: existing.id } : g;
    });
    setVariants(updated);
    setError("");
  }

  function removeVariant(idx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateVariant(idx: number, field: keyof VariantRow, value: unknown) {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  }

  // ── Save ──
  async function save(targetStatus: string) {
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const body = {
        name,
        slug,
        description,
        shortDescription,
        status: targetStatus,
        basePrice: hasVariants ? null : rupeesToPaise(basePrice) || null,
        comparePrice: hasVariants ? null : rupeesToPaise(comparePrice) || null,
        sku: hasVariants ? null : sku || null,
        stock: hasVariants ? null : parseInt(stock) || 0,
        lowStockThreshold: parseInt(lowStockThreshold) || 3,
        material: material || null,
        finish: finish || null,
        dimensions: dimensions || null,
        weight: weight || null,
        closureType: closureType || null,
        careInstructions: careInstructions || null,
        originDetails: originDetails || null,
        packageContents: packageContents || null,
        hasVariants,
        sizeOptions: sizeOptions || null,
        colourOptions: colourOptions || null,
        categoryId: categoryId || null,
        collectionIds: selectedCollections,
      };

      let productId = product?.id;

      if (productId) {
        const res = await fetch(`/api/admin/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Save failed");
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Save failed");
        productId = data.product.id;
        router.push(`/admin/products/${productId}/edit`);
        return;
      }

      // Save variants if enabled
      if (hasVariants && productId) {
        const variantPayload = variants.map((v, i) => ({
          name: v.name,
          options: v.options,
          price: rupeesToPaise(String(v.price / 100)),
          comparePrice: v.comparePrice ?? null,
          sku: v.sku || null,
          stock: v.stock,
          isActive: v.isActive,
          sortOrder: i,
        }));

        const vRes = await fetch(`/api/admin/products/${productId}/variants`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(variantPayload),
        });
        const vData = await vRes.json();
        if (!vRes.ok) throw new Error(vData.error ?? "Variant save failed");
        setVariants(
          vData.variants.map((v: { id: string; name: string; options: string; price: number; comparePrice: number | null; sku: string | null; stock: number; isActive: boolean; sortOrder: number }) => ({
            id: v.id,
            name: v.name,
            options: JSON.parse(v.options) as Record<string, string>,
            price: v.price,
            comparePrice: v.comparePrice,
            sku: v.sku,
            stock: v.stock,
            isActive: v.isActive,
            sortOrder: v.sortOrder,
          }))
        );
      }

      setSuccessMsg(`Product ${targetStatus === "published" ? "published" : "saved"} successfully.`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const isNew = !product?.id;

  return (
    <div className="space-y-6">
      {/* Status messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-3 text-sm">
          {successMsg}
        </div>
      )}
      {isNew && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 text-sm">
          Save the product first, then you can upload images.
        </div>
      )}

      {/* ── Section: Core ── */}
      <section className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
          Product Details
        </h2>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="p-name">
            Product name *
          </label>
          <input
            id="p-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            placeholder="e.g. Kundan Polki Necklace"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="p-slug">
            URL slug
          </label>
          <div className="flex rounded-lg border border-stone-300 overflow-hidden focus-within:ring-2 focus-within:ring-stone-400">
            <span className="px-3 py-2 text-xs text-stone-400 bg-stone-50 border-r border-stone-300">
              /products/
            </span>
            <input
              id="p-slug"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
              placeholder="kundan-polki-necklace"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="p-short">
            Short description
          </label>
          <input
            id="p-short"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            placeholder="One or two lines shown in product cards"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="p-desc">
            Description
          </label>
          <textarea
            id="p-desc"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-y"
            placeholder="Full product description…"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="p-cat">
              Category
            </label>
            <select
              id="p-cat"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {collections.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Collections
            </label>
            <div className="flex flex-wrap gap-2">
              {collections.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCollection(c.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedCollections.includes(c.id)
                      ? "bg-stone-800 text-white border-stone-800"
                      : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Section: Images ── */}
      <section className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
          Images
        </h2>

        {/* Upload area */}
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            isNew
              ? "border-stone-200 bg-stone-50 opacity-50 cursor-not-allowed"
              : "border-stone-300 hover:border-stone-500 hover:bg-stone-50"
          }`}
          onClick={() => !isNew && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!isNew) handleFileChange(e.dataTransfer.files);
          }}
        >
          <p className="text-sm text-stone-500">
            {uploading
              ? "Uploading…"
              : isNew
              ? "Save product first, then upload images"
              : "Drop images here, or click to select"}
          </p>
          <p className="text-xs text-stone-400 mt-1">JPEG, PNG, WebP · Max 8 MB each</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />
        </div>

        {/* Image grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={img.id} className="relative group">
                <div
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    img.isCover ? "border-stone-800" : "border-stone-200"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? "Product image"}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>

                {img.isCover && (
                  <span className="absolute top-1 left-1 text-xs bg-stone-800 text-white px-1.5 py-0.5 rounded font-medium">
                    Cover
                  </span>
                )}

                {/* Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1.5 p-2">
                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={() => setCoverImage(img.id)}
                      className="text-xs bg-white text-stone-800 px-2 py-1 rounded w-full text-center font-medium"
                    >
                      Set Cover
                    </button>
                  )}
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx - 1)}
                      className="text-xs bg-white/80 text-stone-700 px-2 py-1 rounded w-full text-center"
                    >
                      ← Move Left
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx + 1)}
                      className="text-xs bg-white/80 text-stone-700 px-2 py-1 rounded w-full text-center"
                    >
                      Move Right →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteImage(img.id)}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded w-full text-center"
                  >
                    Remove
                  </button>
                </div>

                {/* Alt text */}
                <input
                  type="text"
                  value={img.altText ?? ""}
                  onChange={(e) => updateAltText(img.id, e.target.value)}
                  placeholder="Alt text…"
                  className="mt-1 w-full text-xs border border-stone-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Section: Pricing & Variants ── */}
      <section className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
          Pricing &amp; Stock
        </h2>

        {/* Has variants toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            className={`relative w-10 h-6 rounded-full transition-colors ${
              hasVariants ? "bg-stone-800" : "bg-stone-300"
            }`}
            onClick={() => setHasVariants((v) => !v)}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                hasVariants ? "translate-x-5 left-0" : "left-1"
              }`}
            />
          </div>
          <span className="text-sm text-stone-700">This product has options (sizes, colours, etc.)</span>
        </label>

        {!hasVariants ? (
          /* Simple product */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="p-price">
                Price (₹) *
              </label>
              <input
                id="p-price"
                type="number"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="p-cprice">
                Compare-at price (₹)
              </label>
              <input
                id="p-cprice"
                type="number"
                min="0"
                step="0.01"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                placeholder="Struck-through price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="p-sku">
                SKU
              </label>
              <input
                id="p-sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                placeholder="MHR-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="p-stock">
                Stock quantity
              </label>
              <input
                id="p-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="p-lowstock">
                Low stock alert at
              </label>
              <input
                id="p-lowstock"
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>
        ) : (
          /* Variant builder */
          <div className="space-y-4">
            {/* Option inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="p-sizes">
                  Size options
                </label>
                <input
                  id="p-sizes"
                  value={sizeOptions}
                  onChange={(e) => setSizeOptions(e.target.value)}
                  placeholder="S, M, L, XL"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
                <p className="text-xs text-stone-400 mt-1">Comma-separated</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="p-colours">
                  Colour options
                </label>
                <input
                  id="p-colours"
                  value={colourOptions}
                  onChange={(e) => setColourOptions(e.target.value)}
                  placeholder="Gold, Silver, Rose Gold"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
                <p className="text-xs text-stone-400 mt-1">Comma-separated</p>
              </div>
            </div>

            <button
              type="button"
              onClick={generateVariants}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Generate Combinations
            </button>

            {/* Variant rows */}
            {variants.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">
                  {variants.length} combination{variants.length !== 1 ? "s" : ""} — remove any you don't sell
                </p>
                {variants.map((v, idx) => (
                  <div
                    key={v.id ?? idx}
                    className={`grid grid-cols-2 sm:grid-cols-6 gap-2 p-3 rounded-xl border text-sm items-center ${
                      v.isActive ? "border-stone-200 bg-stone-50" : "border-stone-100 bg-stone-50/50 opacity-50"
                    }`}
                  >
                    <span className="col-span-2 sm:col-span-1 font-medium text-stone-700 truncate">
                      {v.name}
                    </span>
                    <div>
                      <label className="text-xs text-stone-400 block mb-0.5">Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.price / 100}
                        onChange={(e) => updateVariant(idx, "price", Math.round(parseFloat(e.target.value) * 100) || 0)}
                        className="w-full border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stone-400 block mb-0.5">SKU</label>
                      <input
                        type="text"
                        value={v.sku ?? ""}
                        onChange={(e) => updateVariant(idx, "sku", e.target.value || null)}
                        className="w-full border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                        placeholder="MHR-001-S"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stone-400 block mb-0.5">Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => updateVariant(idx, "stock", parseInt(e.target.value) || 0)}
                        className="w-full border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-stone-400">Active</label>
                      <input
                        type="checkbox"
                        checked={v.isActive}
                        onChange={(e) => updateVariant(idx, "isActive", e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                      title="Remove this variant"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Section: Product Details (Accordion) ── */}
      <section className="bg-white rounded-xl border border-stone-200 shadow-sm">
        <button
          type="button"
          className="w-full flex items-center justify-between p-5 text-left"
          onClick={() => setDetailsOpen((o) => !o)}
        >
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
            Product Details
          </h2>
          <span className="text-stone-400 text-lg">{detailsOpen ? "−" : "+"}</span>
        </button>
        {detailsOpen && (
          <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: "p-material", label: "Material", value: material, set: setMaterial, placeholder: "Enter only verified material details" },
              { id: "p-finish", label: "Finish", value: finish, set: setFinish, placeholder: "e.g. Antique gold" },
              { id: "p-dimensions", label: "Dimensions", value: dimensions, set: setDimensions, placeholder: "e.g. 45cm chain" },
              { id: "p-weight", label: "Weight", value: weight, set: setWeight, placeholder: "e.g. 25g" },
              { id: "p-closure", label: "Closure type", value: closureType, set: setClosureType, placeholder: "e.g. Lobster clasp" },
              { id: "p-origin", label: "Origin details", value: originDetails, set: setOriginDetails, placeholder: "Enter only verified origin" },
              { id: "p-package", label: "Package contents", value: packageContents, set: setPackageContents, placeholder: "e.g. Necklace + gift box" },
            ].map(({ id, label, value, set, placeholder }) => (
              <div key={id}>
                <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor={id}>
                  {label}
                </label>
                <input
                  id={id}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="p-care">
                Care instructions
              </label>
              <textarea
                id="p-care"
                rows={3}
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-y"
                placeholder="How to care for this item"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Actions ── */}
      <div className="flex flex-wrap items-center gap-3 pb-8">
        <button
          type="button"
          disabled={saving || !name}
          onClick={() => save("draft")}
          className="bg-white border border-stone-300 text-stone-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save Draft"}
        </button>

        <button
          type="button"
          disabled={saving || !name}
          onClick={() => save("published")}
          className="bg-stone-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Publishing…" : "Publish"}
        </button>

        {product?.status === "published" && (
          <button
            type="button"
            disabled={saving}
            onClick={() => save("draft")}
            className="text-stone-500 text-sm hover:text-stone-700 underline underline-offset-2"
          >
            Unpublish
          </button>
        )}

        {product && (
          <button
            type="button"
            disabled={saving}
            onClick={() => save("archived")}
            className="text-red-500 text-sm hover:text-red-700 ml-auto"
          >
            Archive product
          </button>
        )}

        {product && (
          <a
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 text-sm hover:text-stone-600"
          >
            Preview ↗
          </a>
        )}
      </div>
    </div>
  );
}
