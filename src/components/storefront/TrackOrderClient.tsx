"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/money";
import {
  Package,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  ExternalLink,
  Star,
  LogOut,
  MessageCircle,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";

interface OrderItemInfo {
  id: string;
  productId: string;
  snapshotName: string;
  snapshotVariantName: string | null;
  snapshotUnitPaise: number;
  quantity: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: Array<{ url: string }>;
  } | null;
}

interface OrderReviewInfo {
  id: string;
  productId: string;
  rating: number;
  status: string;
}

interface OrderData {
  id: string;
  reference: string;
  createdAt: string;
  totalPaise: number;
  paymentStatus: string;
  fulfilmentStatus: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items: OrderItemInfo[];
  reviews: OrderReviewInfo[];
}

export default function TrackOrderClient({
  initialCustomer,
  initialOrders = [],
}: {
  initialCustomer?: { id: string; phone: string; name?: string } | null;
  initialOrders?: OrderData[];
}) {
  const [customer, setCustomer] = useState(initialCustomer);
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);

  // Form states
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [providerMissing, setProviderMissing] = useState(false);

  // Review modal state
  const [reviewModalItem, setReviewModalItem] = useState<{
    orderId: string;
    productId: string;
    productName: string;
  } | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState(customer?.name || "");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Countdown timer for resend
  function startCooldownTimer(seconds: number) {
    setCooldown(seconds);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError("");
    setProviderMissing(false);
    setLoading(true);

    try {
      const res = await fetch("/api/orders/lookup/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send verification code.");
        if (data.providerMissing) setProviderMissing(true);
        if (data.cooldownSeconds) startCooldownTimer(data.cooldownSeconds);
      } else {
        setOtpSent(true);
        startCooldownTimer(data.cooldownSeconds || 60);
      }
    } catch {
      setError("Network issue. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders/lookup/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid verification code.");
      } else {
        setCustomer(data.customer);
        setDisplayName(data.customer.name);
        // Fetch orders
        const ordersRes = await fetch("/api/orders/lookup/my-orders");
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch {
      setError("Network issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/orders/lookup/logout", { method: "POST" });
    setCustomer(null);
    setOrders([]);
    setOtpSent(false);
    setPhone("");
    setOtp("");
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewModalItem) return;
    setReviewSubmitting(true);
    setReviewError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: reviewModalItem.orderId,
          productId: reviewModalItem.productId,
          rating,
          title: reviewTitle || undefined,
          comment,
          customerName: displayName || customer?.name || "Verified Buyer",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || "Failed to submit review.");
      } else {
        setReviewSuccess(true);
        // Refresh orders to reflect review status
        const ordersRes = await fetch("/api/orders/lookup/my-orders");
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
        setTimeout(() => {
          setReviewModalItem(null);
          setReviewSuccess(false);
          setReviewTitle("");
          setComment("");
        }, 2000);
      }
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3" /> In Transit / Shipped
          </span>
        );
      case "packed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-800">
            <Package className="w-3 h-3" /> Packed &amp; Ready
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-200 text-stone-700">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Order Confirmed
          </span>
        );
    }
  }

  function getPaymentBadge(status: string) {
    switch (status) {
      case "paid":
        return <span className="text-emerald-700 font-semibold text-xs">Payment Verified</span>;
      case "refunded":
        return <span className="text-purple-700 font-semibold text-xs">Refunded</span>;
      default:
        return <span className="text-amber-700 font-semibold text-xs">Pending Verification</span>;
    }
  }

  return (
    <div className="space-y-8">
      {/* ── View 1: Customer Not Verified ── */}
      {!customer ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-xs max-w-lg mx-auto">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-[#B8922A] mx-auto flex items-center justify-center mb-3 border border-amber-200">
              <KeyRound className="w-6 h-6" />
            </div>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#9E7728] font-medium">
              Guest Order Tracking
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#6B2737] mt-0.5 font-normal">
              Track My Order
            </h1>
            <p className="text-xs text-stone-500 mt-2 font-light">
              Enter the 10-digit mobile number used during checkout to view your orders, live courier tracking, and verified reviews.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {providerMissing && (
            <div className="mb-5 p-4 bg-[#FAF8F4] border border-[#E9DFCE] rounded-2xl text-xs text-stone-700 space-y-2">
              <p className="font-medium text-[#6B2737]">
                SMS Gateway Dependency Notice:
              </p>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                The live SMS OTP provider is awaiting merchant credentials. You can also message our Pune studio concierge directly on WhatsApp for instant shipment tracking updates.
              </p>
              <a
                href="https://wa.me/919146686816?text=Hello%20MAHIRAANI%2C%20I%20would%20like%20to%20track%20my%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Track on WhatsApp Concierge</span>
              </a>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1.5">
                  10-Digit Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-3 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-[#6B2737] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="w-full py-3.5 px-4 bg-[#6B2737] hover:bg-[#521c29] text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B8922A]" />
                <span>No password required • Secure OTP authorization</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-stone-700 text-xs">
                <span>Code sent to <strong>+91 {phone}</strong></span>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1.5">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-3 bg-stone-50 border border-stone-200 rounded-xl text-center text-xl font-mono tracking-[0.5em] focus:outline-hidden focus:border-[#6B2737] focus:bg-white transition-colors"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3.5 px-4 bg-[#6B2737] hover:bg-[#521c29] text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify &amp; View Orders</span>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-stone-500 hover:text-stone-900"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  disabled={cooldown > 0}
                  onClick={() => handleSendOtp()}
                  className="text-[#6B2737] font-medium hover:underline disabled:text-stone-400 disabled:no-underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* ── View 2: Verified Customer Orders ── */
        <div className="space-y-6">
          {/* Customer Bar */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-[#B8922A] flex items-center justify-center border border-amber-200 font-serif font-bold text-base">
                {customer.name?.charAt(0) || "M"}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                  Verified Customer Session
                </p>
                <h2 className="font-serif text-lg text-stone-900">
                  {customer.name} • <span className="font-mono text-sm text-stone-600">+91 {customer.phone}</span>
                </h2>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Number</span>
            </button>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif text-2xl text-stone-800 mb-2">No Orders Found</h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                We couldn&apos;t find any web orders placed with mobile number <strong>+91 {customer.phone}</strong>. If you used a different mobile number at checkout, click &ldquo;Switch Number&rdquo; above.
              </p>
              <Link
                href="/collections/all"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#6B2737] text-white rounded-full text-xs uppercase tracking-wider font-medium"
              >
                Browse Jewellery Catalogue
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-xs text-stone-500 font-medium">
                Showing <strong>{orders.length}</strong> order(s) for your mobile number
              </p>

              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-stone-300 transition-colors"
                >
                  {/* Order Top Bar */}
                  <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900 text-sm">
                          {order.reference}
                        </span>
                        {getStatusBadge(order.fulfilmentStatus)}
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-serif font-bold text-[#6B2737]">
                        {formatINR(order.totalPaise)}
                      </span>
                      <p className="text-[11px]">{getPaymentBadge(order.paymentStatus)}</p>
                    </div>
                  </div>

                  {/* Delivery & Tracking Details */}
                  <div className="p-4 sm:p-5 border-b border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-700 bg-stone-50/40">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                        Delivery Destination
                      </p>
                      <p className="font-medium text-stone-900">
                        {order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ""}
                      </p>
                      <p className="text-stone-500">
                        {order.city}, {order.state} - {order.pincode}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                        Shipment &amp; Courier Tracking
                      </p>
                      {order.courierName || order.trackingNumber ? (
                        <div className="space-y-1">
                          <p className="font-medium text-stone-900 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#B8922A]" />
                            <span>{order.courierName || "Insured Express Courier"}</span>
                          </p>
                          <p className="text-stone-500 font-mono text-[11px]">
                            AWB: {order.trackingNumber}
                          </p>
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#6B2737] font-semibold underline text-[11px] mt-0.5"
                            >
                              <span>Track on Courier Portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-stone-500 text-[11px] italic">
                          Courier tracking details will update once your order is dispatched from Pune.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="p-4 sm:p-5 divide-y divide-stone-100">
                    {order.items.map((item) => {
                      const existingReview = order.reviews?.find((r) => r.productId === item.productId);
                      const isDelivered = order.fulfilmentStatus === "delivered";

                      return (
                        <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden relative shrink-0 border border-stone-200">
                              {item.product?.images?.[0]?.url ? (
                                <Image
                                  src={item.product.images[0].url}
                                  alt={item.snapshotName}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-stone-900">{item.snapshotName}</p>
                              {item.snapshotVariantName && (
                                <p className="text-[11px] text-[#6B2737] font-medium">{item.snapshotVariantName}</p>
                              )}
                              <p className="text-xs text-stone-500 mt-0.5">
                                Qty: {item.quantity} • {formatINR(item.snapshotUnitPaise)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {/* Review Action */}
                            {existingReview ? (
                              <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Reviewed ({existingReview.rating}★)</span>
                              </div>
                            ) : isDelivered ? (
                              <button
                                onClick={() =>
                                  setReviewModalItem({
                                    orderId: order.id,
                                    productId: item.productId,
                                    productName: item.snapshotName,
                                  })
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#B8922A] hover:bg-[#9E7728] text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                              >
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>Write Review</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-stone-400 italic">
                                Review available after delivery
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Verified Buyer Review Modal ── */}
      {reviewModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#FAF8F4] border border-[#E9DFCE] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setReviewModalItem(null)}
              className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
              aria-label="Close review modal"
            >
              <X className="w-5 h-5" />
            </button>

            {reviewSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl text-[#6B2737]">Thank You For Your Review</h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  Your feedback has been verified and submitted for moderation. Approved reviews with the &ldquo;Verified Purchase&rdquo; badge appear publicly on the product page.
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#B8922A] mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Buyer Review</span>
                  </div>
                  <h3 className="font-serif text-2xl text-stone-900">
                    Review {reviewModalItem.productName}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Share your experience with the craftsmanship, luster, and packaging.
                  </p>
                </div>

                {reviewError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    {reviewError}
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                  {/* Star Rating Selection */}
                  <div>
                    <label className="block text-stone-700 font-medium mb-1.5">Rating *</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= rating
                                ? "fill-[#B8922A] text-[#B8922A]"
                                : "fill-stone-200 text-stone-300"
                            } transition-colors hover:scale-110`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-semibold text-stone-700 ml-2">
                        {rating} out of 5 stars
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Display Name *</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Review Headline (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Stunning anti-tarnish finish for wedding wear"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Your Written Review *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about the weight, packaging, luster, and feel of this jewellery piece..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={reviewSubmitting || !comment.trim()}
                      className="w-full py-3.5 px-4 bg-[#6B2737] hover:bg-[#521c29] text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                    >
                      {reviewSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Verified Review</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

