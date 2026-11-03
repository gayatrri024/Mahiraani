// src/app/admin/login/page.tsx
// Admin login page (no session required)

export const metadata = {
  title: "Admin Login – MAHIRAANI",
  robots: { index: false, follow: false },
};

export const instant = false;

import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";
import Logo from "@/components/brand/Logo";

function LoginFormFallback() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center text-sm text-stone-400">
      Loading sign in form…
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="lg" tagline="Store Administration" href="/admin/login" />
        </div>
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
