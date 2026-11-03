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
  ChevronDown,
  Check,
  Plus,
  Minus,
  Gift,
  CreditCard,
  Star,
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
  options: string | Record<string, string>;
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
  reviewStats?: {
    totalReviews: number;
    averageRating: number;
  };
};

export default function ProductDetailClient({
  product,
  reviewStats = { totalReviews: 0, averageRating: 0 },
}: ProductDetailProps) {
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
  const waUrl = `https://wa.me/919146686816?text=Hello%20MAHIRAANI%2C%20I%20am%20interested%20in%20ordering%3A%0A*${encodeURIComponent(
    product.name
  )}*%0A${selectedVariant ? `Variant%3A%20${encodeURIComponent(selectedVariant.name)}%0A` : ""}Price%3A%20${encodeURIComponent(
    formatINR(currentPrice)
  )}%0APlease%20confirm%20availability%20and%20delivery%20time.`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pb-24 lg:pb-0">
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
              MAHIRAANI
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
              Handcrafted in India
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
            <span className="inline-flex items-center gap-1 text-[11px] text-[#8C6D1F] font-medium bg-[#FBF7EE] px-2.5 py-0.5 rounded-full border border-[#EADBBD]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B8922A]" />
              Anti-Tarnish Everyday Wear
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 leading-tight">
            {product.name}
          </h1>

          {/* Rating Summary Link */}
          <div className="mt-2.5 flex items-center gap-2">
            {reviewStats && reviewStats.totalReviews > 0 ? (
              <a
                href="#patron-reviews"
                className="inline-flex items-center gap-1.5 text-xs text-stone-700 hover:text-[#6B2737] group transition-colors"
              >
                <div className="flex items-center gap-0.5 text-[#B8922A]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(reviewStats.averageRating)
                          ? "fill-[#B8922A] text-[#B8922A]"
                          : "text-stone-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-stone-900">
                  {reviewStats.averageRating.toFixed(1)}
                </span>
                <span className="text-stone-400 group-hover:underline">
                  ({reviewStats.totalReviews} verified {reviewStats.totalReviews === 1 ? "review" : "reviews"})
                </span>
              </a>
            ) : (
              <a
                href="#patron-reviews"
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors"
              >
                <Star className="w-3.5 h-3.5 text-stone-300" />
                <span className="text-stone-400">No reviews yet</span>
                <span className="text-stone-300">•</span>
                <span className="text-[#B8922A] font-medium hover:underline">
                  Verified patron reviews only
                </span>
              </a>
            )}
          </div>

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
                    <span>Added to Bag</span>
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
              <span><strong>Free Shipping on Orders Above ₹900:</strong> Dispatched in 24–48 hours across India.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-[#B8922A] shrink-0" />
              <span><strong>Prepaid Orders Only:</strong> Fast & secure UPI/Card checkout. No COD.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Gift className="w-4 h-4 text-[#B8922A] shrink-0" />
              <span><strong>Gift Packaging:</strong> Signature gift box available in bag for ₹70 extra.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#B8922A] shrink-0" />
              <span><strong>Anti-Tarnish Everyday Wear:</strong> Skin-friendly, long-lasting high luster finish.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#B8922A] shrink-0" />
              <span><strong>A Little Note on Returns:</strong> No returns or exchange; 48-hour issue support.</span>
            </div>
          </div>
        </div>

        {/* ── Accordion Specifications & Policies ── */}
        <div className="mt-8 border-t border-stone-200 divide-y divide-stone-200">
          {/* Specifications */}
          <div className="py-3">
            <button
              onClick={() =>
                setOpenAccordion(openAccordion === "specifications" ? "" : "specifications")
              }
              className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-stone-900 font-semibold py-1"
            >
              <span>Material & Craft Details</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openAccordion === "specifications" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openAccordion === "specifications" && (
              <div className="mt-3 text-xs text-stone-600 space-y-2 leading-relaxed animate-fadeIn">
                <p>
                  <strong>Material:</strong> {product.material || "High-grade alloy with durable anti-tarnish protective layering"}
                </p>
                <p>
                  <strong>Finish:</strong> {product.finish || "Anti-Tarnish Warm Gold Tone Polish"}
                </p>
                <p>
                  <strong>Type:</strong> Everyday Fashion Jewellery (Not real gold; no hallmarking required)
                </p>
                <p>
                  <strong>Dimensions:</strong> {product.dimensions || "Standard comfortable proportions"}
                </p>
                <p>
                  <strong>Weight:</strong> {product.weight || "Featherlight & designed for everyday comfort"}
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
                <p>• Keep away from direct spray of perfumes, alcohol-based sanitizers, and harsh cosmetics.</p>
                <p>• Wipe gently with a soft microfibre cloth after wearing to maintain its anti-tarnish luster.</p>
                <p>• Store individually in an airtight pouch or box when not in use.</p>
              </div>
            )}
          </div>

          {/* Shipping Policy */}
          <div className="py-3">
            <button
              onClick={() => setOpenAccordion(openAccordion === "shipping" ? "" : "shipping")}
              className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-stone-900 font-semibold py-1"
            >
              <span>Shipping Policy</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openAccordion === "shipping" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openAccordion === "shipping" && (
              <div className="mt-3 text-xs text-stone-600 space-y-2 leading-relaxed animate-fadeIn">
                <p>• <strong>Free Shipping:</strong> Shipping is on us! Enjoy free shipping on orders above ₹900, across India.</p>
                <p>• <strong>Dispatch:</strong> Orders are packed and dispatched within 24–48 hours of confirmation.</p>
                <p>• <strong>Delivery:</strong> Should reach you in around 5–7 business days, depending on your pincode.</p>
                <p>• <strong>Tracking:</strong> Track your shipment via the courier link and AWB sent to your WhatsApp/email, or message our Pune concierge (+91 9146686816) anytime.</p>
              </div>
            )}
          </div>

          {/* Returns & Cancellations Policy */}
          <div className="py-3">
            <button
              onClick={() => setOpenAccordion(openAccordion === "returns" ? "" : "returns")}
              className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-stone-900 font-semibold py-1"
            >
              <span>Returns, Exchanges & Cancellations</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openAccordion === "returns" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openAccordion === "returns" && (
              <div className="mt-3 text-xs text-stone-600 space-y-2 leading-relaxed animate-fadeIn">
                <p className="font-medium text-stone-800">A Little Note on Returns 🌸</p>
                <p>Every Mahiraani piece is chosen with love, and we hope you love yours just as much!</p>
                <p>Since each item is special, <strong>we don’t accept returns or exchanges</strong>. However, if something isn’t quite right with your order, we’re here to help:</p>
                <ul className="list-disc pl-4 space-y-1 text-stone-600">
                  <li>Let us know within <strong>48 hours</strong> of delivery if your jewellery has an issue.</li>
                  <li>Contact our customer care team on WhatsApp (<strong>+91 9146686816</strong>) or email <strong>care@mahiraani.com</strong> with your Order Reference ID.</li>
                  <li>Tell us what went wrong and share 3 clear photos of the jewellery piece.</li>
                  <li>Our team will review your enquiry and get back to you by email.</li>
                </ul>
                <p className="pt-1"><strong>Cancellations:</strong> Free while your order is still in the Confirmed or Packed stage. Once on its way, cancellations are no longer possible.</p>
                <p><strong>Refunds:</strong> Approved refunds are issued to the original payment method within 5–7 business days.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Add to Bag Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-t border-stone-200/80 px-4 py-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex flex-col shrink-0">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider">Total</span>
            <span className="text-base font-semibold text-[#6B2737] font-serif leading-tight">
              {formatINR(currentPrice * quantity)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className="flex-1 py-3 px-4 bg-[#6B2737] hover:bg-[#521c29] text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-90"
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </>
            )}
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-[#25D366] hover:bg-[#1fae53] text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors"
            title="Enquire on WhatsApp"
            aria-label="Enquire on WhatsApp"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
          </a>
        </div>
      </div>
    </div>
  );
}
