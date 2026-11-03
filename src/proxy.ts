// src/proxy.ts – Next.js 16 Native Proxy (Server-side routing & auth protection)
import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // 1. Development Diagnostic Logging
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[Proxy] ${request.method} ${pathname} | Host: ${request.headers.get("host")} | Cookie "${COOKIE_NAME}": ${
        token ? "present (length=" + token.length + ")" : "MISSING"
      }`
    );
  }

  // 2. Admin Login Route (/admin/login or /admin/login/*)
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    if (token) {
      const session = await verifyAdminToken(token);
      if (session) {
        if (process.env.NODE_ENV !== "production") {
          console.log(`[Proxy] Active session found on login page -> Redirecting to /admin`);
        }
        const redirectUrl = new URL("/admin", request.url);
        const res = NextResponse.redirect(redirectUrl);
        res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.headers.set("Pragma", "no-cache");
        res.headers.set("Expires", "0");
        return res;
      }
    }
    // Allow unauthenticated visitors to view the login page
    return NextResponse.next();
  }

  // 3. Protected Admin Pages (/admin, /admin/*)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!token) {
      const referer = request.headers.get("referer") || "";
      const isFromLogin = referer.includes("/admin/login");
      const redirectUrl = new URL("/admin/login", request.url);
      if (isFromLogin) {
        redirectUrl.searchParams.set("error", "cookie_missing");
      }

      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[Proxy] Blocked unauthenticated access to ${pathname} -> Redirecting to /admin/login (fromLogin: ${isFromLogin})`
        );
      }

      const res = NextResponse.redirect(redirectUrl);
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.headers.set("Pragma", "no-cache");
      res.headers.set("Expires", "0");
      return res;
    }

    const session = await verifyAdminToken(token);
    if (!session) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[Proxy] Invalid/expired session on ${pathname} -> Clearing cookie and redirecting to login`);
      }
      const redirectUrl = new URL("/admin/login", request.url);
      redirectUrl.searchParams.set("error", "session_invalid");
      const res = NextResponse.redirect(redirectUrl);
      res.cookies.delete(COOKIE_NAME);
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.headers.set("Pragma", "no-cache");
      res.headers.set("Expires", "0");
      return res;
    }

    return NextResponse.next();
  }

  // 4. Protected Admin API Routes (/api/admin/*, excluding /api/admin/auth/*)
  if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/auth/")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Missing admin session" }, { status: 401 });
    }
    const session = await verifyAdminToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Invalid or expired session" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export default proxy;

