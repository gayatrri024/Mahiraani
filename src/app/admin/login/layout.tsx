// src/app/admin/login/layout.tsx
// Login page must render without AdminShell.
// This layout overrides the parent /admin/layout for the login route.

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
