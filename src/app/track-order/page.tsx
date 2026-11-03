// src/app/track-order/page.tsx – Guest Order Tracking & Purchase Portal
import { connection } from "next/server";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import TrackOrderClient from "@/components/storefront/TrackOrderClient";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCustomerSession } from "@/lib/customer";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track My Order | MAHIRAANI",
  description: "Secure guest order tracking, courier updates, and verified reviews for MAHIRAANI jewellery.",
};

export const instant = false;

export default async function TrackOrderPage() {
  await connection();

  const session = await getCustomerSession();
  let initialOrders: unknown[] = [];

  if (session) {
    initialOrders = await prisma.order.findMany({
      where: {
        customerPhone: session.phone,
      },
      orderBy: { createdAt: "desc" },
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
        reviews: {
          select: {
            id: true,
            productId: true,
            rating: true,
            status: true,
          },
        },
      },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-8">
          <Link href="/" className="hover:text-stone-900">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-medium">Track Order &amp; Purchases</span>
        </nav>

        <TrackOrderClient
          initialCustomer={session}
          initialOrders={JSON.parse(JSON.stringify(initialOrders))}
        />
      </main>

      <CartDrawer />
      <MobileStickyBar />
      <Footer />
    </div>
  );
}

