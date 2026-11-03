"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface CategorySilhouette {
  title: string;
  subtitle: string;
  href: string;
  image?: string;
  customIcon?: React.ReactNode;
}

// Custom luxury editorial jewellery silhouette motifs in MAHIRAANI Antique Gold (#B8922A)
const NecklaceSilhouette = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 text-[#B8922A] drop-shadow-xs" stroke="currentColor">
    {/* Inner collar arch */}
    <path d="M12 14c4 10 20 10 24 0" strokeWidth="1.75" strokeLinecap="round" />
    {/* Outer collar arch */}
    <path d="M10 18c5 13 23 13 28 0" strokeWidth="1.25" strokeLinecap="round" strokeDasharray="1 3" />
    {/* Centre teardrop polki pendant */}
    <path d="M24 25c-2.5 0-4.5 2.5-4.5 5 0 3.5 4.5 7.5 4.5 7.5s4.5-4 4.5-7.5c0-2.5-2-5-4.5-5z" fill="#B8922A" fillOpacity="0.15" strokeWidth="1.5" />
    {/* Flanking polki droplet beads */}
    <circle cx="18" cy="23" r="1.75" fill="#B8922A" />
    <circle cx="30" cy="23" r="1.75" fill="#B8922A" />
    <circle cx="14" cy="19" r="1.25" fill="#B8922A" />
    <circle cx="34" cy="19" r="1.25" fill="#B8922A" />
    {/* Centre gem accent */}
    <circle cx="24" cy="29" r="1.5" fill="#6B2737" />
  </svg>
);

const BanglesSilhouette = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 text-[#B8922A] drop-shadow-xs" stroke="currentColor">
    {/* First royal kada */}
    <ellipse cx="21" cy="24" rx="14" ry="17" strokeWidth="1.75" />
    <ellipse cx="21" cy="24" rx="11.5" ry="14.5" strokeWidth="1" strokeDasharray="2 3" />
    {/* Interlocking second bangle */}
    <ellipse cx="27" cy="24" rx="14" ry="17" strokeWidth="1.75" strokeOpacity="0.85" />
    {/* Floral Kada Finials / clasp accents */}
    <circle cx="7" cy="24" r="2" fill="#B8922A" />
    <circle cx="41" cy="24" r="2" fill="#B8922A" />
    <circle cx="27" cy="7" r="1.5" fill="#6B2737" />
  </svg>
);

const FestiveSilhouette = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 text-[#B8922A] drop-shadow-xs" stroke="currentColor">
    {/* Royal Maang Tikka chain */}
    <path d="M24 6v10" strokeWidth="1.5" strokeDasharray="1.5 2" />
    {/* Crescent Chand motif */}
    <path d="M16 23c2.5 5 13.5 5 16 0" strokeWidth="1.5" strokeLinecap="round" />
    {/* Central royal medallion */}
    <circle cx="24" cy="27" r="6" strokeWidth="1.5" fill="#B8922A" fillOpacity="0.12" />
    <circle cx="24" cy="27" r="2.5" fill="#6B2737" />
    {/* Dangling pearls */}
    <circle cx="20" cy="36" r="1.5" fill="#B8922A" />
    <circle cx="24" cy="38" r="2" fill="#B8922A" />
    <circle cx="28" cy="36" r="1.5" fill="#B8922A" />
    {/* Top hook */}
    <circle cx="24" cy="6" r="1.25" fill="#B8922A" />
  </svg>
);

const EverydaySilhouette = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 text-[#B8922A] drop-shadow-xs" stroke="currentColor">
    {/* Minimalist fine chain */}
    <path d="M12 12c4 14 20 14 24 0" strokeWidth="1.25" strokeLinecap="round" />
    {/* Delicate geometric solitaire pendant */}
    <rect x="21" y="21" width="6" height="6" transform="rotate(45 24 24)" strokeWidth="1.5" fill="#B8922A" fillOpacity="0.15" />
    <circle cx="24" cy="24" r="1.5" fill="#B8922A" />
    {/* Clean circular halo */}
    <circle cx="24" cy="24" r="7.5" strokeWidth="0.8" strokeDasharray="1.5 2.5" />
  </svg>
);

const Under999Silhouette = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 text-[#B8922A] drop-shadow-xs" stroke="currentColor">
    {/* Petite treasure token */}
    <circle cx="24" cy="24" r="15" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="12" strokeWidth="0.75" strokeDasharray="1.5 2" />
    {/* Currency & Lotus emblem */}
    <path d="M20 18h8M20 22h6M20 18c1.5 2 3.5 3 4 5l-4 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="28" cy="27" r="1" fill="#6B2737" />
  </svg>
);

const silhouettes: CategorySilhouette[] = [
  {
    title: "Earrings",
    subtitle: "Chandbalis & Jhumkas",
    href: "/collections/earrings",
    image: "/uploads/4bcb452c-0336-42d4-9b9b-5fadfca5e633.jpg",
  },
  {
    title: "Necklaces",
    subtitle: "Polki & Chokers",
    href: "/collections/necklaces",
    customIcon: <NecklaceSilhouette />,
  },
  {
    title: "Bangles & Kadas",
    subtitle: "Royal Wristwear",
    href: "/collections/bangles",
    customIcon: <BanglesSilhouette />,
  },
  {
    title: "Festive Edit",
    subtitle: "Wedding Celebrations",
    href: "/collections/festive-edit",
    customIcon: <FestiveSilhouette />,
  },
  {
    title: "Everyday Wear",
    subtitle: "Subtle Elegance",
    href: "/collections/everyday-wear",
    customIcon: <EverydaySilhouette />,
  },
  {
    title: "Under ₹999",
    subtitle: "Pocket Luxury",
    href: "/collections/under-999",
    customIcon: <Under999Silhouette />,
  },
];

export default function CategoryBubbles() {
  return (
    <section className="pt-4 pb-12 bg-[#FAF8F4] border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-[#9E7728] font-medium">
            Curated Silhouettes
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#6B2737] mt-1 font-normal">
            Shop by Silhouette
          </h2>
          <div className="w-10 h-0.5 bg-[#B8922A]/60 mx-auto mt-2" />
        </div>

        <div className="flex items-center justify-start sm:justify-center gap-5 sm:gap-8 overflow-x-auto pb-4 pt-1 no-scrollbar">
          {silhouettes.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex flex-col items-center shrink-0 group focus:outline-none"
            >
              {/* Outer decorative dual ring */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[2px] bg-gradient-to-tr from-[#B8922A] via-[#E8D4A2] to-[#6B2737] group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                <div className="w-full h-full rounded-full bg-stone-50 border border-white overflow-hidden flex items-center justify-center relative">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-[#FFFDF9] to-[#F5EFE6] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {item.customIcon}
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <span className="mt-2.5 text-xs font-medium text-stone-800 tracking-wider uppercase group-hover:text-[#6B2737] transition-colors text-center">
                {item.title}
              </span>
              <span className="text-[10px] text-stone-400 mt-0.5 hidden sm:block text-center">
                {item.subtitle}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
