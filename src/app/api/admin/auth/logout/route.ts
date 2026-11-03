// src/app/api/admin/auth/logout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { shouldSecureCookie, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const secure = shouldSecureCookie(req);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure,
  });
  res.cookies.delete(COOKIE_NAME);
  res.cookies.delete("mahiraani_admin_session");
  res.cookies.delete("admin_session");
  return res;
}
