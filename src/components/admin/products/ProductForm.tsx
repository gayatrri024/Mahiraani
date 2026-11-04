"use client";
// src/components/admin/products/ProductForm.tsx
// Complete product create/edit form tailored for non-technical business owner:
// - Image selection & preview BEFORE product is saved
// - Automatic image uploading upon creation
// - Inline field validation with clear rupee pricing
// - Friendly error messages without technical jargon
// - Unsaved changes prompt
// - Direct delete / archive action with confirmation
// - One-click storefront preview

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ProductFormData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  status: string;
  basePrice: number | null;
  comparePrice: number | null;
  sku: string | null;
  stock: number | null;
  lowStockThreshold: number | null;
  material: string | null;
  finish: string | null;
  dimensions: string | null;
  weight: string | null;
  closureType: string | null;
  careInstructions: string | null;
  originDetails: string | null;
  packageContents: string | null;
  hasVariants: boolean;
  sizeOptions: string | null;
  colourOptions: string | null;
  categoryId: string | null;
  isSample: boolean;
  images: {
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
    isCover: boolean;
  }[];
  variants: {
    id: string;
    name: string;
    options: string;
    price: number;
    comparePrice: number | null;
    sku: string | null;
    stock: number;
    isActive: boolean;
    sortOrder: number;
  }[];
  collections: {
    collectionId: string;
    collection: { id: string; name: string };
  }[];
}

interface Category {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
}

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

