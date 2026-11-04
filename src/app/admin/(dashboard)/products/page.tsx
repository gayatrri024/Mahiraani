// src/app/admin/products/page.tsx – Product list page

import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import ProductListClient from "@/components/admin/products/ProductListClient";

export const metadata = { title: "Products – MAHIRAANI Admin" };
export const instant = false;

export default async function AdminProductsPage() {
  await connection();
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        images: { where: { isCover: true }, take: 1 },
        category: { select: { id: true, name: true } },
        _count: { select: { variants: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Products &amp; Inventory</h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your jewellery pieces, pricing, stock levels, and store status.
          </p>
        </div>
        <a
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors shadow-xs"
        >
          <span>＋</span> Add Product
        </a>
      </div>
      <ProductListClient
        initialProducts={products as unknown as ProductWithPreview[]}
        categories={categories}
      />
    </div>
  );
}

export type ProductWithPreview = {
  id: string;
  name: string;
  slug: string;
  status: string;
  basePrice: number | null;
  stock: number | null;
  lowStockThreshold: number | null;
  isSample: boolean;
  hasVariants: boolean;
  updatedAt: Date;
  images: { url: string; altText: string | null }[];
  category: { id: string; name: string } | null;
  _count: { variants: number };
};
