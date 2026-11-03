"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ShieldCheck, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

interface GuestReviewClientProps {
  orderId: string;
  orderRef: string;
  orderToken: string;
  productId: string;
  productName: string;
  customerName: string;
}

export default function GuestReviewClient({
  orderId,
  orderRef,
  orderToken,
  productId,
  productName,
  customerName,
}: GuestReviewClientProps) {
  const [rating, setRating] = useState(5);
  const [displayName, setDisplayName] = useState(customerName);
  const [reviewTitle, setReviewTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          productId,
          orderToken,
          rating,
          title: reviewTitle || undefined,
          comment,
          customerName: displayName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit review.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network connection issue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-xs space-y-4 animate-fadeIn">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#9E7728] font-semibold">
          Review Recorded
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#6B2737]">
          Thank You, {displayName}
        </h2>
        <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
          Your feedback on <strong>{productName}</strong> has been received. Our team will review and approve it shortly. Approved reviews with the &ldquo;Verified Purchase&rdquo; badge will appear publicly on the jewellery page.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link
            href="/track-order"
            className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-stone-800 transition-colors"
          >
            Return to My Orders
          </Link>
          <Link
            href="/collections/all"
            className="px-6 py-2.5 bg-stone-100 text-stone-800 rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-stone-200 transition-colors"
          >
            Explore Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-10 shadow-xs space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-[#B8922A] mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified Buyer Review • Order {orderRef}</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-stone-900">
          Review {productName}
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Share your candid feedback with future patrons. We appreciate your honest thoughts on finishing, wearability, and packaging.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        <div>
          <label className="block text-stone-700 font-medium mb-2">Overall Rating *</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating
                      ? "fill-[#B8922A] text-[#B8922A]"
                      : "fill-stone-200 text-stone-300"
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-semibold text-stone-700 ml-2">
              {rating} / 5 Stars
            </span>
          </div>
        </div>

        <div>
          <label className="block text-stone-700 font-medium mb-1">Your Display Name *</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737] focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-stone-700 font-medium mb-1">Headline / Summary (optional)</label>
          <input
            type="text"
            placeholder="e.g. Elegant anti-tarnish finish, feels lightweight"
            value={reviewTitle}
            onChange={(e) => setReviewTitle(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737] focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-stone-700 font-medium mb-1">Your Detailed Review *</label>
          <textarea
            required
            rows={5}
            placeholder="How does the jewellery look and feel? Would you recommend it for festive celebrations or daily wear?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737] focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !comment.trim()}
          className="w-full py-3.5 px-4 bg-[#6B2737] hover:bg-[#521c29] text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Review...</span>
            </>
          ) : (
            <>
              <span>Submit Verified Review</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

