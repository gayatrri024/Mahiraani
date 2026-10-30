// src/app/products/[slug]/page.tsx – Product Detail Page

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import ProductDetailClient from "@/components/storefront/ProductDetailClient";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";


type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, shortDescription: true, description: true },
  });

  if (!product) return { title: "Product Not Found – Mahiraani" };

  return {
    title: `${product.name} | Mahiraani Jaipur`,
    description:
      product.shortDescription ||
      product.description ||
      "Handcrafted royal Indian jewellery from Mahiraani Jaipur.",
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: { select: { name: true, slug: true } },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Related products
  const related = await prisma.product.findMany({
    where: {
      status: "published",
      id: { not: product.id },
    },
    take: 4,
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-stone-900">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          {product.category && (
            <>
              <Link
                href={`/collections/${product.category.slug}`}
                className="hover:text-stone-900"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </>
          )}
          <span className="text-stone-900 font-medium truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Product Details Component */}
        <ProductDetailClient product={product} />

        {/* Related Heirlooms */}
        {related.length > 0 && (
          <section className="mt-24 pt-12 border-t border-stone-200">
            <div className="text-center mb-10">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#B8922A] font-semibold">
                Complete Your Ensemble
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-1">
                You May Also Cherish
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <CartDrawer />
      <MobileStickyBar />
      <Footer />
    </div>
  );
}
