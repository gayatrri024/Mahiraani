// src/app/reviews/write/page.tsx – Secure Guest Review Submission Page
import { connection } from "next/server";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import GuestReviewClient from "@/components/storefront/GuestReviewClient";
import CleanUrlEffect from "@/components/storefront/CleanUrlEffect";
import Link from "next/link";
import { ChevronRight, ShieldCheck, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verifyScopedReviewToken } from "@/lib/otp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Verified Review | MAHIRAANI",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Props = {
  searchParams: Promise<{
    order?: string;
    token?: string;
    product?: string;
  }>;
};

export const instant = false;

export default async function WriteReviewPage({ searchParams }: Props) {
  await connection();
  const { order: orderRef, token, product: productId } = await searchParams;

  if (!orderRef || !token || !productId) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
            <h1 className="font-serif text-2xl text-stone-900">Invalid Review Link</h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              This review link appears to be incomplete. Please use the official link provided in your delivery confirmation or access your orders via Track My Order.
            </p>
            <Link
              href="/track-order"
              className="inline-block mt-2 px-5 py-2.5 bg-[#6B2737] text-white rounded-xl text-xs font-semibold uppercase tracking-wider"
            >
              Track My Orders
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Look up order
  const order = await prisma.order.findUnique({
    where: { reference: orderRef },
    include: {
      items: {
        where: { productId },
        include: { product: true },
      },
      reviews: {
        where: { productId },
      },
    },
  });

  const isTokenValid = Boolean(
    order && (order.accessToken === token || verifyScopedReviewToken(order.id, productId, token))
  );

  if (!order || !isTokenValid) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
            <h1 className="font-serif text-2xl text-stone-900">Unauthorized</h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              We could not authenticate this review invitation. Please ensure you are opening the link sent to your registered contact.
            </p>
            <Link
              href="/track-order"
              className="inline-block mt-2 px-5 py-2.5 bg-[#6B2737] text-white rounded-xl text-xs font-semibold uppercase tracking-wider"
            >
              Go to Track My Order
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (order.fulfilmentStatus !== "delivered") {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
            <h1 className="font-serif text-2xl text-stone-900">Delivery in Progress</h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              Reviews can only be submitted after your order has been successfully delivered. Current status: <strong>{order.fulfilmentStatus.toUpperCase()}</strong>.
            </p>
            <Link
              href={`/orders/${order.reference}?token=${order.accessToken}`}
              className="inline-block mt-2 px-5 py-2.5 bg-[#6B2737] text-white rounded-xl text-xs font-semibold uppercase tracking-wider"
            >
              View Order Tracking
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (order.reviews && order.reviews.length > 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
            <h1 className="font-serif text-2xl text-stone-900">Review Already Submitted</h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              You have already submitted a verified review for this purchase. Thank you for your valuable feedback!
            </p>
            <Link
              href="/track-order"
              className="inline-block mt-2 px-5 py-2.5 bg-[#6B2737] text-white rounded-xl text-xs font-semibold uppercase tracking-wider"
            >
              Return to My Orders
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const purchasedItem = order.items[0];
  if (!purchasedItem) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <AlertCircle className="w-10 h-10 text-stone-400 mx-auto" />
            <h1 className="font-serif text-2xl text-stone-900">Product Not Found in Order</h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              This product does not match any item in order {order.reference}.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
      <CleanUrlEffect paramToRemove="token" />
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-8">
          <Link href="/" className="hover:text-stone-900">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <Link href="/track-order" className="hover:text-stone-900">
            Orders
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-medium">Verified Review</span>
        </nav>

        <GuestReviewClient
          orderId={order.id}
          orderRef={order.reference}
          orderToken={order.accessToken}
          productId={productId}
          productName={purchasedItem.snapshotName}
          customerName={order.customerName}
        />
      </main>

      <CartDrawer />
      <MobileStickyBar />
      <Footer />
    </div>
  );
}

