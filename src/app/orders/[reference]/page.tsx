// src/app/orders/[reference]/page.tsx – Secure Guest Order Confirmation & Tracking
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import CleanUrlEffect from "@/components/storefront/CleanUrlEffect";
import { formatINR } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer";
import { getAdminSession } from "@/lib/auth";
import {
  CheckCircle2,
  Clock,
  Truck,
  MessageCircle,
  ChevronRight,
  ArrowRight,
  MapPin,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ reference: string }>;
  searchParams?: Promise<{ token?: string }>;
};

export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Order ${reference} Confirmation | MAHIRAANI`,
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  await connection();

  const { reference } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const token = resolvedSearchParams.token;

  const order = await prisma.order.findUnique({
    where: { reference },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: { take: 1, orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Security Verification:
  // 1. Order access token match (provided right after checkout)
  // 2. Verified customer session phone match
  // 3. Admin session
  const customerSession = await getCustomerSession();
  const adminSession = await getAdminSession();

  const isTokenAuthorized = Boolean(token && token === order.accessToken);
  const isCustomerAuthorized = Boolean(customerSession && customerSession.phone === order.customerPhone);
  const isAdminAuthorized = Boolean(adminSession);

  if (!isTokenAuthorized && !isCustomerAuthorized && !isAdminAuthorized) {
    // Unauthenticated access attempt: Do not expose order details or address. Redirect to OTP verification.
    redirect("/track-order");
  }

  const isPaid = order.paymentStatus === "paid";

  const waSlipUrl = `https://wa.me/919146686816?text=${encodeURIComponent(
    `*MAHIRAANI Order Confirmation Slip*\nOrder Ref: *${order.reference}*\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nCity: ${order.city}, ${order.state} (${order.pincode})\nTotal: ${formatINR(order.totalPaise)}\nStatus: ${order.paymentStatus === "paid" ? "Paid" : "Pending Verification"}\n\nPlease confirm dispatch timeline.`
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
      <CleanUrlEffect paramToRemove="token" />
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-8">
          <Link href="/" className="hover:text-stone-900">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <Link href="/track-order" className="hover:text-stone-900">
            My Orders
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-medium font-mono">{order.reference}</span>
        </nav>

        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-10 shadow-xs space-y-8">
          {/* Header Status Banner */}
          <div className="text-center space-y-2 border-b border-stone-100 pb-6">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#9E7728] font-semibold pt-1">
              {isPaid ? "Order & Payment Confirmed" : "Order Reserved • Verification in Progress"}
            </p>

            <h1 className="font-serif text-2xl sm:text-4xl text-[#6B2737] font-normal">
              Thank You, {order.customerName}
            </h1>

            <p className="text-xs text-stone-600">
              Your official order reference is{" "}
              <span className="font-mono font-bold text-stone-900 px-2 py-0.5 bg-stone-100 rounded border border-stone-200">
                {order.reference}
              </span>
            </p>
          </div>

          {/* Critical Clarity: Order Placed vs Payment Status */}
          <div className="p-4 sm:p-5 rounded-2xl border text-xs space-y-3 bg-[#FAF8F4] border-[#E8DCC8]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                Payment Status
              </span>
              {isPaid ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Paid &amp; Verified
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pending Concierge Verification
                </span>
              )}
            </div>

            <p className="text-stone-600 leading-relaxed text-[11px]">
              {isPaid
                ? "Your prepaid payment has been confirmed. Our Pune studio karigars are preparing your jewellery set for insured dispatch."
                : "Your order details have been securely recorded in our database. Since online gateway credentials are currently undergoing merchant validation, our Pune concierge will verify payment receipt via WhatsApp or UPI before dispatch."}
            </p>
          </div>

          {/* Delivery & Tracking Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900 mb-1 text-[11px] uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#B8922A]" />
                <span>Delivery Destination</span>
              </div>
              <p className="font-medium text-stone-900">{order.customerName}</p>
              <p className="text-stone-600">
                {order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ""}
              </p>
              <p className="text-stone-600">{order.city}, {order.state} - {order.pincode}</p>
              <p className="text-stone-500 font-mono mt-1">+91 {order.customerPhone}</p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900 mb-1 text-[11px] uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5 text-[#B8922A]" />
                <span>Fulfilment &amp; Courier</span>
              </div>
              <p className="font-medium text-stone-900">
                {order.fulfilmentStatus.toUpperCase()}
              </p>
              {order.courierName || order.trackingNumber ? (
                <div className="space-y-0.5 pt-1">
                  <p className="text-stone-700">Courier: {order.courierName || "Express Courier"}</p>
                  <p className="text-stone-500 font-mono text-[11px]">AWB: {order.trackingNumber}</p>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#6B2737] font-semibold underline text-[11px] pt-1"
                    >
                      <span>Track Shipment</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-stone-500 text-[11px] pt-1">
                  Orders are packed and dispatched within 24–48 hours across India.
                </p>
              )}
            </div>
          </div>

          {/* Line Items Breakdown */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <div className="bg-stone-50 px-4 py-3 border-b border-stone-200 font-semibold text-xs text-stone-700">
              Ordered Jewellery Silhouettes
            </div>
            <div className="divide-y divide-stone-100 p-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs pt-3 first:pt-0">
                  <div>
                    <p className="font-semibold text-stone-900">{item.snapshotName}</p>
                    {item.snapshotVariantName && (
                      <p className="text-[11px] text-[#6B2737]">{item.snapshotVariantName}</p>
                    )}
                    <p className="text-stone-400 text-[11px]">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-stone-900">
                    {formatINR(item.snapshotUnitPaise * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-stone-50/70 p-4 border-t border-stone-200 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(order.subtotalPaise)}</span>
              </div>
              {order.totalPaise > order.subtotalPaise && (
                <div className="flex justify-between text-[#6B2737]">
                  <span>Signature Gift Packaging</span>
                  <span>+{formatINR(order.totalPaise - order.subtotalPaise)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Insured Express Shipping</span>
                <span className="text-emerald-700 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 font-bold text-stone-900 text-sm">
                <span>Total Amount</span>
                <span className="font-serif text-[#6B2737] text-base">
                  {formatINR(order.totalPaise)}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={waSlipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Send Order Slip to WhatsApp</span>
            </a>

            <Link
              href="/track-order"
              className="py-3.5 px-6 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <span>View in My Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-stone-400">
              You can return anytime and track this order using your mobile number at{" "}
              <Link href="/track-order" className="text-[#6B2737] underline font-medium">
                mahiraani.com/track-order
              </Link>
            </p>
          </div>
        </div>
      </main>

      <CartDrawer />
      <MobileStickyBar />
      <Footer />
    </div>
  );
}

