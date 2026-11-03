// src/app/api/admin/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAdminSession, shouldSecureCookie, COOKIE_NAME } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// In-memory rate limit: max 10 attempts per 15 min per IP
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : (req.headers.get("x-real-ip") ?? "direct-client");

  if (!checkRateLimit(ip)) {
    console.warn(`[Admin Auth] Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json(
      { error: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parse = LoginSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid email or password format" }, { status: 400 });
  }

  const { email, password } = parse.data;
  const host = req.headers.get("host") || "unknown";

  if (process.env.NODE_ENV !== "production") {
    console.log(`[Admin Login API] Attempt for: ${email} | IP: ${ip} | Host: ${host}`);
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    console.warn(`[Admin Auth] Login attempt failed: user not found (${email}) from ${host}`);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    console.warn(`[Admin Auth] Login attempt failed: invalid password (${email}) from ${host}`);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createAdminSession({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  const secure = shouldSecureCookie(req);

  if (process.env.NODE_ENV !== "production") {
    console.log(`[Admin Login API] Login successful for: ${admin.email} (${admin.role})`);
    console.log(`[Admin Login API] Issuing cookie "${COOKIE_NAME}": secure=${secure}, sameSite=lax, path=/, maxAge=28800`);
  }

  const res = NextResponse.json({ ok: true, name: admin.name });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60, // 8 hours
    secure,
  });

  // Clear any conflicting legacy cookie names from previous revisions
  res.cookies.delete("mahiraani_admin_session");
  res.cookies.delete("admin_session");

  return res;
}
