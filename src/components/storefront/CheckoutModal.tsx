"use client";

import { useState } from "react";
import Link from "next/link";
import { X, CheckCircle2, MessageCircle, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { CartItem } from "@/context/CartContext";

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  isGiftWrap: boolean;
  notes: string;
  totalPaise: number;
  finalTotalPaise: number;
  onOrderSuccess: (orderRef: string) => void;
};

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  isGiftWrap,
  notes,
  totalPaise,
  finalTotalPaise,
  onOrderSuccess,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("Pune");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"manual_upi" | "razorpay">("manual_upi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<{
    reference: string;
    accessToken: string;
    totalPaise: number;
  } | null>(null);

  if (!isOpen) return null;

  const formatINR = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  async function handleSubmitOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        city,
        state,
        pincode,
        isGiftWrap,
        notes: notes || undefined,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || undefined,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to place order");
      } else {
        setConfirmedOrder(data.order);
        onOrderSuccess(data.order.reference);
      }
    } catch {
      setError("Network connection issue. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const waSlipUrl = confirmedOrder
    ? `https://wa.me/919146686816?text=${encodeURIComponent(
        `*MAHIRAANI Order Confirmation Slip*\nOrder Ref: *${confirmedOrder.reference}*\nCustomer: ${customerName}\nPhone: ${customerPhone}\nCity: ${city}, ${state} (${pincode})\nTotal: ${formatINR(confirmedOrder.totalPaise)}\nItems: ${items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}\n\nPlease assist with tracking and delivery updates!`
      )}`
    : "";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FAF8F4] border border-[#E9DFCE] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Close checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedOrder ? (
          <div className="text-center py-4 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#9E7728] font-medium">
                Order Received
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#6B2737] mt-1 font-normal">
                Thank You, {customerName}
              </h2>
              <p className="text-xs text-stone-600 mt-2">
                Your order reference is{" "}
                <span className="font-mono font-bold text-stone-900 px-2 py-0.5 bg-stone-100 rounded border border-stone-200">
                  {confirmedOrder.reference}
                </span>
              </p>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-2xl text-left text-xs space-y-2 text-stone-700">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Order Amount</span>
                <span className="font-bold text-[#6B2737] font-serif text-sm">
                  {formatINR(confirmedOrder.totalPaise)}
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Delivery Address</span>
                <span className="text-right font-medium max-w-[60%]">
                  {addressLine1}, {city}, {state} - {pincode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Status</span>
                <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                  Pending Verification
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 max-w-md mx-auto">
              Our Pune studio concierge has received your booking. You can send this order slip to our WhatsApp stylist for priority processing or tracking updates.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={waSlipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Send Slip to WhatsApp</span>
              </a>
              <Link
                href={`/orders/${confirmedOrder.reference}?token=${confirmedOrder.accessToken}`}
                onClick={onClose}
                className="py-3 px-5 bg-[#6B2737] hover:bg-[#521c29] text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Track Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#9E7728] font-medium">
                MAHIRAANI Boutique
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#6B2737] mt-0.5 font-normal">
                Secure Checkout
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Enter your delivery details to complete your order reservation.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737]"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">10-Digit Mobile *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="radhika@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Street / House / Building *</label>
                  <input
                    type="text"
                    required
                    placeholder="Flat 402, Royal Residency"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737]"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Area / Landmark (optional)</label>
                  <input
                    type="text"
                    placeholder="Near Senapati Bapat Road"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737]"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737]"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="411016"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737]"
                  />
                </div>
              </div>

              {/* Payment Method Option */}
              <div>
                <label className="block text-stone-700 font-medium mb-1.5">Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-3 bg-white border border-stone-200 rounded-xl cursor-pointer hover:border-[#6B2737] transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="manual_upi"
                      checked={paymentMethod === "manual_upi"}
                      onChange={() => setPaymentMethod("manual_upi")}
                      className="mt-0.5 text-[#6B2737] focus:ring-[#6B2737]"
                    />
                    <div>
                      <span className="font-semibold text-stone-900 block">
                        Direct UPI & Concierge Confirmation (Recommended)
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        Confirm order slip directly with our Pune studio team on WhatsApp or Google Pay / PhonePe.
                      </span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2.5 p-3 bg-white border border-stone-200 rounded-xl cursor-pointer hover:border-[#6B2737] transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="mt-0.5 text-[#6B2737] focus:ring-[#6B2737]"
                    />
                    <div>
                      <span className="font-semibold text-stone-900 block">
                        Online Cards & Net Banking (Razorpay Preview)
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        Prepaid gateway checkout reservation.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Summary box */}
              <div className="p-3 bg-stone-100/70 border border-stone-200 rounded-xl space-y-1 text-stone-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal ({items.length} items)</span>
                  <span>{formatINR(totalPaise)}</span>
                </div>
                {isGiftWrap && (
                  <div className="flex justify-between text-[#6B2737]">
                    <span>Signature Gift Packaging</span>
                    <span>+₹70</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Insured Express Shipping</span>
                  <span className="text-emerald-700 font-medium">FREE</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-stone-200 font-bold text-stone-900 text-sm">
                  <span>Final Total</span>
                  <span className="text-[#6B2737] font-serif text-base">
                    {formatINR(finalTotalPaise)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-[#6B2737] hover:bg-[#541e2b] text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Order • {formatINR(finalTotalPaise)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B8922A]" />
                <span>Prepaid & Insured Dispatch Across India. Verified Artisanal Jewellery.</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
