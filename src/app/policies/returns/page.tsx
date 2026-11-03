// src/app/policies/returns/page.tsx – Returns, Exchanges & Cancellations Policy

import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Returns & Exchange Policy | Mahiraani",
  description: "Mahiraani's policy on returns, exchanges, cancellations and refunds.",
};

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-8">
          <Link href="/" className="hover:text-stone-900">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-medium">Returns & Exchange</span>
        </nav>

        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-xs space-y-8">
          <div className="border-b border-stone-200 pb-6">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#9E7728] font-semibold">
              Mahiraani Customer Care
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#6B2737] mt-1">
              Returns & Exchange
            </h1>
          </div>

          {/* A Little Note on Returns */}
          <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
            <h2 className="font-serif text-2xl text-stone-900">
              A Little Note on Returns 🌸
            </h2>
            <p>
              Every Mahiraani piece is chosen with love, and we hope you love yours just as much!
            </p>
            <p>
              Since each item is special, <strong>we don’t accept returns or exchanges</strong>. However, if something isn’t quite right with your order, we’re here to help.
            </p>
          </div>

          {/* Here's what you need to know */}
          <div className="space-y-4 text-sm text-stone-700 leading-relaxed bg-[#FAF8F4] p-6 rounded-2xl border border-stone-200">
            <h3 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">
              Here’s what you need to know:
            </h3>
            <ul className="space-y-3 pl-2">
              <li className="flex items-start gap-2.5">
                <span className="text-[#6B2737] font-bold">•</span>
                <span>Let us know within <strong>48 hours of delivery</strong> if your jewellery has an issue.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#6B2737] font-bold">•</span>
                <span>Reach out to our customer care team directly on WhatsApp (<strong>+91 9146686816</strong>) or email <strong>care@mahiraani.com</strong> with your Order Reference ID.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#6B2737] font-bold">•</span>
                <span>Tell us what went wrong and <strong>share 3 clear photos of the jewellery piece</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#6B2737] font-bold">•</span>
                <span>Our team will review your enquiry and get back to you by email. If we need clearer photos, we’ll give you one more chance to share them.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#6B2737] font-bold">•</span>
                <span>Please note that raising an enquiry doesn’t guarantee a return, exchange, or refund. Each case will be reviewed by our team.</span>
              </li>
            </ul>
          </div>

          {/* Cancellations */}
          <div className="space-y-3 text-sm text-stone-700 leading-relaxed pt-2">
            <h2 className="font-serif text-2xl text-stone-900">
              Cancellations 🌸
            </h2>
            <p>Changed your mind? No worries!</p>
            <p>
              To request a cancellation before dispatch, contact our WhatsApp concierge (+91 9146686816) or email <strong>care@mahiraani.com</strong> with your Order Reference ID while your order is still in the <em>Confirmed</em> or <em>Packed</em> stage.
            </p>
            <p className="text-stone-600 italic">
              Once your order is on its way, cancellations are no longer possible. And just a little heads-up, we don’t accept returns or exchanges after delivery.
            </p>
          </div>

          {/* Refunds */}
          <div className="space-y-3 text-sm text-stone-700 leading-relaxed border-t border-stone-200 pt-6">
            <h2 className="font-serif text-2xl text-stone-900">
              Refunds
            </h2>
            <p>
              Approved refunds are issued to the original payment method within <strong>5–7 business days</strong> of us receiving the returned item.
            </p>
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
