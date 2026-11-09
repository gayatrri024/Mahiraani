// src/app/collections/[slug]/page.tsx – Collection & Category Catalogue Page

import { prisma } from "@/lib/prisma";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, ChevronRight, Search } from "lucide-react";
import type { Metadata } from "next";
import type { Prisma } from "@/generated/prisma/client";

export const instant = false;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ q?: string }>;
};

export async function generateStaticParams() {
  try {
    const [categories, collections] = await Promise.all([
      prisma.category.findMany({ select: { slug: true } }),
      prisma.collection.findMany({ select: { slug: true } }),
    ]);
    const staticParams = [
      { slug: "all" },
      { slug: "gold-base" },
      { slug: "oxidised" },
      { slug: "under-999" },
    ];
    for (const c of categories) {
      if (c.slug && !staticParams.some((s) => s.slug === c.slug)) {
        staticParams.push({ slug: c.slug });
      }
    }
    for (const col of collections) {
      if (col.slug && !staticParams.some((s) => s.slug === col.slug)) {
        staticParams.push({ slug: col.slug });
      }
    }
    return staticParams;
  } catch (error) {
    console.error("Failed to generate static params for collections:", error);
    return [
      { slug: "all" },
      { slug: "gold-base" },
      { slug: "oxidised" },
      { slug: "under-999" },
    ];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "under-999") {
    return {
      title: "UNDER ₹999 | MAHIRAANI",
      description: "Discover handcrafted luxury jewellery under ₹999. Anti-tarnish, premium finish sourced across India.",
    };
  }
  if (slug === "gold-base") {
    return {
      title: "GOLD-BASE JEWELLERY | MAHIRAANI",
      description: "Explore exquisite gold-base jewellery with durable anti-tarnish protective layering. Sourced from skilled artisans across India.",
    };
  }
  if (slug === "oxidised") {
    return {
      title: "OXIDISED JEWELLERY | MAHIRAANI",
      description: "Discover handcrafted oxidised and antique-finish silver tone jewellery. Skin-friendly, regal designs curated across India.",
    };
  }
  const title = slug === "all" ? "All Jewellery" : slug.replace(/-/g, " ");
  return {
    title: `${title.toUpperCase()} | MAHIRAANI`,
    description: `Explore the MAHIRAANI ${title} collection. Handcrafted everyday jewellery with anti-tarnish finish.`,
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = resolvedSearchParams.q?.trim() || "";

  let title = "All Jewellery";
  let description = "Handcrafted jewellery sourced from skilled artisans across India, featuring gold-based and oxidised designs.";
  const whereClause: Prisma.ProductWhereInput = { status: "published" };

  if (query) {
    whereClause.OR = [
      { name: { contains: query } },
      { description: { contains: query } },
      { shortDescription: { contains: query } },
      { material: { contains: query } },
      { finish: { contains: query } },
    ];
  }

  if (slug === "under-999") {
    title = "Under ₹999 Luxury";
    description = "Accessible royal elegance. Handcrafted pieces designed for effortless daily wear and gifting, priced under ₹999.";
    whereClause.AND = [
      {
        OR: [
          { basePrice: { lte: 99900, gt: 0 } },
          { variants: { some: { price: { lte: 99900, gt: 0 }, isActive: true } } },
        ],
      },
    ];
  } else if (slug === "gold-base") {
    title = "Gold-Base Jewellery";
    description = "Exquisite warm gold-toned jewellery coated with durable anti-tarnish protective finish for long-lasting luster.";
    whereClause.OR = [
      { finish: { contains: "gold" } },
      { material: { contains: "gold" } },
      { name: { contains: "gold" } },
      { description: { contains: "gold" } },
    ];
  } else if (slug === "oxidised") {
    title = "Oxidised Jewellery";
    description = "Artisanal oxidised and antique silver-tone jewellery. Intricate filigree and statement pieces curated across India.";
    whereClause.OR = [
      { finish: { contains: "oxidised" } },
      { material: { contains: "oxidised" } },
      { name: { contains: "oxidised" } },
      { description: { contains: "oxidised" } },
      { finish: { contains: "silver" } },
      { material: { contains: "silver" } },
    ];
  } else if (slug !== "all") {
    // Check if category matches slug
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (category) {
      title = `${category.name} Collection`;
      description = category.description || `Handcrafted ${category.name.toLowerCase()} curated with exceptional artistry across India.`;
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
        // Unrecognized slug: return 404 instead of showing all products
        notFound();
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
          <span className="text-stone-900 font-medium capitalize">
            {slug === "under-999" ? "Under ₹999" : slug.replace(/-/g, " ")}
          </span>
          {query && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-[#6B2737] font-medium">Search: &ldquo;{query}&rdquo;</span>
            </>
          )}
        </nav>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8922A] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MAHIRAANI</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 capitalize">
            {query ? `Search: “${query}”` : title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-3 font-light leading-relaxed">
            {query ? `Showing available designs matching your search term.` : description}
          </p>
        </div>

        {/* Category & Collection Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-6 mb-4 no-scrollbar">
          {[
            { label: "All Jewellery", href: "/collections/all", active: slug === "all" && !query },
            { label: "Gold-Base", href: "/collections/gold-base", active: slug === "gold-base" },
            { label: "Oxidised", href: "/collections/oxidised", active: slug === "oxidised" },
            { label: "Earrings", href: "/collections/earrings", active: slug === "earrings" },
            { label: "Necklaces", href: "/collections/necklaces", active: slug === "necklaces" },
            { label: "Bangles & Kadas", href: "/collections/bangles", active: slug === "bangles" },
            { label: "Festive Edit", href: "/collections/festive-edit", active: slug === "festive-edit" },
            { label: "Under ₹999", href: "/collections/under-999", active: slug === "under-999" },
          ].map((pill) => (
            <Link
              key={pill.label}
              href={pill.href}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all ${
                pill.active
                  ? "bg-[#6B2737] text-white shadow-xs"
                  : "bg-white text-stone-700 border border-stone-200/80 hover:border-stone-400 hover:text-stone-900"
              }`}
            >
              {pill.label}
            </Link>
          ))}
        </div>

        {/* Product Count & Sort */}
        <div className="flex items-center justify-between pb-4 mb-8 border-b border-stone-200 text-xs text-stone-600">
          <span>Showing <strong>{products.length}</strong> designs</span>
          <div className="flex items-center gap-2">
            <span className="text-stone-400">Sourced Across India</span>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto">
            {query ? (
              <Search className="w-8 h-8 text-[#B8922A] mx-auto mb-3" />
            ) : (
              <Sparkles className="w-8 h-8 text-[#B8922A] mx-auto mb-3" />
            )}
            <h3 className="font-serif text-2xl text-stone-800 mb-2">
              {query ? "No Designs Found" : "New Designs Arriving Soon"}
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              {query
                ? `We couldn't find any designs matching "${query}". Try searching for earrings, necklaces, or bangles.`
                : "Our artisans are handcrafting pieces for this collection. Explore other categories or chat with our stylist."}
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
