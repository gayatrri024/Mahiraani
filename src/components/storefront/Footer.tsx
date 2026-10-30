"use client";

import Link from "next/link";
import { MessageCircle, Mail, Phone, MapPin, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1C1417] text-[#FAF8F4] pt-16 pb-24 lg:pb-16 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <span className="font-serif text-2xl tracking-[0.22em] text-[#FAF8F4] uppercase">
                MAHIRAANI
              </span>
              <span className="block text-[9px] tracking-[0.35em] text-[#D4AB48] uppercase font-medium mt-0.5">
                Royal Heirlooms • Jaipur
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm font-light leading-relaxed">
              Mahiraani curates royal Indian jewellery that harmonises imperial Mughal & Rajasthani karigari with contemporary elegance. Handcrafted with certified hallmarks and insured Pan-India delivery.
            </p>

            <div className="pt-2 flex flex-col space-y-2 text-xs text-stone-300">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#D4AB48] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp Concierge: +91 98765 43210</span>
              </a>
              <div className="flex items-center gap-2 text-stone-400">
                <Mail className="w-4 h-4 text-stone-500" />
                <span>care@mahiraani.com</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <MapPin className="w-4 h-4 text-stone-500" />
                <span>Johari Bazaar, Jaipur, Rajasthan, India</span>
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
                  Earrings & Chandbalis
                </Link>
              </li>
              <li>
                <Link href="/collections/necklaces" className="hover:text-white transition-colors">
                  Chokers & Polki Sets
                </Link>
              </li>
              <li>
                <Link href="/collections/bangles" className="hover:text-white transition-colors">
                  Kadas & Bangles
                </Link>
              </li>
              <li>
                <Link href="/collections/festive-edit" className="hover:text-white transition-colors">
                  Festive & Bridal Edit
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
                <a href="#care" className="hover:text-white transition-colors">
                  Jewellery Care Guide
                </a>
              </li>
              <li>
                <a href="#shipping" className="hover:text-white transition-colors">
                  Shipping & Pan-India Delivery
                </a>
              </li>
              <li>
                <a href="#returns" className="hover:text-white transition-colors">
                  7-Day Easy Exchange Policy
                </a>
              </li>
              <li>
                <a href="#hallmark" className="hover:text-white transition-colors">
                  Authenticity & Hallmarking
                </a>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#D4AB48] transition-colors">
                  Store Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / Royal Club */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D4AB48] font-semibold">
              The Royal Club
            </h4>
            <p className="text-xs text-stone-400 font-light">
              Receive private invitations to bridal launches, styling tips, and <strong>10% off</strong> your first order.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Welcome to the Mahiraani Royal Club! Use code ROYAL10 at checkout.");
              }}
              className="space-y-2"
            >
              <input
                type="email"
                required
                placeholder="Enter your email or WhatsApp number"
                className="w-full text-xs p-2.5 bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-hidden focus:border-[#D4AB48]"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#6B2737] hover:bg-[#531d2a] text-white rounded-lg text-xs uppercase tracking-wider font-medium transition-colors"
              >
                Join Privileged Circle
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Mahiraani Heirlooms Pvt. Ltd. All rights reserved.</p>

          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>UPI</span>
            <span>•</span>
            <span>Google Pay</span>
            <span>•</span>
            <span>PhonePe</span>
            <span>•</span>
            <span>RuPay</span>
            <span>•</span>
            <span>Credit / Debit Cards</span>
            <span>•</span>
            <span>Cash On Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
