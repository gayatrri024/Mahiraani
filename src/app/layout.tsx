import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mahiraani.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "MAHIRAANI | Handcrafted Indian Jewellery",
  description:
    "Discover handcrafted jewellery from MAHIRAANI, sourced from skilled artisans across India. Premium anti-tarnish, skin-friendly designs. Free shipping on orders above ₹900.",
  keywords: [
    "MAHIRAANI",
    "Anti Tarnish Jewellery",
    "Gold-Based Jewellery",
    "Oxidised Jewellery",
    "Everyday Jewellery India",
    "Indian Jewellery Online",
    "Earrings",
    "Necklaces",
    "Fashion Jewellery India",
    "Pune Jewellery Studio",
  ],
  openGraph: {
    title: "MAHIRAANI | Handcrafted Indian Jewellery",
    description: "Discover handcrafted jewellery from MAHIRAANI, sourced from skilled artisans across India.",
    url: siteUrl,
    siteName: "MAHIRAANI",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/images/hero-desktop.jpg",
        width: 1200,
        height: 630,
        alt: "MAHIRAANI Handcrafted Indian Jewellery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MAHIRAANI | Handcrafted Indian Jewellery",
    description: "Curated gold-based and oxidised jewellery with durable anti-tarnish finish. Sourced across India.",
    images: ["/images/hero-desktop.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col bg-[#FAF8F4] text-stone-900 font-sans selection:bg-[#6B2737] selection:text-white"
        suppressHydrationWarning
      >
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
