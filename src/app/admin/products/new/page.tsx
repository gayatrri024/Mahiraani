// src/app/admin/products/new/page.tsx – Create new product

import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/products/ProductForm";

export const metadata = { title: "New Product – Mahiraani Admin" };

export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.collection.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/products" className="text-stone-500 hover:text-stone-800 text-sm">
          ← Products
        </a>
        <span className="text-stone-300">/</span>
        <h1 className="text-xl font-semibold text-stone-800">New Product</h1>
      </div>
      <ProductForm
        product={null}
        categories={categories}
        collections={collections}
      />
    </div>
  );
}
