"use client";

import Link from "next/link";
import { Sparkles, MessageCircle } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <aside aria-label="Offers and announcements" className="bg-[#4A1525] text-[#FAF8F4] text-xs py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] sm:text-xs tracking-wider uppercase">
        <div className="hidden md:flex items-center gap-1.5 opacity-90">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AB48]" />
          <span>Handcrafted Royal Heirlooms &nbsp;|&nbsp; 100% Certified Purity</span>
        </div>

        <div className="flex-1 text-center font-medium tracking-wide">
          <span>✨ Festive Edit: Free Express Shipping over ₹999 + Complimentary Keepsake Velvet Box</span>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="https://wa.me/919876543210?text=Hello%20Mahiraani%20Jewellery%2C%20I%20would%20like%20assistance%20with%20a%20piece."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#D4AB48] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Stylist Assist</span>
          </a>
          <span className="opacity-40">|</span>
          <Link href="/admin" className="hover:text-[#D4AB48] transition-colors opacity-75">
            Admin Portal
          </Link>
        </div>
      </div>
    </aside>
  );
}
