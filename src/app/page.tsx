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
import { Sparkles, ArrowRight, ShieldCheck, Heart, Star, Award, Clock } from "lucide-react";


export default async function HomePage() {
  // Fetch published products from the database
  const products = await prisma.product.findMany({
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
  });

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
                <span>Jaipur Bestsellers</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">
                Royal Jewels of the Season
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
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-300 p-8">
              <Sparkles className="w-8 h-8 text-[#B8922A] mx-auto mb-3" />
              <h3 className="font-serif text-2xl text-stone-800 mb-2">
                New Royal Collection Being Curated
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto mb-6">
                Our master karigars are currently crafting heirloom pieces. Log in to the Admin Dashboard to publish products.
              </p>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#6B2737] text-white rounded-full text-xs uppercase tracking-wider font-medium hover:bg-[#521c29]"
              >
                <span>Upload First Product in Admin</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* ── Brand Story / The Mahiraani Karigari ── */}
        <section id="our-craft" className="py-20 bg-[#F4EFEB] border-y border-stone-200 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F4] border border-[#B8922A]/30 text-xs text-[#B8922A] font-semibold uppercase tracking-widest">
                  The Mahiraani Legacy
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl text-stone-900 leading-tight">
                  Crafted by Master Artisans in the Heart of Jaipur
                </h2>
                <p className="text-sm sm:text-base text-stone-600 font-light leading-relaxed">
                  Every Mahiraani piece is shaped by generational karigars whose ancestors adorned the royal courts of Rajputana. Using ethically sourced semi-precious gems, hand-set uncut Polki, and resilient 22K gold micron layering, our heirlooms bridge classical royal opulence with lightweight comfort for today&apos;s festivities.
                </p>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="border-l-2 border-[#B8922A] pl-4">
                    <span className="block font-serif text-2xl text-stone-900 font-semibold">100%</span>
                    <span className="text-xs text-stone-500 uppercase tracking-wider">Hallmarked & Certified</span>
                  </div>
                  <div className="border-l-2 border-[#6B2737] pl-4">
                    <span className="block font-serif text-2xl text-stone-900 font-semibold">48h</span>
                    <span className="text-xs text-stone-500 uppercase tracking-wider">Insured Express Dispatch</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="https://wa.me/919876543210?text=Hello%20Mahiraani%2C%20tell%20me%20more%20about%20custom%20bridal%20jewellery."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#6B2737] hover:underline"
                  >
                    <span>Enquire About Bespoke Bridal Orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Visual Showcase Card */}
              <div className="relative">
                <div className="relative aspect-4/3 w-full bg-gradient-to-tr from-[#3D1420] to-[#1C1917] rounded-3xl overflow-hidden shadow-2xl p-8 flex flex-col justify-between text-[#FAF8F4] border border-[#B8922A]/30">
                  <div className="flex items-center justify-between">
                    <span className="font-serif tracking-widest uppercase text-sm text-[#D4AB48]">Mahiraani Atelier</span>
                    <Award className="w-6 h-6 text-[#D4AB48]" />
                  </div>

                  <div className="my-auto py-6">
                    <p className="font-serif text-2xl sm:text-3xl italic text-[#FAF8F4] leading-snug">
                      &ldquo;Jewellery that does not just ornament, but crowns your heritage.&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20 text-xs text-stone-300">
                    <span>Authentic Rajasthani Craftsmanship</span>
                    <span className="text-[#D4AB48]">Jaipur, India</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials: Voices of Our Queens ── */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-[#B8922A] font-semibold mb-2">
              Loved by Over 10,000+ Women
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">
              Words From Our Queens
            </h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#B8922A] text-[#B8922A]" />
              ))}
              <span className="text-xs text-stone-500 font-medium ml-2">4.9 / 5 Overall Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-[#B8922A] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-700 font-light leading-relaxed italic">
                  &ldquo;I ordered the earrings for my sister’s sangeet and was blown away! The weight, luster, and packaging felt like it arrived straight from an imperial royal palace.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-stone-900">Rhea Singhania</p>
                  <p className="text-stone-400 text-[11px]">Mumbai • Verified Buyer</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-[#B8922A] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-700 font-light leading-relaxed italic">
                  &ldquo;The WhatsApp team was so helpful in giving me video consultations to pair the choker with my lehenga colour. Dispatched within 24 hours to Bengaluru!&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-stone-900">Aparna Nair</p>
                  <p className="text-stone-400 text-[11px]">Bengaluru • Verified Buyer</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-[#B8922A] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-700 font-light leading-relaxed italic">
                  &ldquo;Best online jewellery buying experience in India. The finish does not tarnish, and the complimentary velvet keepsake box is truly heirloom grade.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-stone-900">Kavita Verma</p>
                  <p className="text-stone-400 text-[11px]">New Delhi • Verified Buyer</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
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
