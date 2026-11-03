// src/app/policies/terms/page.tsx – Terms of Service
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | MAHIRAANI",
  description: "Terms and conditions governing the purchase of jewellery from MAHIRAANI.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-8">
          <Link href="/" className="hover:text-stone-900">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-medium">Terms of Service</span>
        </nav>

        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-xs space-y-8">
          <div className="border-b border-stone-200 pb-6">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#9E7728] font-semibold">
              MAHIRAANI Legal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#6B2737] mt-1">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs text-stone-400 mt-2 font-mono">
              Last updated: November 2026 • Pune, Maharashtra, India
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed font-light">
            <p>
              Welcome to <strong>MAHIRAANI</strong>. By accessing our website, communicating with our WhatsApp concierge, or purchasing our jewellery, you agree to be bound by the following Terms &amp; Conditions.
            </p>

            <div className="space-y-3">
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                1. Brand &amp; Product Nature
              </h2>
              <p>
                MAHIRAANI operates from <strong>Pune, Maharashtra, India</strong>. Our jewellery is handcrafted and sourced from diverse artisanal craft regions across India.
              </p>
              <p>
                Our collections consist of high-grade fashion and festive jewellery featuring anti-tarnish protective coatings, kundan-polki settings, and brass/copper/alloy bases. Unless explicitly stated in certified documentation, items are not real bullion gold and do not carry BIS gold hallmarking.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                2. Pricing &amp; Prepaid Orders
              </h2>
              <p>
                All prices listed on the website are in Indian Rupees (INR) and are inclusive of applicable taxes.
              </p>
              <p>
                <strong>Prepaid Orders Only:</strong> We operate strictly on a prepaid basis via UPI, Net Banking, and Cards. We do not provide Cash on Delivery (COD). Orders are queued for dispatch upon receipt of payment confirmation.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                3. Shipping &amp; Delivery
              </h2>
              <p>
                We offer free insured delivery across India for orders above ₹900. Orders are dispatched from Pune within 24–48 business hours, and standard transit takes 5–7 business days depending on destination PIN code.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                4. Returns, Damages &amp; Cancellations
              </h2>
              <p>
                Owing to the artisanal nature of handcrafted jewellery, we do not accept standard returns or exchanges. In the rare event of transit damage or wrong item delivery, customers must notify us via WhatsApp or email within <strong>48 hours of delivery</strong> with clear photographic evidence.
              </p>
              <p>
                Cancellations can be requested prior to order dispatch by contacting our WhatsApp concierge. Once handed over to courier logistics, cancellations cannot be processed.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                5. Intellectual Property
              </h2>
              <p>
                The name <strong>MAHIRAANI</strong>, the seven-petal sacred lotus emblem, product imagery, styling graphics, and editorial copy are the intellectual property of MAHIRAANI. Unauthorized duplication or commercial misuse is prohibited.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                6. Governing Law
              </h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of India. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Pune, Maharashtra</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <CartDrawer />
      <MobileStickyBar />
      <Footer />
    </div>
  );
}

