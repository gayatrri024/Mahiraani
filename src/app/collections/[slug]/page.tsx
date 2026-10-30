// src/app/collections/[slug]/page.tsx – Collection & Category Catalogue Page

import { prisma } from "@/lib/prisma";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { Sparkles, ChevronRight, Filter } from "lucide-react";
import type { Metadata } from "next";


type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug === "all" ? "All Jewellery" : slug.replace(/-/g, " ");
  return {
    title: `${title.toUpperCase()} | Mahiraani Jaipur`,
    description: `Explore the royal Mahiraani ${title} collection. Handcrafted Indian jewellery with certified hallmarks.`,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;

  let title = "All Jewellery Heirlooms";
  let description = "Handcrafted royal pieces adorned with uncut Polki, Kundan, and 22K gold micron finishes.";
  let whereClause: any = { status: "published" };

  if (slug !== "all") {
    // Check if category matches slug
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (category) {
      title = `${category.name} Collection`;
      description = category.description || `Handcrafted royal ${category.name.toLowerCase()} shaped with heirloom Jaipur artistry.`;
      whereClause.categoryId = category.id;
    } else {
      // Check if collection matches slug
      const collection = await prisma.collection.findUnique({
        where: { slug },
      });

      if (collection) {
        title = `${collection.name}`;
        description = collection.description || "Exclusive curated selection for celebrations and festive elegance.";
        whereClause.collections = {
          some: { collectionId: collection.id },
        };
      } else {
        title = slug.replace(/-/g, " ").toUpperCase();
      }
    }
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: { select: { name: true, slug: true } },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-6">
          <Link href="/" className="hover:text-stone-900">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-medium capitalize">{slug.replace(/-/g, " ")}</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8922A] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mahiraani Atelier</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 capitalize">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-3 font-light leading-relaxed">
            {description}
          </p>
        </div>

        {/* Product Count & Sort */}
        <div className="flex items-center justify-between pb-4 mb-8 border-b border-stone-200 text-xs text-stone-600">
          <span>Showing <strong>{products.length}</strong> royal heirlooms</span>
          <div className="flex items-center gap-2">
            <span className="text-stone-400">Jaipur Karigari</span>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto">
            <Sparkles className="w-8 h-8 text-[#B8922A] mx-auto mb-3" />
            <h3 className="font-serif text-2xl text-stone-800 mb-2">
              New Designs Arriving Soon
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Our artisans are handcrafting pieces for this collection. Explore other categories or chat with our stylist.
            </p>
            <Link
              href="/collections/all"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#6B2737] text-white rounded-full text-xs uppercase tracking-wider font-medium"
            >
              Explore All Jewellery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <CartDrawer />
      <MobileStickyBar />
      <Footer />
    </div>
  );
}
