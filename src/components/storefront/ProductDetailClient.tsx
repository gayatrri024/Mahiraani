"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Check,
  Plus,
  Minus,
  Heart,
  Share2
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/money";

type ImageType = {
  id: string;
  url: string;
  altText?: string | null;
  isCover: boolean;
};

type VariantType = {
  id: string;
  name: string;
  options: any;
  price: number;
  comparePrice?: number | null;
  sku?: string | null;
  stock: number;
  isActive: boolean;
};

type ProductDetailProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    shortDescription?: string | null;
    basePrice: number | null;
    comparePrice?: number | null;
    isSample: boolean;
    material?: string | null;
    finish?: string | null;
    dimensions?: string | null;
    weight?: string | null;
    closureType?: string | null;
    careInstructions?: string | null;
    originDetails?: string | null;
    packageContents?: string | null;
    category?: { name: string; slug: string } | null;
    images: ImageType[];
    variants: VariantType[];
  };
};

export default function ProductDetailClient({ product }: ProductDetailProps) {
  const { addItem } = useCart();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<VariantType | null>(
    product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>("specifications");

  const images = product.images.length > 0 ? product.images : [];
  const currentImage = images[activeImageIdx] || images[0];

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.basePrice || 0;

  const currentComparePrice = selectedVariant?.comparePrice ?? product.comparePrice;

  const discountPercent =
    currentComparePrice && currentComparePrice > currentPrice
      ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
      : null;

  const handleAddToCart = () => {
    setIsAdded(true);
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        variantName: selectedVariant?.name,
        price: currentPrice,
        image: currentImage?.url,
        slug: product.slug,
        sku: selectedVariant?.sku,
      },
      quantity
    );

    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  // WhatsApp direct buy link
  const waUrl = `https://wa.me/919876543210?text=Hello%20Mahiraani%20Jewellery%2C%20I%20am%20interested%20in%20ordering%3A%0A*${encodeURIComponent(
    product.name
  )}*%0A${selectedVariant ? `Variant%3A%20${encodeURIComponent(selectedVariant.name)}%0A` : ""}Price%3A%20${encodeURIComponent(
    formatINR(currentPrice)
  )}%0APlease%20confirm%20availability%20and%20delivery%20time.`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
      {/* ── Left Column: Media Gallery ── */}
      <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto shrink-0 pb-2 sm:pb-0 sm:max-h-[580px] no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  activeImageIdx === idx
                    ? "border-[#6B2737] shadow-md ring-1 ring-[#6B2737]"
                    : "border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText || `${product.name} view ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Primary Main Image */}
        <div className="relative aspect-4/5 w-full bg-[#F5F2EB] rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm">
          {currentImage ? (
            <Image
              src={currentImage.url}
              alt={currentImage.altText || product.name}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400 font-serif">
              Mahiraani Royal Collection
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isSample && (
              <span className="bg-amber-600 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-xs">
                Sample Piece
              </span>
            )}
            {discountPercent && (
              <span className="bg-[#6B2737] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
            <span className="bg-white/90 text-[#6B2737] text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              Handcrafted in Jaipur
            </span>
          </div>
        </div>
      </div>

      {/* ── Right Column: Product Info & Actions ── */}
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div>
          {/* Category & Hallmark */}
          <div className="flex items-center justify-between text-xs mb-2">
            {product.category && (
              <Link
                href={`/collections/${product.category.slug}`}
                className="text-[11px] uppercase tracking-[0.25em] text-[#B8922A] font-semibold hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Certified Hallmark
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 leading-tight">
            {product.name}
          </h1>

          {/* Short description */}
          {product.shortDescription && (
            <p className="mt-2 text-sm text-stone-600 font-light italic">
              {product.shortDescription}
            </p>
          )}

          {/* Pricing */}
          <div className="mt-4 pb-4 border-b border-stone-200 flex items-baseline gap-3">
            <span className="font-sans text-2xl sm:text-3xl font-semibold text-stone-950">
              {formatINR(currentPrice)}
            </span>
            {currentComparePrice && currentComparePrice > currentPrice && (
              <span className="text-base text-stone-400 line-through">
                {formatINR(currentComparePrice)}
              </span>
            )}
            <span className="text-[11px] text-stone-500 font-light">
              Inclusive of all taxes & insured pan-India delivery
            </span>
          </div>

          {/* Variants Selector */}
          {product.variants.length > 0 && (
            <div className="mt-6 space-y-3">
              <label className="block text-xs uppercase tracking-wider text-stone-700 font-semibold">
                Select Option / Variant:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                      selectedVariant?.id === v.id
                        ? "border-[#6B2737] bg-[#6B2737] text-white shadow-xs"
                        : "border-stone-300 bg-white text-stone-800 hover:border-stone-400"
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="ml-2 opacity-80 text-[11px] font-mono">
                      {formatINR(v.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Add To Bag */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-stone-600 hover:bg-stone-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-semibold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-3 text-stone-600 hover:bg-stone-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className="flex-1 py-3.5 px-6 bg-[#6B2737] hover:bg-[#521c29] text-white rounded-xl text-xs uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Added to Royal Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag • {formatINR(currentPrice * quantity)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Instant WhatsApp Order */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#1fae53] text-white rounded-xl text-xs uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Order via WhatsApp Stylist</span>
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 p-4 bg-[#F5F2EB] rounded-2xl border border-stone-200/80 space-y-2.5 text-xs text-stone-700">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#B8922A] shrink-0" />
              <span><strong>Free Pan-India Express Delivery:</strong> Dispatched in 24-48 hours.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#B8922A] shrink-0" />
              <span><strong>7-Day Easy Exchange:</strong> Hassle-free size or design replacement.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#B8922A] shrink-0" />
              <span><strong>Royal Keepsake Packaging:</strong> Handcrafted velvet heirloom box included.</span>
            </div>
          </div>
        </div>

        {/* ── Accordion Specifications ── */}
        <div className="mt-8 border-t border-stone-200 divide-y divide-stone-200">
          {/* Specifications */}
          <div className="py-3">
            <button
              onClick={() =>
                setOpenAccordion(openAccordion === "specifications" ? "" : "specifications")
              }
              className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-stone-900 font-semibold py-1"
            >
              <span>Material & Craft Specifications</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openAccordion === "specifications" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openAccordion === "specifications" && (
              <div className="mt-3 text-xs text-stone-600 space-y-2 leading-relaxed animate-fadeIn">
                <p>
                  <strong>Material:</strong> {product.material || "Brass alloy with 22K gold micron plating & semi-precious stones"}
                </p>
                <p>
                  <strong>Finish:</strong> {product.finish || "Antique Gold / High Luster Polish"}
                </p>
                <p>
                  <strong>Dimensions:</strong> {product.dimensions || "Handcrafted standard proportions"}
                </p>
                <p>
                  <strong>Weight:</strong> {product.weight || "Lightweight & comfortable for all-day celebrations"}
                </p>
                <p>
                  <strong>Closure:</strong> {product.closureType || "Push-back / Adjustable drawstring dori"}
                </p>
              </div>
            )}
          </div>

          {/* Jewellery Care */}
          <div className="py-3">
            <button
              onClick={() => setOpenAccordion(openAccordion === "care" ? "" : "care")}
              className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-stone-900 font-semibold py-1"
            >
              <span>Jewellery Care Guide</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openAccordion === "care" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openAccordion === "care" && (
              <div className="mt-3 text-xs text-stone-600 space-y-1.5 leading-relaxed animate-fadeIn">
                <p>• Avoid direct contact with perfumes, sanitizers, and cosmetics.</p>
                <p>• Keep away from moisture; wipe gently with a soft microfibre cloth after wear.</p>
                <p>• Store in the provided airtight Mahiraani velvet pouch to retain shine.</p>
              </div>
            )}
          </div>

          {/* Shipping & Delivery */}
          <div className="py-3">
            <button
              onClick={() => setOpenAccordion(openAccordion === "shipping" ? "" : "shipping")}
              className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-stone-900 font-semibold py-1"
            >
              <span>Shipping & Delivery Policy</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openAccordion === "shipping" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openAccordion === "shipping" && (
              <div className="mt-3 text-xs text-stone-600 space-y-1.5 leading-relaxed animate-fadeIn">
                <p>• Dispatched from our Jaipur atelier within 24 to 48 hours.</p>
                <p>• Express air delivery to major metros (Delhi, Mumbai, Bengaluru) in 2-4 business days.</p>
                <p>• Insured pan-India transit with live tracking via SMS and WhatsApp.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
