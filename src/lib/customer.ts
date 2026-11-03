// src/lib/customer.ts – Guest Customer Session & Identity Utilities
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getCustomerJwtSecret } from "@/lib/secrets";

export const CUSTOMER_COOKIE_NAME = "mhraani_customer_session";

export interface CustomerSession {
  id: string;
  phone: string;
  name?: string;
}

/**
 * Normalizes Indian phone numbers to 10 digits without leading +91, 0, or spaces.
 */
export function normalizeIndianPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  if (digits.length === 10) {
    return digits;
  }
  return digits;
}

export function isValidIndianPhone(phone: string): boolean {
  const normalized = normalizeIndianPhone(phone);
  return /^[6-9]\d{9}$/.test(normalized);
}

export async function createCustomerSession(payload: CustomerSession): Promise<string> {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("customer")
    .setIssuer("mahiraani:customer")
    .setAudience("mahiraani:customer")
    .setIssuedAt()
    .setExpirationTime("30d") // 30 days guest session
    .sign(getCustomerJwtSecret());
  return token;
}

export async function verifyCustomerToken(token: string): Promise<CustomerSession | null> {
  try {
    const { payload } = await jwtVerify(token, getCustomerJwtSecret(), {
      issuer: "mahiraani:customer",
      audience: "mahiraani:customer",
    });

    if (payload.sub !== "customer" || typeof payload.phone !== "string" || !payload.phone) {
      return null;
    }

    return {
      id: payload.id as string,
      phone: payload.phone as string,
      name: payload.name as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function getCustomerSession(tokenOverride?: string): Promise<CustomerSession | null> {
  if (tokenOverride) {
    return verifyCustomerToken(tokenOverride);
  }
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyCustomerToken(token);
  } catch {
    return null;
  }
}

