// src/app/policies/shipping/page.tsx – Shipping Policy

import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import Link from "next/link";
import { ChevronRight, Truck, Clock, MapPin, Package, CreditCard } from "lucide-react";

export const metadata = {
  title: "Shipping Policy | Mahiraani",
  description: "Mahiraani's shipping timeline, pan-India delivery details and free shipping thresholds.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-8">
          <Link href="/" className="hover:text-stone-900">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-medium">Shipping Policy</span>
        </nav>

        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-xs space-y-8">
          <div className="border-b border-stone-200 pb-6">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#9E7728] font-semibold">
              Mahiraani Customer Care
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#6B2737] mt-1">
              Shipping Policy
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-light mt-2 italic">
              Every order deserves a little journey of its own.
            </p>
          </div>

          <div className="space-y-6 text-sm text-stone-700 leading-relaxed">
            <div className="p-5 bg-[#FAF8F4] rounded-2xl border border-stone-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-stone-200 shadow-xs">
                <Truck className="w-5 h-5 text-[#B8922A]" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">Shipping is on us!</h3>
                <p className="mt-1 text-stone-600">
                  Enjoy <strong>free shipping on orders above ₹900</strong>, across India.
                </p>
              </div>
            </div>

            <div className="p-5 bg-[#FAF8F4] rounded-2xl border border-stone-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-stone-200 shadow-xs">
                <Package className="w-5 h-5 text-[#B8922A]" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">We’ll get your order ready</h3>
                <p className="mt-1 text-stone-600">
                  Orders are packed and dispatched within <strong>24–48 hours</strong> of confirmation.
                </p>
              </div>
            </div>

            <div className="p-5 bg-[#FAF8F4] rounded-2xl border border-stone-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-stone-200 shadow-xs">
                <Clock className="w-5 h-5 text-[#B8922A]" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">A little wait, a lot of love</h3>
                <p className="mt-1 text-stone-600">
                  Your order should reach you in around <strong>5–7 business days</strong>, depending on your pincode.
                </p>
              </div>
            </div>

            <div className="p-5 bg-[#FAF8F4] rounded-2xl border border-stone-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-stone-200 shadow-xs">
                <MapPin className="w-5 h-5 text-[#B8922A]" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">Curious where your order is?</h3>
                <p className="mt-1 text-stone-600">
                  Once dispatched, we share your courier tracking link and AWB number via WhatsApp and email. You can also message our WhatsApp concierge (<strong>+91 9146686816</strong>) anytime for real-time tracking updates.
                </p>
              </div>
            </div>

            <div className="p-5 bg-[#FAF8F4] rounded-2xl border border-stone-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-stone-200 shadow-xs">
                <CreditCard className="w-5 h-5 text-[#B8922A]" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">Prepaid Orders Only</h3>
                <p className="mt-1 text-stone-600">
                  All orders are processed as prepaid via secure online payments (UPI, Google Pay, PhonePe, Cards, Net Banking). Please note that <strong>we do not offer Cash on Delivery (COD)</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-stone-200">
            <p className="text-xs text-stone-500 italic">
              Thank you for choosing Mahiraani and supporting our little dream. 💗
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
