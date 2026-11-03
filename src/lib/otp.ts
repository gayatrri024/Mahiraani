// src/lib/otp.ts – Secure OTP Generation, Rate-Limiting & SMS Gateway Interface
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone, isValidIndianPhone } from "@/lib/customer";
import { getOtpSecret } from "@/lib/secrets";

// In-memory locks for atomic concurrent request protection
const activePhoneLocks = new Set<string>();
const ipRateLimitMap = new Map<string, number[]>();

export function checkIpRateLimit(ip: string): boolean {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") return true;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 mins
  const timestamps = (ipRateLimitMap.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= 10) {
    ipRateLimitMap.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  ipRateLimitMap.set(ip, timestamps);
  return true;
}

export function hashOtp(phone: string, otp: string): string {
  return crypto
    .createHmac("sha256", getOtpSecret())
    .update(`${phone}:${otp}`)
    .digest("hex");
}

/**
 * Generates a scoped HMAC review token cryptographically bound to an (orderId, productId) pair.
 * Prevents exposing the full Order.accessToken on review invitation links.
 */
export function generateScopedReviewToken(orderId: string, productId: string): string {
  return crypto
    .createHmac("sha256", getOtpSecret())
    .update(`review:${orderId}:${productId}`)
    .digest("hex")
    .slice(0, 32);
}

export function verifyScopedReviewToken(orderId: string, productId: string, token: string): boolean {
  if (!token || typeof token !== "string") return false;
  const expected = generateScopedReviewToken(orderId, productId);
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function isOtpProviderConfigured(): boolean {
  // Check for MSG91, Fast2SMS, or Twilio
  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) return true;
  if (process.env.FAST2SMS_API_KEY) return true;
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) return true;
  // Also check explicit dev mock permission
  if (process.env.DEV_MOCK_OTP === "true" && process.env.NODE_ENV !== "production") return true;
  return false;
}

export function getMissingProviderName(): string {
  return "SMS Gateway (MSG91 / Fast2SMS / Twilio)";
}

/**
 * Sends OTP to phone via configured SMS provider.
 */
