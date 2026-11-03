// src/app/admin/products/[id]/edit/page.tsx – Edit existing product

import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm, { type ProductFormData } from "@/components/admin/products/ProductForm";

export const metadata = { title: "Edit Product – MAHIRAANI Admin" };
export const instant = false;
export type { ProductFormData };

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  await connection();
  const { id } = await params;

  const [product, categories, collections] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          orderBy: { sortOrder: "asc" },
          include: { images: { include: { image: true } } },
        },
        category: true,
        collections: { include: { collection: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.collection.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/products" className="text-stone-500 hover:text-stone-800 text-sm">
          ← Products
        </a>
        <span className="text-stone-300">/</span>
        <h1 className="text-xl font-semibold text-stone-800 truncate max-w-xs">{product.name}</h1>
        {product.isSample && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            Sample
          </span>
        )}
      </div>
      <ProductForm product={product as ProductFormData} categories={categories} collections={collections} />
    </div>
  );
}


