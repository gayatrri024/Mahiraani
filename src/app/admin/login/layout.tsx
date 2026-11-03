// src/app/admin/login/layout.tsx
// Dedicated wrapper for the admin login route (no AdminShell)

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full bg-stone-50">{children}</div>;
}