interface StagedFile {
  id: string;
  file: File;
  previewUrl: string;
  altText: string;
  isCover: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function rupeesToPaise(r: string): number {
  const n = parseFloat(r.replace(/,/g, ""));
  if (isNaN(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function paiseToRupees(p: number | null | undefined): string {
  if (p === null || p === undefined || p === 0) return "";
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
      combos.push({
        name: size.trim(),
        options: { size: size.trim() },
        price: 0,
        sku: null,
        stock: 0,
        isActive: true,
        sortOrder: i++,
      });
    }
  } else if (colours.length) {
    for (const colour of colours) {
      combos.push({
        name: colour.trim(),
        options: { colour: colour.trim() },
        price: 0,
        sku: null,
        stock: 0,
        isActive: true,
        sortOrder: i++,
      });
    }
  }
  return combos;
}

function humanizeError(rawError: string): string {
  const lower = rawError.toLowerCase();
  if (lower.includes("unique") && lower.includes("slug")) {
    return "A product with this name already exists. Please change the name slightly or modify the URL handle.";
  }
  if (lower.includes("file exceeds maximum size")) {
    return "One of your photos is larger than 8 MB. Please compress or select a smaller photo.";
  }
  if (lower.includes("not allowed") || lower.includes("image/")) {
    return "Please upload JPEG, PNG, or WebP images only.";
  }
  return rawError;
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
  const isNew = !product?.id;

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
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(product?.lowStockThreshold ?? "3")
  );

  // ── Specifications & Details ──
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

  // ── Existing Images (from database) ──
  const [images, setImages] = useState<ImageRow[]>(
    product?.images.map((i) => ({
      id: i.id,
      url: i.url,
      altText: i.altText,
      sortOrder: i.sortOrder,
      isCover: i.isCover,
    })) ?? []
  );

  // ── Staged Images (selected on new product before save) ──
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // ── UI state ──
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(!!product?.material);
  const [isDirty, setIsDirty] = useState(false);

  // Unsaved changes prompt
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty && !saving) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, saving]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      stagedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
  }, [stagedFiles]);

  // ── Slug auto-generate ──
  function handleNameChange(v: string) {
    setName(v);
    setIsDirty(true);
    if (!slugEdited) {
      setSlug(
        v
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_]+/g, "-")
      );
    }
  }

  // ── Collection toggle ──
  function toggleCollection(id: string) {
    setIsDirty(true);
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  // ── Image selection handling ──
  async function handleFileChange(files: FileList | null) {
    if (!files?.length) return;
    setError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const maxBytes = 8 * 1024 * 1024; // 8 MB

    // Validate files first
    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        setError(`"${file.name}" is not a supported format. Please use JPEG, PNG, or WebP.`);
        return;
      }
      if (file.size > maxBytes) {
        setError(`"${file.name}" is larger than 8 MB. Please compress or select a smaller image.`);
        return;
      }
    }

    // If this is a NEW product: stage files locally with preview URLs
    if (isNew) {
      setIsDirty(true);
      const newStaged: StagedFile[] = Array.from(files).map((file, idx) => ({
        id: `staged-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        altText: "",
        isCover: stagedFiles.length === 0 && idx === 0,
      }));
      setStagedFiles((prev) => [...prev, ...newStaged]);
      return;
    }

    // If product already exists in DB: upload immediately
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append("images", f);
      const res = await fetch(`/api/admin/products/${product.id}/images`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImages((prev) => [...prev, ...data.images.map((img: ImageRow) => ({ ...img }))]);
      setIsDirty(true);
      setSuccessMsg("Photos uploaded successfully.");
    } catch (err) {
      setError(humanizeError((err as Error).message));
    } finally {
      setUploading(false);
    }
  }

  // Cover image selection
  async function setCoverImage(imageId: string) {
    if (isNew) {
      setStagedFiles((prev) =>
        prev.map((f) => ({ ...f, isCover: f.id === imageId }))
      );
      return;
    }
    if (!product?.id) return;
    await fetch(`/api/admin/products/${product.id}/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCover: true }),
    });
    setImages((prev) => prev.map((img) => ({ ...img, isCover: img.id === imageId })));
  }

  // Alt text update
  async function updateAltText(imageId: string, altText: string) {
    if (isNew) {
      setStagedFiles((prev) =>
        prev.map((f) => (f.id === imageId ? { ...f, altText } : f))
      );
      return;
    }
    if (!product?.id) return;
    await fetch(`/api/admin/products/${product.id}/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ altText }),
    });
    setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, altText } : img)));
  }

  // Delete image
  async function deleteImage(imageId: string) {
    if (isNew) {
      const found = stagedFiles.find((f) => f.id === imageId);
      if (found) URL.revokeObjectURL(found.previewUrl);
      setStagedFiles((prev) => {
        const filtered = prev.filter((f) => f.id !== imageId);
        // Ensure at least one is cover if any remain
        if (filtered.length > 0 && !filtered.some((f) => f.isCover)) {
          filtered[0].isCover = true;
        }
        return filtered;
      });
      return;
    }
    if (!product?.id) return;
    if (!confirm("Remove this image?")) return;
    await fetch(`/api/admin/products/${product.id}/images/${imageId}`, {
      method: "DELETE",
    });
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  function moveImage(fromIdx: number, toIdx: number) {
    if (isNew) {
      setStagedFiles((prev) => {
        const arr = [...prev];
        const [moved] = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, moved);
        return arr;
      });
      return;
    }
    setImages((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr.map((img, i) => ({ ...img, sortOrder: i }));
    });
  }

  // ── Variant generation ──
  function generateVariants() {
    const sizes = sizeOptions
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const colours = colourOptions
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (!sizes.length && !colours.length) {
      setError("Please enter at least one size (e.g. S, M) or colour (e.g. Gold) first.");
      return;
    }
    const generated = generateCombinations(sizes, colours);
    const updated = generated.map((g) => {
      const existing = variants.find((v) => v.name === g.name);
      return existing ? { ...existing, ...g, id: existing.id } : g;
    });
    setVariants(updated);
    setIsDirty(true);
    setError("");
  }

  function removeVariant(idx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
  }

  function updateVariant(idx: number, field: keyof VariantRow, value: unknown) {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
    setIsDirty(true);
  }

  // ── Save action ──
  async function save(targetStatus: string) {
    setError("");
    setSuccessMsg("");

    // Validation
    if (!name.trim()) {
      setError("Please enter a Product Name.");
      return;
    }

    if (!hasVariants) {
      const pricePaise = rupeesToPaise(basePrice);
      if (!pricePaise || pricePaise <= 0) {
        setError("Please enter a valid price in Rupees (₹).");
        return;
      }
    }

    setSaving(true);

    try {
      const body = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description || null,
        shortDescription: shortDescription || null,
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
        // Updating existing product
        const res = await fetch(`/api/admin/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Save failed");
      } else {
        // Creating new product
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to create product");
        productId = data.product.id;

        // If files were staged, upload them now
        if (stagedFiles.length > 0 && productId) {
          const fd = new FormData();
          for (let i = 0; i < stagedFiles.length; i++) {
            fd.append("images", stagedFiles[i].file);
            if (stagedFiles[i].altText) {
              fd.append(`altText_${i}`, stagedFiles[i].altText);
            }
          }
          const uploadRes = await fetch(`/api/admin/products/${productId}/images`, {
            method: "POST",
            body: fd,
          });
          const uploadData = await uploadRes.json();

          // If a specific staged photo was marked cover, apply it
          if (uploadRes.ok && uploadData.images?.length) {
            const coverIdx = stagedFiles.findIndex((f) => f.isCover);
            if (coverIdx > 0 && uploadData.images[coverIdx]?.id) {
              await fetch(
                `/api/admin/products/${productId}/images/${uploadData.images[coverIdx].id}`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isCover: true }),
                }
              );
            }
          }
        }

        setIsDirty(false);
        router.push(`/admin/products/${productId}/edit?created=true`);
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
        if (!vRes.ok) throw new Error(vData.error ?? "Failed to update variants");
      }

      setIsDirty(false);
      setSuccessMsg(
        `Product ${targetStatus === "published" ? "published live" : "saved as draft"} successfully!`
      );
      router.refresh();
    } catch (err) {
      setError(humanizeError((err as Error).message));
    } finally {
      setSaving(false);
    }
  }

  // ── Delete action (on edit page) ──
  async function handleDeleteProduct() {
    if (!product?.id) return;
    const confirmed = confirm(
      `Are you sure you want to delete "${product.name}"?\n\nIf customers have ordered this item in the past, it will be safely archived to protect order records.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete product");
      setIsDirty(false);
      router.push("/admin/products");
    } catch (err) {
      setError(humanizeError((err as Error).message));
      setDeleting(false);
    }
  }

  const allImagesCount = isNew ? stagedFiles.length : images.length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 border border-stone-200 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900">
              {isNew ? "Add New Jewellery Piece" : `Edit: ${name || product.name}`}
            </h1>
            {!isNew && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  product.status === "published"
                    ? "bg-emerald-100 text-emerald-800"
                    : product.status === "draft"
                    ? "bg-stone-200 text-stone-700"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {product.status === "published"
                  ? "Live on Store"
                  : product.status === "draft"
                  ? "Draft"
                  : "Archived"}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {isNew
              ? "Fill in your product details, upload photos, and publish whenever you are ready."
              : "Update your pricing, available stock, photos, and descriptions."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isNew && product.status === "published" && (
            <a
              href={`/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 px-3 py-2 rounded-lg transition-colors shadow-2xs"
            >
              <span>View Live on Store ↗</span>
            </a>
          )}
          <Link
            href="/admin/products"
            className="text-xs text-stone-600 hover:text-stone-900 px-3 py-2 rounded-lg hover:bg-stone-200/50 transition-colors"
          >
            ← Back to Products
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-800 text-xs">
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button
            onClick={() => setSuccessMsg("")}
            className="text-emerald-500 hover:text-emerald-800 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Section 1: Basic Information ── */}
      <section className="bg-white rounded-xl border border-stone-200 shadow-2xs p-5 space-y-4">
        <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider pb-2 border-b border-stone-100">
          1. Basic Information
        </h2>

        <div>
          <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor="p-name">
            Product Name <span className="text-rose-600 font-bold">*</span>
          </label>
          <input
            id="p-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
            placeholder="e.g. Traditional Kundan Chandbali Earrings"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor="p-cat">
              Category
            </label>
            <select
              id="p-cat"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setIsDirty(true);
              }}
              className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 bg-white"
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor="p-slug">
              Web Address Handle (Slug)
            </label>
            <div className="flex rounded-lg border border-stone-300 overflow-hidden focus-within:ring-2 focus-within:ring-stone-500">
              <span className="px-3 py-2 text-xs text-stone-400 bg-stone-50 border-r border-stone-300 flex items-center">
                /products/
              </span>
              <input
                id="p-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEdited(true);
                  setIsDirty(true);
                }}
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
                placeholder="auto-generated-from-name"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor="p-short">
            Short Tagline / Catchphrase
          </label>
          <input
            id="p-short"
            value={shortDescription}
            onChange={(e) => {
              setShortDescription(e.target.value);
              setIsDirty(true);
            }}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
            placeholder="Brief 1-line description shown on collection cards"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor="p-desc">
            Full Description &amp; Styling Notes
          </label>
          <textarea
            id="p-desc"
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setIsDirty(true);
            }}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 resize-y"
            placeholder="Describe the piece, the craftsmanship, how to style it, and occasion recommendations…"
          />
        </div>

        {collections.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-stone-800 mb-2">
              Featured in Collections
            </label>
            <div className="flex flex-wrap gap-2">
              {collections.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCollection(c.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    selectedCollections.includes(c.id)
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
                  }`}
                >
                  {selectedCollections.includes(c.id) ? "✓ " : "+ "}
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Section 2: Photos & Images ── */}
      <section className="bg-white rounded-xl border border-stone-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
              2. Product Photos
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select or drop high-quality jewellery photography. You can select multiple images at
              once.
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
            {allImagesCount} photo{allImagesCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Upload dropzone */}
        <div
          className="border-2 border-dashed border-stone-300 hover:border-stone-500 rounded-xl p-8 text-center cursor-pointer hover:bg-stone-50/70 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileChange(e.dataTransfer.files);
          }}
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-600 mb-2">
            📸
          </div>
          <p className="text-sm font-medium text-stone-800">
            {uploading ? "Uploading photos…" : "Click to select or drag and drop photos here"}
          </p>
          <p className="text-xs text-stone-400 mt-1">JPEG, PNG, WebP · Max 8 MB each</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />
        </div>

        {/* Image Grid */}
        {allImagesCount > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
            {/* Staged photos for new product */}
            {isNew &&
              stagedFiles.map((staged, idx) => (
                <div
                  key={staged.id}
                  className="relative group border border-stone-200 rounded-xl overflow-hidden bg-stone-50"
                >
                  <div className="aspect-square relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={staged.previewUrl}
                      alt={staged.altText || `Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {staged.isCover && (
                      <span className="absolute top-2 left-2 text-[11px] font-bold bg-stone-900 text-white px-2 py-0.5 rounded shadow-xs">
                        Main Cover
                      </span>
                    )}
                  </div>

                  {/* Actions overlay */}
                  <div className="p-2 space-y-1.5 bg-white border-t border-stone-100">
                    <div className="flex items-center gap-1">
                      {!staged.isCover && (
                        <button
                          type="button"
                          onClick={() => setCoverImage(staged.id)}
                          className="text-[11px] flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 py-1 rounded text-center font-medium"
                        >
                          Set Cover
                        </button>
                      )}
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx - 1)}
                          className="text-[11px] px-1.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded"
                          title="Move left"
                        >
                          ←
                        </button>
                      )}
                      {idx < stagedFiles.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx + 1)}
                          className="text-[11px] px-1.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded"
                          title="Move right"
                        >
                          →
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteImage(staged.id)}
                        className="text-[11px] px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-medium"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      value={staged.altText}
                      onChange={(e) => updateAltText(staged.id, e.target.value)}
                      placeholder="Photo description…"
                      className="w-full text-[11px] border border-stone-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>
              ))}

            {/* Existing photos for saved product */}
            {!isNew &&
              images.map((img, idx) => (
                <div
                  key={img.id}
                  className="relative group border border-stone-200 rounded-xl overflow-hidden bg-stone-50"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={img.url}
                      alt={img.altText ?? "Product image"}
                      width={220}
                      height={220}
                      className="w-full h-full object-cover"
                    />
                    {img.isCover && (
                      <span className="absolute top-2 left-2 text-[11px] font-bold bg-stone-900 text-white px-2 py-0.5 rounded shadow-xs">
                        Main Cover
                      </span>
                    )}
                  </div>

                  <div className="p-2 space-y-1.5 bg-white border-t border-stone-100">
                    <div className="flex items-center gap-1">
                      {!img.isCover && (
                        <button
                          type="button"
                          onClick={() => setCoverImage(img.id)}
                          className="text-[11px] flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 py-1 rounded text-center font-medium"
                        >
                          Set Cover
                        </button>
                      )}
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx - 1)}
                          className="text-[11px] px-1.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded"
                          title="Move left"
                        >
                          ←
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx + 1)}
                          className="text-[11px] px-1.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded"
                          title="Move right"
                        >
                          →
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteImage(img.id)}
                        className="text-[11px] px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-medium"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      value={img.altText ?? ""}
                      onChange={(e) => updateAltText(img.id, e.target.value)}
                      placeholder="Photo description…"
                      className="w-full text-[11px] border border-stone-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* ── Section 3: Pricing & Inventory ── */}
      <section className="bg-white rounded-xl border border-stone-200 shadow-2xs p-5 space-y-4">
        <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider pb-2 border-b border-stone-100">
          3. Pricing &amp; Stock Levels
        </h2>

        {/* Options / Variants toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-200">
          <div>
            <p className="text-sm font-medium text-stone-800">
              Does this product have size or colour variations?
            </p>
            <p className="text-xs text-stone-500">
              Turn this on if you sell different sizes (e.g. Bangles: 2.4, 2.6) or different metal finishes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setHasVariants((v) => !v);
              setIsDirty(true);
            }}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              hasVariants ? "bg-stone-900" : "bg-stone-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                hasVariants ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {!hasVariants ? (
          /* Simple Product Pricing & Stock */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor="p-price">
                Selling Price (₹) <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-semibold text-sm">
                  ₹
                </span>
                <input
                  id="p-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => {
                    setBasePrice(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full border border-stone-300 rounded-lg pl-7 pr-3 py-2 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500"
                  placeholder="550.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor="p-cprice">
                Original MRP / Struck-through (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-semibold text-sm">
                  ₹
                </span>
                <input
                  id="p-cprice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={comparePrice}
                  onChange={(e) => {
                    setComparePrice(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full border border-stone-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
                  placeholder="Optional discount display"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor="p-stock">
                Available Stock Quantity
              </label>
              <input
                id="p-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 font-mono"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor="p-lowstock">
                Low Stock Alert Warning
              </label>
              <input
                id="p-lowstock"
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => {
                  setLowStockThreshold(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 font-mono"
                placeholder="3"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor="p-sku">
                Product SKU / Internal Code
              </label>
              <input
                id="p-sku"
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
                placeholder="e.g. MHR-EAR-001"
              />
            </div>
          </div>
        ) : (
          /* Multi-variant builder */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor="p-sizes">
                  Sizes (comma-separated)
                </label>
                <input
                  id="p-sizes"
                  value={sizeOptions}
                  onChange={(e) => {
                    setSizeOptions(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="2.4, 2.6, 2.8"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor="p-colours">
                  Colours / Finishes (comma-separated)
                </label>
                <input
                  id="p-colours"
                  value={colourOptions}
                  onChange={(e) => {
                    setColourOptions(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Antique Gold, Silver, Rose Gold"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={generateVariants}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              Generate Variants
            </button>

            {variants.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">
                  {variants.length} variant combination{variants.length !== 1 ? "s" : ""}
                </p>
                {variants.map((v, idx) => (
                  <div
                    key={v.id ?? idx}
                    className={`grid grid-cols-2 sm:grid-cols-6 gap-2 p-3 rounded-xl border text-sm items-center ${
                      v.isActive
                        ? "border-stone-200 bg-stone-50"
                        : "border-stone-100 bg-stone-50/50 opacity-50"
                    }`}
                  >
                    <span className="col-span-2 sm:col-span-1 font-semibold text-stone-800 truncate">
                      {v.name}
                    </span>
                    <div>
                      <label className="text-[11px] text-stone-500 block mb-0.5">Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.price / 100}
                        onChange={(e) =>
                          updateVariant(
                            idx,
                            "price",
                            Math.round(parseFloat(e.target.value) * 100) || 0
                          )
                        }
                        className="w-full border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-stone-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-500 block mb-0.5">SKU</label>
                      <input
                        type="text"
                        value={v.sku ?? ""}
                        onChange={(e) => updateVariant(idx, "sku", e.target.value || null)}
                        className="w-full border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-stone-500"
                        placeholder="MHR-001"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-500 block mb-0.5">Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) =>
                          updateVariant(idx, "stock", parseInt(e.target.value) || 0)
                        }
                        className="w-full border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-stone-500 font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-stone-600">Active</label>
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
                      className="text-rose-600 hover:text-rose-800 text-xs font-medium cursor-pointer"
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

      {/* ── Section 4: Specifications & Care (Accordion) ── */}
      <section className="bg-white rounded-xl border border-stone-200 shadow-2xs">
        <button
          type="button"
          className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
          onClick={() => setDetailsOpen((o) => !o)}
        >
          <div>
            <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
              4. Specifications, Materials &amp; Care Details (Optional)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Add genuine details on materials, finish, weight, and care instructions to build customer
              trust.
            </p>
          </div>
          <span className="text-stone-500 font-bold text-xl">{detailsOpen ? "−" : "+"}</span>
        </button>

        {detailsOpen && (
          <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-100 pt-4">
            {[
              {
                id: "p-material",
                label: "Material",
                value: material,
                set: setMaterial,
                placeholder: "e.g. Brass alloy, Kundan stones, faux pearls",
              },
              {
                id: "p-finish",
                label: "Finish / Polish",
                value: finish,
                set: setFinish,
                placeholder: "e.g. Antique Gold, Matte Gold, Silver Rhodium",
              },
              {
                id: "p-dimensions",
                label: "Dimensions",
                value: dimensions,
                set: setDimensions,
                placeholder: "e.g. Length: 6 cm, Width: 3 cm",
              },
              {
                id: "p-weight",
                label: "Weight",
                value: weight,
                set: setWeight,
                placeholder: "e.g. 28 grams per pair",
              },
              {
                id: "p-closure",
                label: "Closure Type",
                value: closureType,
                set: setClosureType,
                placeholder: "e.g. Push back, Fish hook, Lobster clasp",
              },
              {
                id: "p-origin",
                label: "Origin Details",
                value: originDetails,
                set: setOriginDetails,
                placeholder: "Handcrafted in India",
              },
              {
                id: "p-package",
                label: "Package Contents",
                value: packageContents,
                set: setPackageContents,
                placeholder: "e.g. 1 Pair of Earrings in a luxury keepsake box",
              },
            ].map(({ id, label, value, set, placeholder }) => (
              <div key={id}>
                <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor={id}>
                  {label}
                </label>
                <input
                  id={id}
                  value={value}
                  onChange={(e) => {
                    set(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder={placeholder}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-800 mb-1" htmlFor="p-care">
                Care Instructions
              </label>
              <textarea
                id="p-care"
                rows={3}
                value={careInstructions}
                onChange={(e) => {
                  setCareInstructions(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 resize-y"
                placeholder="e.g. Keep away from water, perfumes and deodorants. Store in the provided airtight box."
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Main Save / Publish Action Bar ── */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 sticky bottom-4 z-10">
        <div className="flex items-center gap-2">
          {/* Save Draft Button */}
          <button
            type="button"
            disabled={saving || deleting}
            onClick={() => save("draft")}
            className="bg-white border border-stone-300 text-stone-800 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-50 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
          >
            {saving ? "Saving…" : "Save as Draft"}
          </button>

          {/* Publish Button */}
          <button
            type="button"
            disabled={saving || deleting}
            onClick={() => save("published")}
            className="bg-stone-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
          >
            <span>●</span>
            {saving ? "Publishing…" : "Publish Live on Store"}
          </button>
        </div>

        {/* Danger & Navigation Actions */}
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              type="button"
              disabled={saving || deleting}
              onClick={handleDeleteProduct}
              className="text-rose-600 hover:text-rose-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            >
              {deleting ? "Deleting…" : "Delete Product"}
            </button>
          )}

          <Link
            href="/admin/products"
            className="text-stone-500 hover:text-stone-800 text-sm font-medium px-3 py-2"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
