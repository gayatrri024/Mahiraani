"use client";
// src/components/admin/AdminShell.tsx
// Responsive sidebar shell for the admin area

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AdminSession } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "⊞" },
  { href: "/admin/products", label: "Products", icon: "◈" },
  { href: "/admin/categories", label: "Categories", icon: "⊟" },
  { href: "/admin/collections", label: "Collections", icon: "◻" },
  { href: "/admin/orders", label: "Orders", icon: "◷" },
];

export default function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AdminSession;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-60 bg-stone-900 text-white flex flex-col z-30 transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-stone-700">
          <span className="text-lg font-semibold tracking-widest text-stone-100">MAHIRAANI</span>
          <p className="text-xs text-stone-400 mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-stone-700 text-white font-medium"
                    : "text-stone-400 hover:bg-stone-800 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-700">
          <p className="text-xs text-stone-400 mb-1 truncate">{session.name}</p>
          <p className="text-xs text-stone-500 mb-3 truncate">{session.email}</p>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-stone-400 hover:text-white hover:bg-stone-800 px-3 py-2 rounded-lg transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 bg-white border-b border-stone-200 px-4 py-3 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-stone-100"
            aria-label="Open menu"
          >
            <span className="block w-5 h-0.5 bg-stone-600 mb-1" />
            <span className="block w-5 h-0.5 bg-stone-600 mb-1" />
            <span className="block w-5 h-0.5 bg-stone-600" />
          </button>
          <span className="text-sm font-semibold text-stone-800">MAHIRAANI Admin</span>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
