// src/app/products/[slug]/page.tsx – Product Detail Page

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import ProductDetailClient from "@/components/storefront/ProductDetailClient";
import ProductReviewsSection, {
  ReviewItem,
  ReviewStats,
} from "@/components/storefront/ProductReviewsSection";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { getCustomerSession } from "@/lib/customer";


type Props = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "published" },
      select: { slug: true },
    });
    if (products.length > 0) {
      return products.map((p) => ({ slug: p.slug }));
    }
  } catch (error) {
    console.error("Failed to generate static params for products:", error);
  }
  // Next.js 16 with Cache Components requires generateStaticParams to return at least one result
  return [{ slug: "modern-art-earrings" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { name: true, shortDescription: true, description: true },
    });

    if (!product) return { title: "Product Not Found – Mahiraani" };

    return {
      title: `${product.name} | MAHIRAANI`,
      description:
        product.shortDescription ||
        product.description ||
        "Handcrafted jewellery from MAHIRAANI, Pune, India.",
    };
  } catch (error) {
    console.error("Failed to generate metadata for product:", error);
    return { title: "Handcrafted Indian Jewellery | MAHIRAANI" };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let product = null;
  try {
    product = await prisma.product.findUnique({
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
  } catch (error) {
    console.error("Failed to load product details for page:", error);
  }

  if (!product) {
    notFound();
  }

  // Approved reviews for this product
  let reviewsData: {
    id: string;
    rating: number;
    title: string | null;
    comment: string;
    customerName: string;
    isVerifiedPurchase: boolean;
    images: string[] | null;
    createdAt: Date;
  }[] = [];

  try {
    reviewsData = await prisma.review.findMany({
      where: {
        productId: product.id,
        status: "approved",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        customerName: true,
        isVerifiedPurchase: true,
        images: true,
        createdAt: true,
      },
    }) as unknown as typeof reviewsData;
  } catch (error) {
    console.error("Failed to load product reviews:", error);
  }

  const totalReviews = reviewsData.length;
  const averageRating =
    totalReviews > 0
      ? Number((reviewsData.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviewsData) {
    if (r.rating in ratingCounts) {
      ratingCounts[r.rating]++;
    }
  }

  const reviewStats: ReviewStats = {
    totalReviews,
    averageRating,
    ratingCounts,
  };

  // Check viewer review eligibility
  const session = await getCustomerSession();
  let isEligible = false;
  let eligibleOrderId: string | null = null;

  if (session) {
    const eligibleOrder = await prisma.order.findFirst({
      where: {
        customerPhone: session.phone,
        fulfilmentStatus: "delivered",
        paymentStatus: { notIn: ["cancelled", "failed"] },
        items: { some: { productId: product.id } },
        reviews: { none: { productId: product.id } },
      },
      select: { id: true },
    });

    if (eligibleOrder) {
      isEligible = true;
      eligibleOrderId = eligibleOrder.id;
    }
  }

  // Related products
  let related: {
    id: string;
    name: string;
    slug: string;
    basePrice: number | null;
    comparePrice?: number | null;
    status: string;
    isSample: boolean;
    images: { id: string; url: string; altText: string | null; isCover: boolean }[];
    category: { name: string; slug: string } | null;
    variants: { id: string; name: string; price: number; stock: number }[];
  }[] = [];

  try {
    related = await prisma.product.findMany({
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
    }) as unknown as typeof related;
  } catch (error) {
    console.error("Failed to load related products:", error);
  }

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
        <ProductDetailClient
          product={product}
          reviewStats={{ totalReviews, averageRating }}
        />

        {/* Patron Reviews & Reflections Section */}
        <ProductReviewsSection
          productId={product.id}
          productName={product.name}
          initialReviews={reviewsData as ReviewItem[]}
          initialStats={reviewStats}
          viewerEligibility={{
            isEligible,
            eligibleOrderId,
            customerName: session?.name || null,
          }}
        />

        {/* Related Designs */}
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
