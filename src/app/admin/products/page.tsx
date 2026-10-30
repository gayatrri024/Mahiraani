// src/app/admin/products/page.tsx – Product list page

import { prisma } from "@/lib/prisma";
import ProductListClient from "@/components/admin/products/ProductListClient";

export const metadata = { title: "Products – Mahiraani Admin" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      images: { where: { isCover: true }, take: 1 },
      category: { select: { name: true } },
      _count: { select: { variants: true } },
    },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-800">Products</h1>
        <a
          href="/admin/products/new"
          className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          + Add Product
        </a>
      </div>
      <ProductListClient initialProducts={products as ProductWithPreview[]} />
    </div>
  );
}

export type ProductWithPreview = {
  id: string;
  name: string;
  slug: string;
  status: string;
  basePrice: number | null;
  isSample: boolean;
  hasVariants: boolean;
  updatedAt: Date;
  images: { url: string; altText: string | null }[];
  category: { name: string } | null;
  _count: { variants: number };
};
