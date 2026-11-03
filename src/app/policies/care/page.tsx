// src/app/policies/care/page.tsx – Jewellery Care & Anti-Tarnish Guide

import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import Link from "next/link";
import { ChevronRight, Sparkles, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Jewellery Care & Anti-Tarnish Guide | Mahiraani",
  description: "Learn how to care for your Mahiraani anti-tarnish everyday fashion jewellery.",
};

export default function CarePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-8">
          <Link href="/" className="hover:text-stone-900">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-medium">Jewellery Care</span>
        </nav>

        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-xs space-y-8">
          <div className="border-b border-stone-200 pb-6">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#9E7728] font-semibold">
              Everyday Wear Assurance
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#6B2737] mt-1">
              Jewellery Care & Anti-Tarnish Guide
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-light mt-2">
              Our pieces are crafted as everyday fashion jewellery with durable anti-tarnish protective coatings (not real gold; no hallmarking required).
            </p>
          </div>

          <div className="space-y-6 text-sm text-stone-700 leading-relaxed">
            <div className="p-5 bg-[#FAF8F4] rounded-2xl border border-stone-200/80 space-y-3">
              <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B8922A]" />
                <span>Simple Everyday Care Tips</span>
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600 pl-4 list-disc">
                <li>Put your jewellery on last, after applying perfumes, hairsprays, lotions, and makeup.</li>
                <li>Avoid wearing jewellery while swimming, bathing, or doing heavy physical workouts.</li>
                <li>After wear, gently wipe your pieces with a clean, dry microfibre cloth to remove oils and moisture.</li>
                <li>Store your jewellery separately in an airtight pouch or box to prevent scratches and exposure to air.</li>
              </ul>
            </div>

            <div className="p-5 bg-[#FBF7EE] rounded-2xl border border-[#EADBBD] space-y-2 text-xs sm:text-sm text-stone-700">
              <h3 className="font-semibold text-[#8C6D1F] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B8922A]" />
                <span>Anti-Tarnish Everyday Jewellery</span>
              </h3>
              <p>
                Mahiraani offers high-quality everyday fashion jewellery designed to be skin-friendly and long-lasting. While our pieces resist tarnishing during normal daily use, following our care tips will keep them looking radiant for years to come.
              </p>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-stone-200">
            <p className="text-xs text-stone-500 italic">
              Thank you for choosing Mahiraani and supporting our little dream. 💗
            </p>
          </div>
        </div>
      </main>

      <CartDrawer />
      <MobileStickyBar />
      <Footer />
    </div>
  );
}
