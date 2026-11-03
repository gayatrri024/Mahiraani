"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  X,
  Sparkles,
  Calendar,
  UserCheck,
} from "lucide-react";

export type ReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  customerName: string;
  isVerifiedPurchase: boolean;
  images?: string | null;
  createdAt: string | Date;
};

export type ReviewStats = {
  totalReviews: number;
  averageRating: number;
  ratingCounts: Record<number, number>;
};

export type ViewerEligibility = {
  isEligible: boolean;
  eligibleOrderId: string | null;
  customerName: string | null;
};

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
  initialReviews: ReviewItem[];
  initialStats: ReviewStats;
  viewerEligibility?: ViewerEligibility;
}

export default function ProductReviewsSection({
  productId,
  productName,
  initialReviews,
  initialStats,
  viewerEligibility = { isEligible: false, eligibleOrderId: null, customerName: null },
}: ProductReviewsSectionProps) {
  const [reviews] = useState<ReviewItem[]>(initialReviews);
  const [stats] = useState<ReviewStats>(initialStats);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);

  // Review modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [customerName, setCustomerName] = useState(viewerEligibility.customerName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const filteredReviews = reviews.filter((r) => {
    if (selectedRatingFilter !== null && r.rating !== selectedRatingFilter) {
      return false;
    }
    return true;
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewerEligibility.eligibleOrderId) {
      setSubmitError("Eligible order not found for this review submission.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: viewerEligibility.eligibleOrderId,
          productId,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
          customerName: customerName.trim() || "Verified Patron",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setSubmitSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="patron-reviews" className="mt-20 pt-16 border-t border-stone-200">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#B8922A] font-semibold">
              Patron Impressions
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              100% Verified Purchases
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 tracking-tight">
            Reviews & Reflections
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-light mt-1">
            Genuine experiences shared by verified owners of this handcrafted piece.
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold transition-all shadow-xs flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B8922A]" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* Ratings Summary Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Average Rating Score */}
          <div className="md:col-span-4 text-center md:text-left md:border-r border-stone-100 md:pr-8">
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="font-serif text-5xl sm:text-6xl text-stone-900 font-bold">
                {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : "—"}
              </span>
              <span className="text-stone-400 text-lg font-serif">/ 5.0</span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-1 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(stats.averageRating)
                      ? "text-[#B8922A] fill-[#B8922A]"
                      : "text-stone-200"
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-stone-500 mt-1">
              Based on {stats.totalReviews}{" "}
              {stats.totalReviews === 1 ? "verified patron review" : "verified patron reviews"}
            </p>
          </div>

          {/* Star Rating Breakdown Bars */}
          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.ratingCounts[stars] || 0;
              const percentage =
                stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
              const isSelected = selectedRatingFilter === stars;

              return (
                <button
                  key={stars}
                  onClick={() =>
                    setSelectedRatingFilter(isSelected ? null : stars)
                  }
                  className={`w-full flex items-center gap-3 text-xs group transition-colors p-1 rounded-lg ${
                    isSelected ? "bg-stone-50 font-medium" : "hover:bg-stone-50/60"
                  }`}
                >
                  <span className="w-12 text-stone-600 font-medium text-left flex items-center gap-1 shrink-0">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 text-[#B8922A] fill-[#B8922A]" />
                  </span>

                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B8922A] rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="w-8 text-stone-400 text-right font-mono text-[11px] shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Tabs / Clear Filter */}
      {selectedRatingFilter !== null && (
        <div className="flex items-center justify-between mb-6 bg-stone-100/80 px-4 py-2 rounded-xl text-xs">
          <span className="text-stone-700">
            Showing only <strong>{selectedRatingFilter}-star</strong> reviews ({filteredReviews.length})
          </span>
          <button
            onClick={() => setSelectedRatingFilter(null)}
            className="text-[#6B2737] hover:underline font-semibold"
          >
            Show All
          </button>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#FBF7EE] text-[#B8922A] mx-auto flex items-center justify-center mb-4 border border-[#EADBBD]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-2xl text-stone-900 mb-2">No Reviews Yet</h3>
          <p className="text-xs text-stone-600 leading-relaxed font-light mb-6">
            Be the first patron to share impressions of this piece. All reviews on MAHIRAANI
            are verified through authentic order delivery to protect trust and authenticity.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6B2737] hover:bg-[#521c29] text-white text-xs uppercase tracking-wider font-semibold transition-all shadow-xs"
          >
            <span>Share Your Experience</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 text-stone-500 text-xs">
          No reviews found matching the {selectedRatingFilter}-star filter.{" "}
          <button
            onClick={() => setSelectedRatingFilter(null)}
            className="text-[#6B2737] underline font-medium"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header: Stars & Verified Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? "text-[#B8922A] fill-[#B8922A]"
                            : "text-stone-200"
                        }`}
                      />
                    ))}
                  </div>

                  {rev.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified Purchase
                    </span>
                  )}
                </div>

                {/* Title */}
                {rev.title && (
                  <h4 className="font-serif text-base text-stone-900 font-semibold mb-2">
                    {rev.title}
                  </h4>
                )}

                {/* Comment */}
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light mb-4">
                  {rev.comment}
                </p>
              </div>

              {/* Author & Date Footer */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span className="font-medium text-stone-800">{rev.customerName}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-300" />
                  {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Submission or Guidance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSubmitSuccess(false);
                setSubmitError("");
              }}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl text-stone-900 mb-2">
                  Review Received with Gratitude
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light mb-6">
                  Thank you for sharing your experience with the <strong>{productName}</strong>.
                  Your review has been verified and will appear on the live storefront once reviewed
                  by our concierge team.
                </p>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSubmitSuccess(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 text-white text-xs uppercase tracking-wider font-semibold hover:bg-stone-800 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : viewerEligibility.isEligible ? (
              // Eligible Customer: Direct Review Form
              <div>
                <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full text-xs font-medium w-fit mb-4">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Purchase Authenticated</span>
                </div>

                <h3 className="font-serif text-2xl text-stone-900 mb-1">
                  Review the {productName}
                </h3>
                <p className="text-xs text-stone-500 font-light mb-6">
                  Share your impressions on craftsmanship, finish, and feel.
                </p>

                {submitError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-stone-700 uppercase tracking-wider text-[11px] font-semibold mb-1.5">
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              star <= (hoverRating || rating)
                                ? "text-[#B8922A] fill-[#B8922A]"
                                : "text-stone-200"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-serif text-stone-800 text-sm">
                        {rating} out of 5
                      </span>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-stone-700 uppercase tracking-wider text-[11px] font-semibold mb-1">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Radhika S."
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#6B2737]"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-stone-700 uppercase tracking-wider text-[11px] font-semibold mb-1">
                      Headline / Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Breathtaking finish and comfortable wear"
                      maxLength={120}
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#6B2737]"
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-stone-700 uppercase tracking-wider text-[11px] font-semibold mb-1">
                      Your Detailed Review *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell future patrons about the weight, shine, fit, and packaging..."
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:border-[#6B2737]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#6B2737] hover:bg-[#521c29] text-white rounded-xl text-xs uppercase tracking-wider font-semibold shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting Review..." : "Submit Verified Review"}
                  </button>
                </form>
              </div>
            ) : (
              // Unverified Visitor Guidance
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#FAF8F4] text-[#6B2737] mx-auto flex items-center justify-center mb-4 border border-[#E8DCC8]">
                  <Lock className="w-6 h-6" />
                </div>

                <h3 className="font-serif text-2xl text-stone-900 mb-2">
                  Verified Patron Reviews
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light mb-6">
                  To protect our patrons from unverified claims and promotional noise, reviews on
                  MAHIRAANI are reserved strictly for genuine customers who have acquired and received
                  this piece.
                </p>

                <div className="p-4 bg-[#FAF8F4] rounded-xl border border-stone-200/80 text-left text-xs text-stone-700 space-y-2 mb-6">
                  <p className="font-semibold text-stone-900">Have you purchased this piece?</p>
                  <p className="text-stone-600 leading-relaxed">
                    1. Use <strong>Track My Order</strong> with the mobile number you entered at checkout.
                  </p>
                  <p className="text-stone-600 leading-relaxed">
                    2. Once your order is marked delivered, a one-click review option will be unlocked in your order ledger.
                  </p>
                  <p className="text-stone-600 leading-relaxed">
                    3. You may also click the review invitation link sent to your WhatsApp or SMS upon delivery.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/track-order"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 bg-[#6B2737] hover:bg-[#521c29] text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span>Track My Order to Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="py-3 px-4 border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

