// src/lib/secrets.ts – Production Cryptographic Secrets & Environment Validator

/**
 * Validates and returns the ADMIN_JWT_SECRET.
 * In production (NODE_ENV === "production"), enforces presence, minimum 32-character length,
 * and rejection of default insecure placeholder strings.
 */
export function getAdminJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < 32 || secret.includes("CHANGE_THIS") || secret.includes("local-dev")) {
      throw new Error(
        "[FATAL SECURITY GATE] ADMIN_JWT_SECRET is missing, shorter than 32 characters, or using an insecure placeholder in production."
      );
    }
    return new TextEncoder().encode(secret);
  }
  return new TextEncoder().encode(secret || "dev-admin-jwt-secret-min-32-characters-key");
}

/**
 * Validates and returns the CUSTOMER_JWT_SECRET.
 * In production, enforces presence, minimum 32-character length, and independent key material.
 */
export function getCustomerJwtSecret(): Uint8Array {
  const secret = process.env.CUSTOMER_JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < 32 || secret.includes("CHANGE_THIS") || secret.includes("local-dev")) {
      throw new Error(
        "[FATAL SECURITY GATE] CUSTOMER_JWT_SECRET is missing, shorter than 32 characters, or using an insecure placeholder in production."
      );
    }
    return new TextEncoder().encode(secret);
  }
  const fallback =
    (process.env.ADMIN_JWT_SECRET || "dev-fallback-secret-min-32-characters") +
    ":mahiraani-customer-session-salt";
  return new TextEncoder().encode(secret || fallback);
}

/**
 * Validates and returns the OTP_SECRET for HMAC-SHA256 OTP hashing and scoped review token verification.
 * In production, enforces presence, minimum 32-character length, and non-default salt.
 */
export function getOtpSecret(): string {
  const secret = process.env.OTP_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < 32 || secret.includes("mahiraani-otp-secret-key-salt")) {
      throw new Error(
        "[FATAL SECURITY GATE] OTP_SECRET is missing, shorter than 32 characters, or using an insecure placeholder in production."
      );
    }
    return secret;
  }
  return secret || process.env.ADMIN_JWT_SECRET || "dev-otp-hmac-secret-min-32-characters";
}

/**
 * Startup sanity check to verify all production secrets at once.
 */
export function assertProductionSecretsReady(): { ok: boolean; message: string } {
  if (process.env.NODE_ENV !== "production") {
    return { ok: true, message: "Development mode: relaxed secrets policy active." };
  }

  try {
    getAdminJwtSecret();
    getCustomerJwtSecret();
    getOtpSecret();
    return { ok: true, message: "All production secrets validated successfully." };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Production secrets validation failed.";
    return { ok: false, message: msg };
  }
}

