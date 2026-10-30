"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Eye, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/money";

export type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number | null;
    comparePrice?: number | null;
    status: string;
    isSample: boolean;
    shortDescription?: string | null;
    category?: { name: string; slug: string } | null;
    images?: Array<{
      id: string;
      url: string;
      altText?: string | null;
      isCover: boolean;
    }>;
    variants?: Array<{
      id: string;
      name: string;
      price: number;
      stock: number;
    }>;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const images = product.images || [];
  const coverImage = images.find((i) => i.isCover) || images[0];
  const secondImage = images.find((i) => !i.isCover) || images[1];

  const currentDisplayImage = isHovered && secondImage ? secondImage : coverImage;

  // Calculate discount percentage if comparePrice exists
  const discountPercent =
    product.comparePrice && product.basePrice && product.comparePrice > product.basePrice
      ? Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)
      : null;

  const displayPrice = product.basePrice || (product.variants && product.variants[0]?.price) || 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);

    addItem({
      productId: product.id,
      variantId: product.variants && product.variants[0] ? product.variants[0].id : null,
      name: product.name,
      variantName: product.variants && product.variants[0] ? product.variants[0].name : null,
      price: displayPrice,
      image: coverImage?.url,
      slug: product.slug,
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 1200);
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/60 shadow-xs hover:shadow-xl hover:border-stone-300 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <Link href={`/products/${product.slug}`} className="relative aspect-4/5 w-full bg-[#F5F2EB] overflow-hidden block">
        {currentDisplayImage ? (
          <Image
            src={currentDisplayImage.url}
            alt={currentDisplayImage.altText || product.name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400 text-xs font-serif">
            Mahiraani Heirlooms
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isSample && (
            <span className="bg-amber-600/90 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              Sample Piece
            </span>
          )}
          {discountPercent && (
            <span className="bg-[#6B2737] text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          <span className="bg-white/90 text-[#6B2737] text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
            Handcrafted
          </span>
        </div>

        {/* Quick actions on hover */}
        <div className="absolute bottom-3 inset-x-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="flex-1 py-2.5 px-3 bg-[#1C1917]/90 hover:bg-[#6B2737] text-white rounded-xl text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 shadow-md backdrop-blur-xs transition-colors"
          >
            {isAdding ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {product.category && (
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8922A] font-semibold mb-1">
              {product.category.name}
            </p>
          )}

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-base sm:text-lg text-stone-900 group-hover:text-[#6B2737] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {product.shortDescription && (
            <p className="text-xs text-stone-500 line-clamp-1 mt-0.5 italic">
              {product.shortDescription}
            </p>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-stone-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-stone-900 font-sans">
              {formatINR(displayPrice)}
            </span>
            {product.comparePrice && product.comparePrice > displayPrice && (
              <span className="text-xs text-stone-400 line-through">
                {formatINR(product.comparePrice)}
              </span>
            )}
          </div>

          <span className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">
            Hallmarked
          </span>
        </div>
      </div>
    </div>
  );
}
