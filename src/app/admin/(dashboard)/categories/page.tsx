// src/app/admin/(dashboard)/categories/page.tsx – Category management
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import CategoriesListClient, { CategoryRow } from "@/components/admin/categories/CategoriesListClient";

export const metadata = {
  title: "Categories – MAHIRAANI Admin",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function AdminCategoriesPage() {
  await connection();

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-800">Categories</h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage product categories and navigation taxonomy
        </p>
      </div>

      <CategoriesListClient initialCategories={categories as CategoryRow[]} />
    </div>
  );
}

