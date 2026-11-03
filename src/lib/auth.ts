// src/lib/auth.ts – Admin session management using HTTP-only cookies + JWT

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { getAdminJwtSecret } from "@/lib/secrets";

const COOKIE_NAME = "mhraani_admin_session";

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function createAdminSession(payload: AdminSession): Promise<string> {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuer("mahiraani:admin")
    .setAudience("mahiraani:admin")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getAdminJwtSecret());
  return token;
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getAdminJwtSecret(), {
      issuer: "mahiraani:admin",
      audience: "mahiraani:admin",
    });

    if (
      payload.sub !== "admin" ||
      typeof payload.role !== "string" ||
      !payload.role ||
      typeof payload.email !== "string"
    ) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Admin Auth Verify] Failed: Token payload claims mismatch", {
          sub: payload.sub,
          hasRole: Boolean(payload.role),
          hasEmail: Boolean(payload.email),
        });
      }
      return null;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Admin Auth Verify] Token valid for: ${payload.email} (${payload.role})`);
    }

    return payload as unknown as AdminSession;
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Admin Auth Verify] JWT verification failed:", err instanceof Error ? err.message : String(err));
    }
    return null;
  }
}

export async function getAdminSession(tokenOverride?: string): Promise<AdminSession | null> {
  if (tokenOverride) {
    return verifyAdminToken(tokenOverride);
  }
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[Admin Session] No "${COOKIE_NAME}" cookie found in cookieStore`);
      }
      return null;
    }
    return verifyAdminToken(token);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Admin Session] Error reading cookieStore:", err);
    }
    return null;
  }
}

/**
 * Determines whether the admin session cookie should carry the Secure flag.
 *
 * Rules:
 * 1. Explicit env override: COOKIE_SECURE=true | false
 * 2. In development (NODE_ENV !== "production"): false (enables localhost & LAN testing).
 * 3. In production:
 *    - true if served over HTTPS (direct or behind reverse proxy).
 *    - false if accessed locally or over LAN via plain HTTP (e.g. http://192.168.x.x:3000)
 *      because mobile browsers (especially iOS Safari) reject Secure cookies over HTTP.
 *    - true for live public production domains.
 */
export function shouldSecureCookie(req: NextRequest): boolean {
  if (process.env.COOKIE_SECURE === "false") return false;
  if (process.env.COOKIE_SECURE === "true") return true;

  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");
  if (proto === "https") {
    return true;
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
  const hostname = (host || "").split(":")[0];
  const isLocalOrLan =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
    hostname.endsWith(".local");

  if (isLocalOrLan) {
    return false;
  }

  return true;
}

export { COOKIE_NAME };
