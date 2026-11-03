"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Package,
  ShieldCheck,
  Clock,
  Loader2,
} from "lucide-react";

export interface ReviewRow {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  customerName: string;
  isVerifiedPurchase: boolean;
  status: string;
  images: string | null;
  adminNotes: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images?: Array<{ url: string }>;
  };
  order: {
    id: string;
    reference: string;
    customerName: string;
    customerPhone: string;
    fulfilmentStatus: string;
  };
}

export default function ReviewsListClient({
  initialReviews = [],
}: {
  initialReviews: ReviewRow[];
}) {
  const [reviews, setReviews] = useState<ReviewRow[]>(initialReviews);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Compute metrics
  const totalReviews = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const avgRating =
    approvedCount > 0
      ? (
          reviews
            .filter((r) => r.status === "approved")
            .reduce((acc, r) => acc + r.rating, 0) / approvedCount
        ).toFixed(1)
      : "—";

  async function handleStatusChange(id: string, status: "approved" | "rejected") {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      }
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setActionLoadingId(null);
    }
  }

  const filteredReviews = reviews.filter((r) => {
    if (activeTab !== "all" && r.status !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchComment = r.comment.toLowerCase().includes(q);
      const matchCustomer = r.customerName.toLowerCase().includes(q);
      const matchProduct = r.product.name.toLowerCase().includes(q);
      const matchOrder = r.order.reference.toLowerCase().includes(q);
      return matchComment || matchCustomer || matchProduct || matchOrder;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-1">
            Total Reviews
          </p>
          <p className="text-2xl font-bold text-stone-800">{totalReviews}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-1">
            Pending Moderation
          </p>
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-1">
            Approved &amp; Public
          </p>
          <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-1">
            Avg Public Rating
          </p>
          <p className="text-2xl font-bold text-[#6B2737] flex items-center gap-1">
            <span>{avgRating}</span>
            {avgRating !== "—" && <Star className="w-5 h-5 fill-current text-[#B8922A]" />}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {[
              { id: "all", label: "All Reviews" },
              { id: "pending", label: `Pending (${pendingCount})` },
              { id: "approved", label: `Approved (${approvedCount})` },
              { id: "rejected", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviewer, product, order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-hidden focus:bg-white focus:border-stone-400"
            />
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs">
          <Star className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-xl text-stone-800 mb-1">No Reviews Found</h3>
          <p className="text-xs text-stone-500 font-light">
            Verified buyer reviews submitted via post-delivery invitations and the customer order tracking portal will appear here for admin moderation.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Review Content</th>
                  <th className="py-3 px-4">Customer &amp; Order</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Product */}
                    <td className="py-3 px-4 max-w-[180px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden relative shrink-0 border border-stone-200">
                          {rev.product?.images?.[0]?.url ? (
                            <Image
                              src={rev.product.images[0].url}
                              alt={rev.product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/products/${rev.product.slug}`}
                          target="_blank"
                          className="font-medium text-stone-900 hover:text-[#6B2737] line-clamp-2"
                        >
                          {rev.product.name}
                        </Link>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-4 shrink-0">
                      <div className="flex items-center gap-0.5 text-[#B8922A]">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
                        {rev.rating} / 5
                      </span>
                    </td>

                    {/* Content */}
                    <td className="py-3 px-4 max-w-xs">
                      {rev.title && (
                        <p className="font-semibold text-stone-900 mb-0.5 line-clamp-1">
                          {rev.title}
                        </p>
                      )}
                      <p className="text-stone-600 line-clamp-2 leading-relaxed">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Customer & Order */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-stone-900">{rev.customerName}</p>
                      <div className="flex items-center gap-1 text-[11px] text-stone-500 font-mono mt-0.5">
                        <span>Ref: {rev.order.reference}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1">
                        <ShieldCheck className="w-3 h-3 text-[#B8922A]" />
                        <span>Verified Buyer</span>
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {rev.status === "approved" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : rev.status === "rejected" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {actionLoadingId === rev.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-stone-400 ml-auto" />
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {rev.status !== "approved" && (
                            <button
                              onClick={() => handleStatusChange(rev.id, "approved")}
                              title="Approve for public display"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {rev.status !== "rejected" && (
                            <button
                              onClick={() => handleStatusChange(rev.id, "rejected")}
                              title="Reject review"
                              className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded text-xs font-medium transition-colors"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(rev.id)}
                            title="Delete spam"
                            className="p-1 text-stone-400 hover:text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

