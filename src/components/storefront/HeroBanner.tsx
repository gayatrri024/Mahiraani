"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, MessageCircle, ArrowRight, ShieldCheck, Truck, RotateCcw, Award } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-[#FAF8F4] border-b border-stone-200/80">
      {/* ── Background Artwork ── */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/images/hero-banner.jpg"
          alt="Mahiraani Royal Indian Pichwai Heirlooms Banner"
          fill
          priority
          quality={90}
          className="object-cover object-[78%_center] sm:object-[75%_center] lg:object-right"
          sizes="100vw"
        />

        {/* Desktop Gradient: Soft ivory wash on the left to ensure headline clarity */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#FAF8F4] via-[#FAF8F4]/85 via-50% to-transparent" />

        {/* Tablet Gradient */}
        <div className="hidden sm:block lg:hidden absolute inset-0 bg-gradient-to-r from-[#FAF8F4]/95 via-[#FAF8F4]/85 to-transparent" />

        {/* Mobile Gradient: Soft overlay keeping top/center legible while letting elephants & lotus peek through */}
        <div className="sm:hidden absolute inset-0 bg-gradient-to-b from-[#FAF8F4]/95 via-[#FAF8F4]/80 to-[#FAF8F4]/70" />
      </div>

      {/* ── Content Container ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-xl lg:max-w-2xl text-left">
          {/* Subtle Champagne Gold Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F4]/90 border border-[#B8922A]/40 backdrop-blur-md mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#B8922A]" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#8C6D1F] font-semibold">
              Heritage Pichwai & Jaipur Artistry
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-stone-900 font-normal tracking-tight leading-[1.12]">
            Royal Indian Heirlooms <br />
            <span className="italic font-light text-[#6B2737]">
              For The Modern Queen
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base text-stone-700 font-light leading-relaxed max-w-lg">
            Adorned with uncut Polki, delicate lotus motifs, and 22K gold micron dipping. Shaped by generational Jaipur karigars to bring calm, minimal imperial grace to your celebrations.
          </p>

          {/* CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <Link
              href="/collections/all"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#6B2737] hover:bg-[#521c29] text-white rounded-full text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/919876543210?text=Hello%20Mahiraani%20Jewellery%2C%20I%20would%20like%20to%20view%20your%20latest%20jewellery%20catalogue."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-[#FAF8F4]/80 hover:bg-[#FAF8F4] text-stone-900 rounded-full text-xs uppercase tracking-[0.2em] font-medium border border-[#B8922A]/40 backdrop-blur-sm transition-all shadow-xs hover:border-[#B8922A]"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Stylist on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* ── Trust Pillars Bar ── */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-stone-300/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shrink-0 border border-stone-200 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#B8922A]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-900 uppercase tracking-wider">BIS Hallmarked</p>
              <p className="text-[11px] text-stone-500">100% Certified Purity</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shrink-0 border border-stone-200 shadow-xs">
              <Truck className="w-5 h-5 text-[#B8922A]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Insured Express Shipping</p>
              <p className="text-[11px] text-stone-500">Free Pan-India above ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shrink-0 border border-stone-200 shadow-xs">
              <Award className="w-5 h-5 text-[#B8922A]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Artisan Crafted</p>
              <p className="text-[11px] text-stone-500">Rajasthani Court Karigari</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shrink-0 border border-stone-200 shadow-xs">
              <RotateCcw className="w-5 h-5 text-[#B8922A]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-900 uppercase tracking-wider">7-Day Easy Exchange</p>
              <p className="text-[11px] text-stone-500">Hassle-free Replacement</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
