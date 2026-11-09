"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroBanner() {
  return (
    <div className="w-full bg-[#FAF8F4]">
      {/* ── Main Hero Frame ── */}
      <section className="relative w-full overflow-hidden bg-[#FAF8F4]">
        {/* Desktop Composition (16:9 / Panoramic) */}
        <div className="hidden sm:block relative w-full h-[460px] md:h-[500px] lg:h-[540px]">
          <Image
            src="/images/hero-desktop.jpg"
            alt="MAHIRAANI Handcrafted Indian Jewellery"
            fill
            priority
            quality={92}
            className="object-cover object-center"
            sizes="100vw"
          />

          {/* Gentle warm central light wash for supreme typography clarity */}
          <div className="absolute inset-0 bg-radial from-[#FAF8F4]/75 via-[#FAF8F4]/30 to-transparent pointer-events-none" />

          {/* Desktop Centered Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
            {/* Bilingual Brand Mark */}
            <div className="flex items-center justify-center drop-shadow-xs">
              <span className="font-['Rozha_One',serif] text-4xl md:text-5xl lg:text-6xl text-[#6B2737] tracking-wide font-normal">
                महिराणी
              </span>
              <span className="text-[#B8922A] font-light text-3xl md:text-4xl lg:text-5xl mx-3 md:mx-4 opacity-75">
                |
              </span>
              <span className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-[0.24em] text-[#6B2737] font-light uppercase">
                MAHIRAANI
              </span>
            </div>

            {/* Sub-heading in spaced antique gold */}
            <p className="mt-3 md:mt-4 text-[11px] md:text-xs lg:text-[13px] tracking-[0.38em] text-[#9E7728] uppercase font-medium">
              Handcrafted Indian Jewellery
            </p>

            <p className="mt-2 text-xs md:text-sm text-stone-600 font-light max-w-md mx-auto">
              Curated gold-based and oxidised designs with durable anti-tarnish finish
            </p>

            {/* Chic Boutique Pill CTA Button */}
            <div className="mt-7 md:mt-8 flex items-center gap-4">
              <Link
                href="/collections/all"
                className="group inline-flex items-center gap-3.5 pl-6 pr-2 py-2 bg-[#FAF8F4]/95 hover:bg-white border border-[#D8CCB8] hover:border-[#B8922A] rounded-full shadow-sm hover:shadow-md transition-all text-xs uppercase tracking-[0.22em] font-medium text-[#6B2737] backdrop-blur-xs"
              >
                <span>Explore Collection</span>
                <span className="w-8 h-8 rounded-full bg-[#6B2737] text-white flex items-center justify-center group-hover:scale-105 group-hover:bg-[#521c29] transition-all shadow-xs">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Composition (4:3 Tailored Frame) */}
        <div className="sm:hidden relative w-full h-[400px]">
          <Image
            src="/images/hero-mobile.jpg"
            alt="MAHIRAANI Handcrafted Indian Jewellery"
            fill
            priority
            quality={92}
            className="object-cover object-center"
            sizes="100vw"
          />

          {/* Soft central wash */}
          <div className="absolute inset-0 bg-radial from-[#FAF8F4]/80 via-[#FAF8F4]/40 to-transparent pointer-events-none" />

          {/* Mobile Centered Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
            {/* Bilingual Brand Mark */}
            <div className="flex items-center justify-center mb-1">
              <span className="font-['Rozha_One',serif] text-3xl text-[#6B2737]">
                महिराणी
              </span>
              <span className="text-[#B8922A] font-light text-2xl mx-2.5 opacity-75">
                |
              </span>
              <span className="font-serif text-2xl tracking-[0.2em] text-[#6B2737] font-light uppercase">
                MAHIRAANI
              </span>
            </div>

            <p className="mt-2 text-[10px] tracking-[0.32em] text-[#9E7728] uppercase font-semibold">
              Handcrafted Indian Jewellery
            </p>

            <p className="mt-2 text-xs text-stone-600 font-light max-w-xs px-2">
              Anti-tarnish gold-based & oxidised jewellery
            </p>

            {/* Mobile Pill Button */}
            <div className="mt-6 flex flex-col items-center gap-2.5 w-full max-w-xs px-4">
              <Link
                href="/collections/all"
                className="group w-full inline-flex items-center justify-between pl-6 pr-2 py-2 bg-[#FAF8F4]/95 border border-[#D8CCB8] rounded-full shadow-sm text-xs uppercase tracking-[0.2em] font-medium text-[#6B2737]"
              >
                <span>Explore Collection</span>
                <span className="w-7 h-7 rounded-full bg-[#6B2737] text-white flex items-center justify-center shadow-xs">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ornamental Indian Filigree Divider (Mahiraani Lotus Signature Motif) ── */}
      <div className="w-full py-6 flex items-center justify-center gap-3 text-[#B8922A]/70 select-none">
        <div className="h-[1px] w-12 sm:w-28 bg-gradient-to-r from-transparent to-[#B8922A]/60" />
        <span className="text-[10px] tracking-widest text-[#B8922A]">◇ ─ ◇ ─ ◇</span>
        
        {/* Lotus Icon */}
        <div className="p-1 rounded-full border border-[#B8922A]/40 bg-white shadow-xs">
          <svg className="w-5 h-5 text-[#6B2737]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3C12 3 9 8 9 12C9 14.5 10.5 16 12 16C13.5 16 15 14.5 15 12C15 8 12 3 12 3Z" fill="#F8EDF0" stroke="#6B2737" />
            <path d="M12 7C9.5 9 6 11.5 6 14C6 16 7.5 17 9.5 17C11 17 12 16 12 16C12 16 13 17 14.5 17C16.5 17 18 16 18 14C18 11.5 14.5 9 12 7Z" fill="#FAF5F6" stroke="#6B2737" />
            <circle cx="12" cy="12" r="1" fill="#B8922A" />
          </svg>
        </div>

        <span className="text-[10px] tracking-widest text-[#B8922A]">◇ ─ ◇ ─ ◇</span>
        <div className="h-[1px] w-12 sm:w-28 bg-gradient-to-l from-transparent to-[#B8922A]/60" />
      </div>
    </div>
  );
}
