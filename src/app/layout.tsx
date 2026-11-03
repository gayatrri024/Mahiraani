import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
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
  ],
  openGraph: {
    title: "MAHIRAANI | Handcrafted Indian Jewellery",
    description: "Discover handcrafted jewellery from MAHIRAANI, sourced from skilled artisans across India.",
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
