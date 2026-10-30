// src/app/admin/login/page.tsx
// Admin login page (no session required)

export const metadata = {
  title: "Admin Login – Mahiraani",
  robots: { index: false, follow: false },
};

import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-stone-800 tracking-wide">Mahiraani</h1>
          <p className="text-sm text-stone-500 mt-1">Store Administration</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
