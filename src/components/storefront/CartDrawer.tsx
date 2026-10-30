"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ShieldCheck, ArrowRight, MessageCircle, Gift } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/money";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    totalPaise,
    freeShippingThreshold,
    amountForFreeShipping,
  } = useCart();

  const [notes, setNotes] = useState("");
  const [isGiftWrap, setIsGiftWrap] = useState(false);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((totalPaise / freeShippingThreshold) * 100));

  // WhatsApp Order message
  const waItemsText = items
    .map((item, idx) => `${idx + 1}. ${item.name} (${item.variantName || "Standard"}) x${item.quantity} = ${formatINR(item.price * item.quantity)}`)
    .join("%0A");
  const waTotalText = formatINR(totalPaise);
  const waUrl = `https://wa.me/919876543210?text=Hello%20Mahiraani%20Jewellery%2C%20I%20would%20like%20to%20place%20an%20order%20for%3A%0A%0A${waItemsText}%0A%0ATotal%3A%20${encodeURIComponent(waTotalText)}${isGiftWrap ? "%0A%2B%20Complimentary%20Gift%20Packaging%20Requested" : ""}${notes ? `%0ANote%3A%20${encodeURIComponent(notes)}` : ""}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F4] shadow-2xl flex flex-col transform transition-transform ease-out duration-300">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#6B2737]" />
              <h2 className="text-lg font-serif tracking-wide text-stone-900 uppercase">
                Your Jewellery Box ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="px-5 py-3 bg-[#F4EFEB] border-b border-stone-200 text-xs">
            {amountForFreeShipping > 0 ? (
              <p className="text-stone-700 mb-1.5 font-medium">
                Add <span className="font-semibold text-[#6B2737]">{formatINR(amountForFreeShipping)}</span> more for{" "}
                <span className="font-semibold text-emerald-800">FREE Express Delivery</span> 🚚
              </p>
            ) : (
              <p className="text-emerald-800 font-semibold mb-1.5 flex items-center gap-1">
                <span>🎉</span> You have unlocked <strong>FREE Express Insured Delivery</strong>!
              </p>
            )}
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#B8922A] to-[#6B2737] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Content / Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF0F2] text-[#6B2737] mx-auto flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-serif text-xl text-stone-900 mb-2">Your Jewellery Box is Empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto mb-6">
                  Discover our handcrafted regal heirlooms, curated earrings, and festive sets.
                </p>
                <button
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 bg-[#6B2737] text-white px-6 py-3 rounded-full text-xs font-medium uppercase tracking-wider hover:bg-[#521c29] transition-colors"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-white rounded-xl border border-stone-200/80 shadow-xs relative group"
                >
                  <div className="relative w-20 h-24 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="font-serif text-stone-900 text-sm font-medium line-clamp-1 hover:text-[#6B2737] transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-stone-300 hover:text-red-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.variantName && (
                        <p className="text-[11px] text-[#6B2737] font-medium tracking-wide mt-0.5">
                          {item.variantName}
                        </p>
                      )}

                      <p className="text-xs font-semibold text-stone-900 mt-1">
                        {formatINR(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-stone-200 transition-colors text-stone-600"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-medium text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-stone-200 transition-colors text-stone-600"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-[#6B2737]">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {items.length > 0 && (
              <div className="pt-2">
                <label className="flex items-center gap-2 p-3 bg-[#FDF9F2] border border-[#E9DFCE] rounded-lg cursor-pointer text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={isGiftWrap}
                    onChange={(e) => setIsGiftWrap(e.target.checked)}
                    className="rounded text-[#6B2737] focus:ring-[#6B2737]"
                  />
                  <Gift className="w-4 h-4 text-[#B8922A]" />
                  <span>Send in signature royal velvet gift packaging (Complimentary)</span>
                </label>

                <div className="mt-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add special instructions or custom sizing note for our artisan..."
                    rows={2}
                    className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:border-[#6B2737]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500 font-medium">Subtotal</span>
                <span className="text-base font-semibold text-stone-900 font-serif tracking-wide">
                  {formatINR(totalPaise)}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Inclusive of all taxes. Free insured delivery within India.
              </p>

              {/* Instant WhatsApp Order (High Conversion for Indian Instagram audience) */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Quick Order via WhatsApp</span>
              </a>

              {/* Standard Checkout */}
              <button
                onClick={() => {
                  alert(
                    "Checkout Demo: Standard payment gateway (Razorpay / UPI / Cards) can be connected when ready. For immediate orders, you can use the WhatsApp button above!"
                  );
                }}
                className="w-full py-3.5 px-4 bg-[#6B2737] hover:bg-[#541e2b] text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Proceed to Checkout • {formatINR(totalPaise)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-stone-500 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Certified Hallmark
                </span>
                <span>•</span>
                <span>COD Available</span>
                <span>•</span>
                <span>7-Day Exchange</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
