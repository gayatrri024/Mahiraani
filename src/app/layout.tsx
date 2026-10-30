import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Mahiraani | Royal Indian Heirlooms & Handcrafted Jewellery",
  description:
    "Discover handcrafted Kundan, Polki, and 22K gold-plated royal Indian jewellery heirlooms from Jaipur. Certified hallmarks, insured Pan-India express delivery, and cash on delivery.",
  keywords: [
    "Mahiraani",
    "Indian Jewellery",
    "Jaipur Jewellery",
    "Polki Choker",
    "Kundan Earrings",
    "Bridal Jewellery India",
    "Handcrafted Jewellery",
    "Gold Plated Jewellery",
  ],
  openGraph: {
    title: "Mahiraani | Royal Indian Heirlooms",
    description: "Handcrafted royal Indian jewellery from Jaipur for modern celebratory grace.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAF8F4] text-stone-900 font-sans selection:bg-[#6B2737] selection:text-white">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
