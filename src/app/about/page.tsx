// src/app/about/page.tsx – About MAHIRAANI

import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import Link from "next/link";
import { ChevronRight, Sparkles, Award, ShieldCheck, Heart, MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | MAHIRAANI – Handcrafted Indian Jewellery",
  description:
    "Discover the story of MAHIRAANI. Rooted in Pune, Maharashtra, we curate handcrafted everyday & festive jewellery from skilled artisans across India.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-8">
          <Link href="/" className="hover:text-stone-900">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-medium">About MAHIRAANI</span>
        </nav>

        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-14 shadow-xs space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#B8922A] font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Born in Pune • Sourced Across India</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#6B2737] font-normal">
              The MAHIRAANI Story
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
              Timeless Indian jewellery crafted for the modern queen who celebrates both her roots and her individuality.
            </p>
          </div>

          {/* Core Story */}
          <div className="space-y-6 text-sm text-stone-700 leading-relaxed font-light">
            <p className="text-base font-normal text-stone-900 leading-relaxed">
              <strong>MAHIRAANI</strong> was founded with a singular conviction: that majestic Indian jewellery should not remain locked in bank lockers waiting only for wedding seasons. It should be cherished, styled, and worn with effortless confidence every single day.
            </p>

            <p>
              Based in <strong>Pune, Maharashtra</strong>, we are an independent boutique jewellery house. We do not manufacture in a single factory, nor do we claim heritage lineage from centuries past. Instead, our strength lies in genuine, thoughtful curation. We collaborate directly with master karigars, polki craftsmen, and artisanal metal smiths across diverse regional craft clusters in India.
            </p>

            <p>
              From the delicate filigree of traditional bridal chokers to lightweight anti-tarnish chandbalis and daily wristwear, every silhouette in our catalogue is chosen for its sculptural balance, weight comfort, and radiant finishing.
            </p>
          </div>

          {/* Our 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-stone-100">
            <div className="p-6 bg-[#FAF8F4] rounded-2xl border border-stone-200/70 space-y-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#B8922A] border border-stone-200 shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base text-stone-900 font-semibold">
                Curated Craftsmanship
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Handpicked designs sourced responsibly from artisanal workshops across India, highlighting regional metal traditions.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F4] rounded-2xl border border-stone-200/70 space-y-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#6B2737] border border-stone-200 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base text-stone-900 font-semibold">
                Anti-Tarnish Longevity
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Finished with skin-friendly, protective e-coating to resist tarnishing, humidity, and wear so your pieces stay brilliant.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F4] rounded-2xl border border-stone-200/70 space-y-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#B8922A] border border-stone-200 shadow-xs">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base text-stone-900 font-semibold">
                Pune Studio Concierge
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Personalized care, video previews, and styling assistance directly from our team in Pune, Maharashtra.
              </p>
            </div>
          </div>

          {/* Pune Studio Contact Banner */}
          <div className="p-8 bg-gradient-to-r from-[#FFFDF9] via-[#FAF8F4] to-[#F5EFE6] rounded-2xl border border-[#E9DFCE] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#9E7728] font-semibold uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#6B2737]" />
                <span>Pune Studio • Maharashtra</span>
              </div>
              <h3 className="font-serif text-xl text-[#6B2737]">
                Connect with our Stylist
              </h3>
              <p className="text-xs text-stone-600">
                Have questions about sizing, bridal styling, or order status? We are always a message away.
              </p>
            </div>

            <a
              href="https://wa.me/919146686816?text=Hello%20MAHIRAANI%20team%2C%20I%20would%20like%20to%20learn%20more%20about%20your%20pieces."
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm shrink-0 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Stylist</span>
            </a>
          </div>
        </div>
      </main>

      <CartDrawer />
      <MobileStickyBar />
      <Footer />
    </div>
  );
}

