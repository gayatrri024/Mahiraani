"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ShoppingBag, MessageCircle, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function MobileStickyBar() {
  const pathname = usePathname();
  const { openCart, totalItems } = useCart();

  // Don't show in admin area
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-t border-stone-200/80 px-4 py-2 shadow-lg">
      <div className="flex items-center justify-around text-[10px] uppercase tracking-wider font-medium text-stone-600">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 p-1 ${
            pathname === "/" ? "text-[#6B2737] font-bold" : "hover:text-stone-900"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          href="/collections/all"
          className={`flex flex-col items-center gap-1 p-1 ${
            pathname.startsWith("/collections") ? "text-[#6B2737] font-bold" : "hover:text-stone-900"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Shop</span>
        </Link>

        <a
          href="https://wa.me/919876543210?text=Hello%20Mahiraani%2C%20I%20am%20browsing%20from%20Instagram%20and%20need%20help."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 p-1 text-emerald-700"
        >
          <MessageCircle className="w-4 h-4 fill-emerald-100" />
          <span>WhatsApp</span>
        </a>

        <button
          onClick={openCart}
          className="relative flex flex-col items-center gap-1 p-1 text-stone-800"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#6B2737] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </div>
          <span>Bag</span>
        </button>

        <Link
          href="/admin"
          className={`flex flex-col items-center gap-1 p-1 ${
            pathname.startsWith("/admin") ? "text-[#6B2737] font-bold" : "hover:text-stone-900"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Admin</span>
        </Link>
      </div>
    </div>
  );
}
