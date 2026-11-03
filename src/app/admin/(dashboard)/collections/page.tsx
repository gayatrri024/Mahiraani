// src/app/admin/(dashboard)/collections/page.tsx – Collections management
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import CollectionsListClient, { CollectionRow } from "@/components/admin/collections/CollectionsListClient";

export const metadata = {
  title: "Collections – MAHIRAANI Admin",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function AdminCollectionsPage() {
  await connection();

  const collections = await prisma.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-800">Collections</h1>
        <p className="text-xs text-stone-500 mt-1">
          Curate seasonal and thematic jewellery collections (Festive Edit, Everyday Wear, etc.)
        </p>
      </div>

      <CollectionsListClient initialCollections={collections as unknown as CollectionRow[]} />
    </div>
  );
}

