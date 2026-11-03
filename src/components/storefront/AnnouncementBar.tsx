"use client";

import { Sparkles, MessageCircle } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <aside aria-label="Offers and announcements" className="bg-[#4A1525] text-[#FAF8F4] text-xs py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] sm:text-xs tracking-wider">
        <div className="hidden md:flex items-center gap-1.5 opacity-90 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AB48]" />
          <span>Everyday Anti-Tarnish Jewellery &nbsp;|&nbsp; Premium Quality</span>
        </div>

        <div className="flex-1 text-center font-normal tracking-wide text-[#FAF8F4]">
          <span>• Free shipping on orders above ₹900 • No Returns or Exchange • Happy Shopping! •</span>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="https://wa.me/919146686816?text=Hello%20MAHIRAANI%2C%20I%20would%20like%20assistance%20with%20a%20piece."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#D4AB48] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
