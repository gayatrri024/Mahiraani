// src/app/not-found.tsx – Branded 404 Page for MAHIRAANI

import Link from "next/link";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import Logo from "@/components/brand/Logo";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-white rounded-3xl border border-stone-200/80 shadow-md max-w-lg w-full p-8 sm:p-12 space-y-6">
          <div className="flex justify-center">
            <Logo size="lg" href="/" />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-[#B8922A] font-semibold">
              404 • Silhouette Not Found
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#6B2737] font-normal">
              Lost in the Vault
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
              The page or jewellery piece you are seeking might have been curated under a different collection or moved to our design archives.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/collections/all"
              className="py-3 px-6 bg-[#6B2737] hover:bg-[#521c29] text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Explore All Jewellery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="py-3 px-6 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs uppercase tracking-wider font-medium transition-colors"
            >
              Return Home
            </Link>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-center gap-4 text-xs text-stone-500">
            <Link href="/collections/earrings" className="hover:text-[#6B2737]">
              Earrings
            </Link>
            <span>•</span>
            <Link href="/collections/necklaces" className="hover:text-[#6B2737]">
              Necklaces
            </Link>
            <span>•</span>
            <Link href="/collections/festive-edit" className="hover:text-[#6B2737]">
              Festive Edit
            </Link>
          </div>
        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
