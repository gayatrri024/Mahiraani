// src/app/page.tsx – Mahiraani Luxury Jewellery Homepage

import { prisma } from "@/lib/prisma";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import HeroBanner from "@/components/storefront/HeroBanner";
import CategoryBubbles from "@/components/storefront/CategoryBubbles";
import ProductCard from "@/components/storefront/ProductCard";
import InstagramFeed from "@/components/storefront/InstagramFeed";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Award } from "lucide-react";

export const instant = false;


export default async function HomePage() {
  // Fetch published products from the database
  let products: {
    id: string;
    name: string;
    slug: string;
    basePrice: number | null;
    comparePrice?: number | null;
    status: string;
    isSample: boolean;
    shortDescription?: string | null;
    images: { id: string; url: string; altText: string | null; isCover: boolean }[];
    category: { name: string; slug: string } | null;
    variants: { id: string; name: string; price: number; stock: number }[];
  }[] = [];

  try {
    products = await prisma.product.findMany({
      where: {
        status: "published",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        category: {
          select: { name: true, slug: true },
        },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    }) as unknown as typeof products;
  } catch (error) {
    console.error("Failed to fetch published products for HomePage:", error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900 selection:bg-[#6B2737] selection:text-white">
      {/* Top Banner */}
      <AnnouncementBar />

      {/* Main Regal Navigation */}
      <Header />

      <main className="flex-1">
        {/* Editorial Hero */}
        <HeroBanner />

        {/* Circular Category Story Highlights */}
        <CategoryBubbles />

        {/* ── Featured Jewellery Collection ── */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-stone-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#B8922A] font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curated Bestsellers</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">
                Trending Pieces of the Season
              </h2>
            </div>
            <Link
              href="/collections/all"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#6B2737] hover:text-stone-950 font-semibold group transition-colors"
            >
              <span>View Full Catalogue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 max-w-xl mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#FAF0F2] text-[#6B2737] flex items-center justify-center mx-auto mb-4 border border-[#F0D5DC]">
                <Sparkles className="w-6 h-6 text-[#B8922A]" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E7728] font-semibold">
                Curated Jewellery
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 mt-1 mb-2 font-normal">
                New Designs Arriving Soon
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-6 leading-relaxed font-light">
                Our master karigars are currently handcrafting our upcoming festive and everyday collection. Follow our journey on Instagram for first looks, or connect with our Pune studio concierge.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/collections/all"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#6B2737] text-white rounded-full text-xs uppercase tracking-wider font-medium hover:bg-[#521c29] transition-colors shadow-xs"
                >
                  <span>Explore Catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="https://wa.me/919146686816?text=Hello%20MAHIRAANI%2C%20I%20would%20like%20to%20enquire%20about%20upcoming%20jewellery%20designs."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#25D366] text-white rounded-full text-xs uppercase tracking-wider font-semibold hover:bg-[#20ba59] transition-colors shadow-xs"
                >
                  <span>WhatsApp Concierge</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* ── Brand Story / Craftsmanship ── */}
        <section id="our-craft" className="py-20 bg-[#F4EFEB] border-y border-stone-200 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F4] border border-[#B8922A]/30 text-xs text-[#B8922A] font-semibold uppercase tracking-widest">
                  About MAHIRAANI
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl text-stone-900 leading-tight">
                  Handcrafted Jewellery Sourced Across India
                </h2>
                <p className="text-sm sm:text-base text-stone-600 font-light leading-relaxed">
                  Every MAHIRAANI piece is thoughtfully sourced from skilled artisans across different regions of India. Crafted with durable anti-tarnish finishes and skin-friendly materials, our jewellery brings everyday elegance straight to your wardrobe.
                </p>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="border-l-2 border-[#B8922A] pl-4">
                    <span className="block font-serif text-2xl text-stone-900 font-semibold">Anti-Tarnish</span>
                    <span className="text-xs text-stone-500 uppercase tracking-wider">Everyday Wear Quality</span>
                  </div>
                  <div className="border-l-2 border-[#6B2737] pl-4">
                    <span className="block font-serif text-2xl text-stone-900 font-semibold">24-48h</span>
                    <span className="text-xs text-stone-500 uppercase tracking-wider">Express Dispatch Across India</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="https://wa.me/919146686816?text=Hello%20MAHIRAANI%2C%20I%20would%20like%20to%20enquire%20about%20jewellery."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#6B2737] hover:underline"
                  >
                    <span>Enquire on WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Visual Showcase Card */}
              <div className="relative">
                <div className="relative aspect-4/3 w-full bg-gradient-to-tr from-[#3D1420] to-[#1C1917] rounded-3xl overflow-hidden shadow-2xl p-8 flex flex-col justify-between text-[#FAF8F4] border border-[#B8922A]/30">
                  <div className="flex items-center justify-between">
                    <span className="font-serif tracking-widest uppercase text-sm text-[#D4AB48]">MAHIRAANI</span>
                    <Award className="w-6 h-6 text-[#D4AB48]" />
                  </div>

                  <div className="my-auto py-6">
                    <p className="font-serif text-2xl sm:text-3xl italic text-[#FAF8F4] leading-snug">
                      &ldquo;Jewellery designed for timeless everyday elegance and celebratory grace.&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20 text-xs text-stone-300">
                    <span>Artisanal Craftsmanship Sourced Across India</span>
                    <span className="text-[#D4AB48]">Pune, Maharashtra, India</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Brand Craft & Quality Pillars ── */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-200/60">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-[#B8922A] font-semibold mb-2">
              The MAHIRAANI Standard
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">
              Artisanal Integrity &amp; Enduring Elegance
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-3 font-light leading-relaxed">
              Every creation is thoughtfully curated from trusted regional jewellery craft clusters across India, blending royal heritage aesthetics with modern anti-tarnish wearability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[#B8922A] mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  Multi-Region Indian Curation
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                  We do not rely on a single manufacturing origin. Our collections bring together skilled craftsmen, polki artisans, and karigars from diverse heritage jewellery regions across India.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8922A]" />
                <span>Hand-finished inspection</span>
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#6B2737] mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  Protective Anti-Tarnish Finish
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                  Crafted to withstand everyday occasions and tropical climates. Sealed with hypoallergenic e-coating to preserve brilliant gold and antique finishes without tarnishing easily.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B2737]" />
                <span>Hypoallergenic &amp; skin-friendly</span>
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[#B8922A] mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  Direct Concierge in Pune
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                  Based in Pune, Maharashtra. Our personal styling team offers WhatsApp video consultations, styling suggestions, and direct priority tracking from reservation to delivery.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8922A]" />
                <span>Pune Studio • Direct Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Instagram Social Proof ── */}
        <InstagramFeed />
      </main>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Mobile Sticky Action Bar */}
      <MobileStickyBar />

      {/* Footer */}
      <Footer />
    </div>
  );
}
