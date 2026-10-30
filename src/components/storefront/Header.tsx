"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Menu, X, MessageCircle, Heart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { openCart, totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { label: "All Jewellery", href: "/collections/all" },
    { label: "Earrings", href: "/collections/earrings" },
    { label: "Necklaces", href: "/collections/necklaces" },
    { label: "Bangles & Kadas", href: "/collections/bangles" },
    { label: "Festive Edit", href: "/collections/festive-edit" },
    { label: "Our Craft", href: "#our-craft" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-700 hover:text-stone-900 rounded-md"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-stone-700 hover:text-stone-900 ml-1"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Left Nav */}
            <nav className="hidden lg:flex items-center gap-7 text-xs tracking-widest uppercase font-medium text-stone-700">
              <Link href="/collections/all" className="hover:text-[#6B2737] transition-colors">
                Shop All
              </Link>
              <Link href="/collections/earrings" className="hover:text-[#6B2737] transition-colors">
                Earrings
              </Link>
              <Link href="/collections/necklaces" className="hover:text-[#6B2737] transition-colors">
                Necklaces
              </Link>
              <Link href="/collections/festive-edit" className="hover:text-[#6B2737] transition-colors text-[#6B2737] font-semibold">
                Festive Edit
              </Link>
            </nav>

            {/* Center Logo */}
            <div className="flex-1 lg:flex-initial text-center">
              <Link href="/" className="inline-block group py-2">
                <span className="block font-serif text-2xl sm:text-3xl tracking-[0.22em] text-stone-900 font-normal uppercase group-hover:text-[#6B2737] transition-colors">
                  MAHIRAANI
                </span>
                <span className="block text-[9px] tracking-[0.35em] text-[#B8922A] uppercase font-medium -mt-1">
                  Royal Heirlooms
                </span>
              </Link>
            </div>

            {/* Desktop Right Nav & Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden lg:flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 p-2"
                aria-label="Search catalogue"
              >
                <Search className="w-4 h-4" />
                <span className="hidden xl:inline text-[11px] uppercase tracking-wider">Search</span>
              </button>

              <a
                href="https://wa.me/919876543210?text=Hello%20Mahiraani%20Jewellery%2C%20I%20have%20an%20enquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-stone-700 hover:text-stone-950 p-2"
                title="Chat with Stylist on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
              </a>

              <Link
                href="/admin"
                className="text-stone-600 hover:text-[#6B2737] p-2"
                title="Admin Dashboard"
              >
                <User className="w-4 h-4" />
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={openCart}
                className="relative p-2 text-stone-800 hover:text-[#6B2737] transition-colors flex items-center gap-2"
                aria-label="Open cart drawer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase font-sans">
                  Bag
                </span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 sm:top-0 sm:right-auto sm:relative sm:-top-0 bg-[#6B2737] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="border-t border-stone-200 bg-white py-3 px-4 shadow-sm animate-fadeIn">
            <div className="max-w-2xl mx-auto flex items-center gap-2">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search earrings, polki chokers, kadas, kundan sets..."
                className="w-full text-xs text-stone-800 bg-transparent outline-hidden py-1"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setSearchOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-[#FAF8F4] shadow-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-stone-200">
                <div>
                  <span className="font-serif text-xl tracking-[0.2em] text-stone-900 uppercase">
                    MAHIRAANI
                  </span>
                  <span className="block text-[8px] tracking-[0.3em] text-[#B8922A] uppercase font-medium">
                    Royal Heirlooms
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col space-y-4 text-sm tracking-wider uppercase font-medium text-stone-800">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1 border-b border-stone-100 hover:text-[#6B2737] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-stone-200 space-y-3">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366] text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Stylist</span>
              </a>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-xs text-stone-500 hover:text-stone-800"
              >
                Admin Management Portal →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
