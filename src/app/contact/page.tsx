// src/app/contact/page.tsx – Contact MAHIRAANI
"use client";

import { useState } from "react";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import MobileStickyBar from "@/components/storefront/MobileStickyBar";
import Link from "next/link";
import { ChevronRight, MessageCircle, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-stone-900">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-8">
          <Link href="/" className="hover:text-stone-900">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-medium">Contact Concierge</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Info Panel */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#9E7728] font-semibold">
                Client Concierge
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#6B2737] mt-1 font-normal">
                Get in Touch
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-3 font-light leading-relaxed">
                Whether you need styling assistance, customization advice, or order dispatch updates, our team in Pune is here to help.
              </p>
            </div>

            <div className="space-y-5">
              <a
                href="https://wa.me/919146686816?text=Hello%20MAHIRAANI%2C%20I%20have%20an%20enquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex items-start gap-4 hover:border-emerald-300 transition-colors group block"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#25D366] shrink-0 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm">WhatsApp Concierge</h3>
                  <p className="text-xs text-stone-500 mt-0.5 font-mono">+91 9146686816</p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">Instant Chat &amp; Video Consultations</p>
                </div>
              </a>

              <a
                href="mailto:care@mahiraani.com"
                className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex items-start gap-4 hover:border-[#6B2737] transition-colors group block"
              >
                <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#6B2737] shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm">Email Care</h3>
                  <p className="text-xs text-stone-500 mt-0.5 font-mono">care@mahiraani.com</p>
                  <p className="text-[11px] text-stone-400 mt-1">Replies within 24 business hours</p>
                </div>
              </a>

              <div className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[#B8922A] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm">Studio Location</h3>
                  <p className="text-xs text-stone-600 mt-0.5">Pune, Maharashtra, India</p>
                  <p className="text-[11px] text-stone-400 mt-1">Insured dispatch across all Indian pincodes</p>
                </div>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm">Studio Hours</h3>
                  <p className="text-xs text-stone-600 mt-0.5">Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
                  <p className="text-[11px] text-stone-400 mt-1">Sunday: Limited WhatsApp Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-10 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl text-[#6B2737]">Thank You, {name}</h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Your message has been delivered to our Pune studio. Our jewellery consultant will get in touch with you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-medium uppercase tracking-wider hover:bg-stone-800 transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <div>
                <h2 className="font-serif text-2xl text-stone-900 mb-1">
                  Send a Message
                </h2>
                <p className="text-xs text-stone-500 mb-6 font-light">
                  Have an enquiry regarding our jewellery pieces, bridal consultations, or corporate gifting? Leave a note below.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Deshmukh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737] focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="ananya@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737] focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Mobile / WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="e.g. 9822012345"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Your Message *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about the design or order you'd like assistance with..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#6B2737] focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 bg-[#6B2737] hover:bg-[#521c29] text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Inquiry</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <CartDrawer />
      <MobileStickyBar />
      <Footer />
    </div>
  );
}

