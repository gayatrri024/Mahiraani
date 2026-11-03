// src/app/admin/(dashboard)/layout.tsx
// Shell layout for authenticated admin dashboard pages

import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin – MAHIRAANI",
  robots: { index: false, follow: false },
};

export const instant = false;

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs uppercase tracking-widest text-stone-500 font-medium">Loading MAHIRAANI Admin…</p>
      </div>
    </div>
  );
}

async function AdminProtectedShell({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await getAdminSession();
  if (!session) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Admin Layout] No valid admin session found -> redirecting to /admin/login");
    }
    redirect("/admin/login?error=session_invalid");
  }
  return <AdminShell session={session}>{children}</AdminShell>;
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminProtectedShell>{children}</AdminProtectedShell>
    </Suspense>
  );
}