async function dispatchSms(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  // 1. Fast2SMS (Indian SMS Gateway)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variables_values: otp,
          route: "otp",
          numbers: phone,
        }),
      });
      const data = await res.json();
      if (data.return) return { success: true };
      return { success: false, error: data.message || "Failed to dispatch SMS via Fast2SMS" };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "SMS provider network failure" };
    }
  }

  // 2. MSG91 (Indian Enterprise SMS)
  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
    try {
      const res = await fetch(
        `https://control.msg91.com/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=91${phone}&authkey=${process.env.MSG91_AUTH_KEY}&otp=${otp}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.type === "success") return { success: true };
      return { success: false, error: data.message || "Failed to dispatch SMS via MSG91" };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "MSG91 network failure" };
    }
  }

  // 3. Dev test mode (only if explicitly enabled via DEV_MOCK_OTP in development)
  if (process.env.DEV_MOCK_OTP === "true" && process.env.NODE_ENV !== "production") {
    console.log(`\n======================================================`);
    console.log(`[DEV OTP DISPATCH] Phone: +91 ${phone} | Code: ${otp}`);
    console.log(`======================================================\n`);
    return { success: true };
  }

  return {
    success: false,
    error: "No SMS OTP provider is configured in environment variables.",
  };
}

export type SendOtpResult =
  | { success: true; cooldownSeconds: number; devOtp?: string }
  | { success: false; error: string; providerMissing?: boolean; cooldownSeconds?: number };

export async function requestOtp(rawPhone: string, clientIp?: string): Promise<SendOtpResult> {
  const phone = normalizeIndianPhone(rawPhone);
  if (!isValidIndianPhone(phone)) {
    return { success: false, error: "Please enter a valid 10-digit Indian mobile number." };
  }

  // 0. Check IP Rate Limiting (Anti-SMS-Bombing protection across distributed numbers)
  if (clientIp && !checkIpRateLimit(clientIp)) {
    return {
      success: false,
      error: "Too many verification requests from this network. Please wait a few minutes before trying again.",
    };
  }

  // 1. Atomic concurrent phone lock (prevents race conditions from simultaneous requests)
  if (activePhoneLocks.has(phone)) {
    return {
      success: false,
      error: "A verification code request is already processing for this number. Please wait.",
    };
  }
  activePhoneLocks.add(phone);

  try {
    // Check provider configuration
    if (!isOtpProviderConfigured()) {
      return {
        success: false,
        providerMissing: true,
        error:
          "SMS OTP service is currently not configured on this server. Please set up MSG91, Fast2SMS, or Twilio credentials in your environment variables.",
      };
    }

    const now = new Date();

    // 2. Check Rate Limiting: Max 4 OTPs in the last 15 minutes per phone
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentCount = await prisma.otpVerification.count({
      where: {
        phone,
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    if (recentCount >= 4) {
      return {
        success: false,
        error: "Too many OTP requests for this phone number. Please wait 15 minutes before trying again.",
      };
    }

    // 3. Check Resend Cooldown: 60 seconds minimum between requests
    const latestOtp = await prisma.otpVerification.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });

    if (latestOtp) {
      const elapsedSeconds = Math.floor((now.getTime() - latestOtp.createdAt.getTime()) / 1000);
      if (elapsedSeconds < 60) {
        const waitRemaining = 60 - elapsedSeconds;
        return {
          success: false,
          cooldownSeconds: waitRemaining,
          error: `Please wait ${waitRemaining} seconds before requesting a new code.`,
        };
      }
    }

    // 4. Invalidate ANY previous unverified OTPs for this phone number (ensures only the newest OTP is valid)
    await prisma.otpVerification.updateMany({
      where: {
        phone,
        verified: false,
      },
      data: {
        verified: true, // Mark old codes as consumed/void
      },
    });

    // 5. Generate 6-digit random cryptographically secure OTP
    const rawOtpNumber = crypto.randomInt(100000, 999999);
    const otp = rawOtpNumber.toString();
    const otpHash = hashOtp(phone, otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 6. Save to Database
    await prisma.otpVerification.create({
      data: {
        phone,
        otpHash,
        expiresAt,
        attempts: 0,
        verified: false,
      },
    });

    // 7. Send via configured provider
    const dispatchResult = await dispatchSms(phone, otp);
    if (!dispatchResult.success) {
      return {
        success: false,
        error: dispatchResult.error || "Failed to deliver SMS. Please try again later.",
      };
    }

    return {
      success: true,
      cooldownSeconds: 60,
      devOtp: process.env.DEV_MOCK_OTP === "true" && process.env.NODE_ENV !== "production" ? otp : undefined,
    };
  } finally {
    activePhoneLocks.delete(phone);
  }
}

export type VerifyOtpResult =
  | { success: true; customer: { id: string; phone: string; name: string } }
  | { success: false; error: string };

export async function verifyOtpCode(rawPhone: string, code: string): Promise<VerifyOtpResult> {
  const phone = normalizeIndianPhone(rawPhone);
  const trimmedCode = code.trim();

  if (!/^\d{6}$/.test(trimmedCode)) {
    return { success: false, error: "Please enter a valid 6-digit verification code." };
  }

  const now = new Date();

  // Find latest unverified OTP record
  const record = await prisma.otpVerification.findFirst({
    where: {
      phone,
      verified: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { success: false, error: "No pending verification code found. Please request a new code." };
  }

  // Check expiry
  if (record.expiresAt < now) {
    return { success: false, error: "Verification code has expired. Please request a new one." };
  }

  // Check attempts
  if (record.attempts >= 5) {
    return {
      success: false,
      error: "Too many incorrect attempts. This code has been invalidated for security. Please request a new code.",
    };
  }

  // Check hash using timing-safe constant-time equality
  const computedHash = hashOtp(phone, trimmedCode);
  const isMatch =
    computedHash.length === record.otpHash.length &&
    crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(record.otpHash));

  if (!isMatch) {
    await prisma.otpVerification.updateMany({
      where: { id: record.id, attempts: { lt: 5 } },
      data: { attempts: { increment: 1 } },
    });
    const currentAttempts = record.attempts + 1;
    const remainingAttempts = Math.max(0, 5 - currentAttempts);
    return {
      success: false,
      error:
        remainingAttempts > 0
          ? `Invalid code. ${remainingAttempts} attempt(s) remaining.`
          : "Too many incorrect attempts. Code invalidated for security.",
    };
  }

  // Atomic mark as verified: prevents concurrent replay attacks
  const updateResult = await prisma.otpVerification.updateMany({
    where: { id: record.id, verified: false, attempts: { lt: 5 } },
    data: { verified: true },
  });

  if (updateResult.count === 0) {
    return {
      success: false,
      error: "Verification code has already been used or invalidated. Please request a new code.",
    };
  }

  // Find or create customer
  let customer = await prisma.customer.findUnique({
    where: { phone },
  });

  if (!customer) {
    // If an order exists with this phone, pick customer name from order
    const latestOrder = await prisma.order.findFirst({
      where: { customerPhone: phone },
      orderBy: { createdAt: "desc" },
    });

    customer = await prisma.customer.create({
      data: {
        phone,
        name: latestOrder?.customerName || "Mahiraani Patron",
        email: latestOrder?.customerEmail || null,
      },
    });
  }

  // Associate any unlinked orders for this phone
  await prisma.order.updateMany({
    where: {
      customerPhone: phone,
      customerId: null,
    },
    data: {
      customerId: customer.id,
    },
  });

  return {
    success: true,
    customer: {
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
    },
  };
}

