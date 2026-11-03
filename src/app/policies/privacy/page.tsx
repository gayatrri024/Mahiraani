// src/app/policies/privacy/page.tsx – Privacy Policy
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MAHIRAANI",
  description: "Learn how MAHIRAANI collects, protects, and handles your personal information.",
};

export default function PrivacyPolicyPage() {
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
          <span className="text-stone-900 font-medium">Privacy Policy</span>
        </nav>

        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-xs space-y-8">
          <div className="border-b border-stone-200 pb-6">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#9E7728] font-semibold">
              MAHIRAANI Legal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#6B2737] mt-1">
              Privacy Policy
            </h1>
            <p className="text-xs text-stone-400 mt-2 font-mono">
              Last updated: November 2026 • Pune, Maharashtra, India
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed font-light">
            <p>
              At <strong>MAHIRAANI</strong>, we hold your trust in the highest regard. This Privacy Policy details how we collect, store, and protect your information when you browse our boutique website, communicate with our WhatsApp concierge, or place an order.
            </p>

            <div className="space-y-3">
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                1. Information We Collect
              </h2>
              <p>
                When you reserve or place an order through MAHIRAANI, we collect essential details required for delivery and concierge support:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li><strong>Customer Contact Details:</strong> Full name, telephone/WhatsApp mobile number, and email address.</li>
                <li><strong>Delivery Destination:</strong> Shipping address, apartment or house number, city, state, and postal PIN code.</li>
                <li><strong>Transaction Records:</strong> Order reference ID, purchased silhouettes, and payment transaction identifiers.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                2. Payment Information &amp; Security
              </h2>
              <p>
                We do not store your debit/credit card credentials, CVV, or net banking passwords. All online prepaid transactions are processed through certified, RBI-compliant third-party payment gateways with industry-standard 256-bit SSL encryption.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                3. Purpose of Processing
              </h2>
              <p>Your details are used exclusively to:</p>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>Pack and dispatch your jewellery order safely with insured courier partners.</li>
                <li>Send delivery milestones, AWB courier tracking, and order confirmations.</li>
                <li>Provide personalized customer support through our WhatsApp concierge.</li>
                <li>Comply with statutory tax and accounting obligations in India.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                4. Third-Party Sharing
              </h2>
              <p>
                We never sell, rent, or trade your personal information to third parties. We share data solely with trusted operational partners strictly necessary to fulfil your order:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>Logistics and courier partners (e.g. Shiprocket, Bluedart, Delhivery) for doorstep delivery.</li>
                <li>Secure payment processors for authorized payment verification.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-xl text-stone-900 font-normal">
                5. Contact Regarding Your Data
              </h2>
              <p>
                If you have questions regarding this policy or wish to update or delete your customer contact details from our records, please reach out to us at:
              </p>
              <div className="p-4 bg-[#FAF8F4] border border-stone-200 rounded-xl space-y-1 text-stone-700">
                <p><strong>MAHIRAANI Client Care</strong></p>
                <p>Email: <a href="mailto:care@mahiraani.com" className="text-[#6B2737] underline">care@mahiraani.com</a></p>
                <p>WhatsApp Concierge: +91 9146686816</p>
                <p>Location: Pune, Maharashtra, India</p>
              </div>
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
