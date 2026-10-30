// src/app/admin/layout.tsx
// Admin layout – session already verified in middleware.
// /admin/login is excepted by middleware and has its own minimal layout.

import { getAdminSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin – Mahiraani",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already redirected unauthenticated users.
  // Fetch session here for the shell UI.
  const session = await getAdminSession();
  if (!session) {
    // Middleware should have prevented this; return plain wrapper as fallback
    return <>{children}</>;
  }
  return <AdminShell session={session}>{children}</AdminShell>;
}
