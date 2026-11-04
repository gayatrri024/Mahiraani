// src/app/admin/(dashboard)/page.tsx – Owner-Friendly Admin Dashboard
import { connection } from "next/server";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { formatINR } from "@/lib/money";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  ExternalLink,
  Plus,
  ShoppingBag,
  Star,
  ArrowRight,
} from "lucide-react";

export const instant = false;

export default async function AdminDashboardPage() {
  await connection();
  const session = await getAdminSession();
  const ownerName = session?.name || "Store Owner";

  const [
    totalProducts,
    publishedCount,
    draftCount,
    ordersCount,
    reviewsCount,
    recentProducts,
    lowStockProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "published" } }),
    prisma.product.count({ where: { status: "draft" } }),
    prisma.order.count(),
    prisma.review.count({ where: { status: "pending" } }),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        images: { where: { isCover: true }, take: 1 },
        category: { select: { name: true } },
      },
    }),
    prisma.product.findMany({
      where: {
        status: "published",
        hasVariants: false,
        stock: { lte: 3 },
      },
      take: 4,
      include: {
        images: { where: { isCover: true }, take: 1 },
      },
    }),
  ]);

  const currentDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* ─── 1. Welcome Header & Quick Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#D4AB48] font-medium block">
            MAHIRAANI Administration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal mt-1">
            Welcome back, {ownerName}
          </h1>
          <p className="text-xs text-stone-300 mt-1">{currentDate}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#B8922A] hover:bg-[#9E7728] text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-medium transition-colors border border-white/15"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-300" />
          </Link>
        </div>
      </div>

      {/* ─── 2. Metric Overview Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium text-stone-600">Total Jewellery</span>
            <Package className="w-5 h-5 text-stone-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-stone-900">{totalProducts}</span>
            <span className="text-xs text-stone-400">pieces</span>
          </div>
          <p className="text-[11px] text-stone-500">In catalogue database</p>
        </div>

        {/* Live on Storefront */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-medium text-stone-600">Live on Store</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-emerald-700">{publishedCount}</span>
            <span className="text-xs text-emerald-600 font-medium">published</span>
          </div>
          <p className="text-[11px] text-stone-500">Visible to customer visitors</p>
        </div>

        {/* Drafts & Inactive */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium text-stone-600">Drafts / Hidden</span>
            <FileEdit className="w-5 h-5 text-stone-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-stone-800">{draftCount}</span>
            <span className="text-xs text-stone-400">drafts</span>
          </div>
          <p className="text-[11px] text-stone-500">Not visible on customer site</p>
        </div>

        {/* Customer Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#B8922A]">
            <span className="text-xs font-medium text-stone-600">Web Orders</span>
            <ShoppingBag className="w-5 h-5 text-[#B8922A]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-stone-900">{ordersCount}</span>
            <span className="text-xs text-stone-400">placed</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <Link href="/admin/orders" className="text-[#6B2737] hover:underline font-medium">
              View all orders →
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 3. Action Alerts & Attention Banners ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Low Stock Alert Box */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-800 font-medium text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Inventory Stock Status</span>
            </div>
            <Link href="/admin/products" className="text-xs text-stone-500 hover:text-stone-900">
              Manage stock →
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3 text-xs text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>All published jewellery pieces have healthy stock levels.</span>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/80 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 overflow-hidden shrink-0">
                      {p.images[0]?.url ? (
                        <Image
                          src={p.images[0].url}
                          alt={p.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                          ◈
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-stone-800 truncate">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-amber-800">
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="px-2 py-1 bg-white border border-stone-200 rounded text-[11px] font-medium text-stone-700 hover:bg-stone-50"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Reviews & Store Moderation */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-800 font-medium text-sm">
              <Star className="w-4 h-4 text-[#B8922A]" />
              <span>Verified Customer Reviews</span>
            </div>
            <Link href="/admin/reviews" className="text-xs text-stone-500 hover:text-stone-900">
              Review queue →
            </Link>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-xs">
            <div>
              <p className="font-medium text-stone-800">
                {reviewsCount === 0
                  ? "No reviews awaiting moderation"
                  : `${reviewsCount} review${reviewsCount === 1 ? "" : "s"} waiting for approval`}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Only verified purchasers can submit reviews on MAHIRAANI.
              </p>
            </div>
            <Link
              href="/admin/reviews"
              className="px-3 py-1.5 bg-[#6B2737] text-white rounded-lg text-xs font-semibold hover:bg-[#521c29] shrink-0 ml-3"
            >
              Open Reviews
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 4. Recent Products List ─── */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Recently Updated Products</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Quick access to your most recently updated jewellery pieces
            </p>
          </div>
          <Link
            href="/admin/products"
            className="text-xs text-[#6B2737] hover:underline font-semibold flex items-center gap-1"
          >
            <span>View all products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p className="text-sm">No products in catalogue yet.</p>
            <Link
              href="/admin/products/new"
              className="mt-3 inline-block px-4 py-2 bg-[#B8922A] text-white rounded-xl text-xs font-semibold"
            >
              Add First Product
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentProducts.map((p) => (
              <div
                key={p.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-stone-50/50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                    {p.images[0]?.url ? (
                      <Image
                        src={p.images[0].url}
                        alt={p.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
                        ◈
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-stone-800 truncate">{p.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {p.category?.name || "Uncategorized"} · {p.basePrice ? formatINR(p.basePrice) : "Price not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      p.status === "published"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {p.status === "published" ? "Live" : "Draft"}
                  </span>

                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="px-3 py-1.5 border border-stone-200 hover:bg-stone-100 rounded-lg text-xs font-medium text-stone-700 transition-colors"
                  >
                    Edit
                  </Link>

                  {p.status === "published" && (
                    <Link
                      href={`/products/${p.slug}`}
                      target="_blank"
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
                      title="View on Storefront"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
