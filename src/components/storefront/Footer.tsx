"use client";

import Link from "next/link";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import Logo from "@/components/brand/Logo";

export default function Footer() {
  return (
    <footer className="bg-[#1C1417] text-[#FAF8F4] pt-16 pb-24 lg:pb-16 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" variant="light" tagline="Handcrafted Indian Jewellery" />
            <p className="text-xs text-stone-400 max-w-sm font-light leading-relaxed">
              Curated jewellery sourced from skilled artisans across India. Thoughtfully designed with durable anti-tarnish finishes, skin-friendly materials, and pan-India delivery.
            </p>

            <div className="pt-2 flex flex-col space-y-2 text-xs text-stone-300">
              <a
                href="https://wa.me/919146686816"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#D4AB48] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp Concierge: +91 91466 86816</span>
              </a>
              <div className="flex items-center gap-2 text-stone-400">
                <Mail className="w-4 h-4 text-stone-500" />
                <span>care@mahiraani.com</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <MapPin className="w-4 h-4 text-stone-500" />
                <span>Pune, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AB48] font-semibold">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <Link href="/collections/all" className="hover:text-white transition-colors">
                  Shop All Jewellery
                </Link>
              </li>
              <li>
                <Link href="/collections/earrings" className="hover:text-white transition-colors">
                  Earrings & Jhumkas
                </Link>
              </li>
              <li>
                <Link href="/collections/necklaces" className="hover:text-white transition-colors">
                  Necklaces & Chokers
                </Link>
              </li>
              <li>
                <Link href="/collections/bangles" className="hover:text-white transition-colors">
                  Bangles & Kadas
                </Link>
              </li>
              <li>
                <Link href="/collections/festive-edit" className="hover:text-white transition-colors">
                  Festive Edit
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AB48] font-semibold">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors text-[#D4AB48] font-medium">
                  Track My Order &amp; Purchases
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About MAHIRAANI
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Concierge
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-white transition-colors">
                  Returns & Cancellations
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/care" className="hover:text-white transition-colors">
                  Jewellery Care & Anti-Tarnish
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex flex-wrap items-center gap-4">
            <p>© 2026 MAHIRAANI. All rights reserved.</p>
            <Link href="/policies/privacy" className="hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/policies/terms" className="hover:text-stone-300 transition-colors">
              Terms of Service
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-stone-400">
            <span>UPI</span>
            <span>•</span>
            <span>Google Pay</span>
            <span>•</span>
            <span>PhonePe</span>
            <span>•</span>
            <span>RuPay</span>
            <span>•</span>
            <span>Cards</span>
            <span>•</span>
            <span>Net Banking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
