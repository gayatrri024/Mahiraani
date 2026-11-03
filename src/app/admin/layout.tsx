// src/app/admin/layout.tsx
// Base layout for all /admin routes

export const metadata = {
  title: "Admin – MAHIRAANI",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
