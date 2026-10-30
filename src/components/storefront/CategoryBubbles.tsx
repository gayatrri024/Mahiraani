"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

const categories = [
  {
    title: "Earrings",
    subtitle: "Chandbalis & Jhumkas",
    href: "/collections/earrings",
    icon: "✨",
    color: "from-amber-100 to-rose-100",
  },
  {
    title: "Necklaces",
    subtitle: "Polki & Chokers",
    href: "/collections/necklaces",
    icon: "💎",
    color: "from-rose-100 to-amber-100",
  },
  {
    title: "Bangles & Kadas",
    subtitle: "Royal Wristwear",
    href: "/collections/bangles",
    icon: "👑",
    color: "from-amber-100 to-amber-50",
  },
  {
    title: "Festive Edit",
    subtitle: "Wedding Celebrations",
    href: "/collections/festive-edit",
    icon: "🌟",
    color: "from-rose-100 to-purple-100",
  },
  {
    title: "Everyday Wear",
    subtitle: "Subtle Elegance",
    href: "/collections/everyday-wear",
    icon: "🌿",
    color: "from-stone-100 to-amber-50",
  },
  {
    title: "Under ₹999",
    subtitle: "Pocket Luxury",
    href: "/collections/under-999",
    icon: "🎁",
    color: "from-amber-50 to-rose-50",
  },
];

export default function CategoryBubbles() {
  return (
    <section className="py-10 bg-[#FAF8F4] border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#B8922A] font-medium">
            Explore By Silhouette
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 mt-1">
            Curated Categories
          </h2>
        </div>

        <div className="flex items-center justify-start sm:justify-center gap-5 sm:gap-8 overflow-x-auto pb-4 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="flex flex-col items-center shrink-0 group"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-0.5 bg-gradient-to-tr from-[#B8922A] via-[#E8D4A2] to-[#6B2737] group-hover:scale-105 transition-transform duration-300 shadow-sm">
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${cat.color} flex flex-col items-center justify-center border-2 border-white text-center p-2`}>
                  <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">
                    {cat.icon}
                  </span>
                </div>
              </div>
              <span className="mt-2 text-xs font-medium text-stone-800 tracking-wide uppercase group-hover:text-[#6B2737] transition-colors">
                {cat.title}
              </span>
              <span className="text-[10px] text-stone-400 -mt-0.5 hidden sm:block">
                {cat.subtitle}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
