// scripts/test-adversarial-gate.ts – Rigorous Adversarial Security & Concurrency Test Gate
import { prisma } from "../src/lib/prisma";
import {
  requestOtp,
  verifyOtpCode,
  checkIpRateLimit,
  generateScopedReviewToken,
  verifyScopedReviewToken,
} from "../src/lib/otp";
import { createCustomerSession } from "../src/lib/customer";
import {
  getAdminJwtSecret,
  getCustomerJwtSecret,
  getOtpSecret,
} from "../src/lib/secrets";
import { POST as postReviewHandler } from "../src/app/api/reviews/route";
import { NextRequest } from "next/server";

async function runAdversarialGate() {
  console.log("=================================================");
  console.log(" MAHIRAANI ADVERSARIAL SECURITY & PRODUCTION GATE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // Ensure test product exists
  let productA = await prisma.product.findFirst({ where: { status: "published" } });
  if (!productA) {
    productA = await prisma.product.create({
      data: {
        name: "Adversarial Test Product A",
        slug: "adv-test-product-a",
        basePrice: 2400,
        status: "published",
      },
    });
  }

  let productB = await prisma.product.findFirst({ where: { id: { not: productA.id } } });
  if (!productB) {
    productB = await prisma.product.create({
      data: {
        name: "Adversarial Test Product B",
        slug: "adv-test-product-b",
        basePrice: 3200,
        status: "published",
      },
    });
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Production Secrets Enforcement & Fallback Rejection
    // -------------------------------------------------------------------------
    console.log("--- 1. Testing Production Secret Validation & Zero Fallback Leaks ---");
    const origNodeEnv = process.env.NODE_ENV;
    const origAdminSecret = process.env.ADMIN_JWT_SECRET;
    const origCustSecret = process.env.CUSTOMER_JWT_SECRET;
    const origOtpSecret = process.env.OTP_SECRET;
    const origDevMock = process.env.DEV_MOCK_OTP;

    // Simulate production environment
    (process.env as Record<string, string>).NODE_ENV = "production";

    // A. Missing ADMIN_JWT_SECRET must throw fatal error in production
    delete process.env.ADMIN_JWT_SECRET;
    try {
      getAdminJwtSecret();
      assert(false, "Fails if ADMIN_JWT_SECRET is missing in production");
    } catch (err: unknown) {
      assert(
        err instanceof Error && err.message.includes("FATAL SECURITY GATE"),
        "Blocks production startup when ADMIN_JWT_SECRET is missing"
      );
    }

    // B. Weak or default placeholder ADMIN_JWT_SECRET must be rejected
    process.env.ADMIN_JWT_SECRET = "CHANGE_THIS_IN_PRODUCTION_USE_STRONG_SECRET";
    try {
      getAdminJwtSecret();
      assert(false, "Rejects known placeholder secret in production");
    } catch (err: unknown) {
      assert(
        err instanceof Error && err.message.includes("FATAL SECURITY GATE"),
        "Rejects known placeholder secret in production"
      );
    }

    // C. Missing CUSTOMER_JWT_SECRET must throw fatal error in production
    delete process.env.CUSTOMER_JWT_SECRET;
    try {
      getCustomerJwtSecret();
      assert(false, "Fails if CUSTOMER_JWT_SECRET is missing in production");
    } catch (err: unknown) {
      assert(
        err instanceof Error && err.message.includes("FATAL SECURITY GATE"),
        "Blocks production startup when CUSTOMER_JWT_SECRET is missing"
      );
    }

    // D. Missing OTP_SECRET must throw fatal error in production
    delete process.env.OTP_SECRET;
    try {
      getOtpSecret();
      assert(false, "Fails if OTP_SECRET is missing in production");
    } catch (err: unknown) {
      assert(
        err instanceof Error && err.message.includes("FATAL SECURITY GATE"),
        "Blocks production startup when OTP_SECRET is missing"
      );
    }

    // E. DEV_MOCK_OTP must be strictly disabled in production even if set to true
    process.env.DEV_MOCK_OTP = "true";
    process.env.ADMIN_JWT_SECRET = "production-strong-admin-secret-at-least-32-chars-long";
    process.env.CUSTOMER_JWT_SECRET = "production-strong-customer-secret-at-least-32-chars-long";
    process.env.OTP_SECRET = "production-strong-otp-secret-at-least-32-chars-long";

    const prodMockResult = await requestOtp("9822990011");
    assert(
      prodMockResult.success === false && prodMockResult.providerMissing === true,
      "CRITICAL: DEV_MOCK_OTP CANNOT dispatch mock OTPs in production mode"
    );

    // Restore test environment
    (process.env as Record<string, string>).NODE_ENV = origNodeEnv || "test";
    process.env.ADMIN_JWT_SECRET = origAdminSecret;
    process.env.CUSTOMER_JWT_SECRET = origCustSecret;
    process.env.OTP_SECRET = origOtpSecret;
    process.env.DEV_MOCK_OTP = origDevMock ?? "true"; // Active for local test runs

    // -------------------------------------------------------------------------
    // TEST 2: OTP Concurrency & Race-Condition Resistance
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Testing OTP Concurrency, Atomic Locks & Invalidation ---");
    const testPhoneAdv = "9822776655";
    await prisma.otpVerification.deleteMany({ where: { phone: testPhoneAdv } });

    // A. Concurrent OTP Requests: Send 5 concurrent OTP generation requests
    const concurrentRequests = await Promise.all([
      requestOtp(testPhoneAdv),
      requestOtp(testPhoneAdv),
      requestOtp(testPhoneAdv),
      requestOtp(testPhoneAdv),
      requestOtp(testPhoneAdv),
    ]);

    const successes = concurrentRequests.filter((r) => r.success);
    const lockedOrCooldown = concurrentRequests.filter((r) => !r.success);
    assert(
      successes.length === 1 && lockedOrCooldown.length === 4,
      "Atomic concurrency lock permits only 1 OTP generation, rejecting simultaneous race attempts"
    );

    const firstOtpCode = successes[0]?.success ? successes[0].devOtp! : "";
    assert(Boolean(firstOtpCode && firstOtpCode.length === 6), "First OTP code is generated");

    // B. Previous OTP Invalidation Test:
    // Artificially age the existing OTP record so cooldown passes
    await prisma.otpVerification.updateMany({
      where: { phone: testPhoneAdv },
      data: { createdAt: new Date(Date.now() - 70 * 1000) },
    });

    // Request second OTP
    const secondOtpResult = await requestOtp(testPhoneAdv);
    assert(secondOtpResult.success === true, "Generates second OTP after cooldown");
    const secondOtpCode = secondOtpResult.success ? secondOtpResult.devOtp! : "";

    // Old OTP (firstOtpCode) MUST be invalidated by the generation of secondOtpCode
    const oldOtpVerify = await verifyOtpCode(testPhoneAdv, firstOtpCode);
    assert(
      !oldOtpVerify.success,
      "CRITICAL: Previous unverified OTP is immediately invalidated when a new OTP is issued"
    );

    // New OTP verifies successfully
    const newOtpVerify = await verifyOtpCode(testPhoneAdv, secondOtpCode);
    assert(newOtpVerify.success === true, "Latest OTP verifies successfully");

    // Clean up
    await prisma.otpVerification.deleteMany({ where: { phone: testPhoneAdv } });

    // -------------------------------------------------------------------------
    // TEST 3: Per-IP Rate Limiting (Anti-SMS-Exhaustion Protection)
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Testing Per-IP Rate Limiting (Distributed Abuse Defense) ---");
    const testIp = "203.0.113.42";
    // Fire 10 allowed requests from this IP across varying phone numbers
    for (let i = 0; i < 10; i++) {
      checkIpRateLimit(testIp);
    }
    // 11th request from the same IP must be blocked
    const isIpBlocked = !checkIpRateLimit(testIp);
    assert(isIpBlocked, "Blocks IP after 10 requests within window to prevent SMS gateway exhaustion");

    // -------------------------------------------------------------------------
    // TEST 4: Scoped Review Tokens vs Order Access Tokens
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Testing Scoped Review Tokens & Cryptographic Binding ---");
    const fakeOrderId = "ord_test_999";
    const scopedToken = generateScopedReviewToken(fakeOrderId, productA.id);
    assert(typeof scopedToken === "string" && scopedToken.length === 32, "Generates 32-char scoped review token");

    // Valid verification on exact (orderId, productId)
    assert(
      verifyScopedReviewToken(fakeOrderId, productA.id, scopedToken),
      "Verifies authentic scoped review token for matching order & product"
    );

    // Tampering test: Changing productId must fail verification
    assert(
      !verifyScopedReviewToken(fakeOrderId, productB.id, scopedToken),
      "Rejects scoped review token if productId is tampered"
    );

    // Tampering test: Changing orderId must fail verification
    assert(
      !verifyScopedReviewToken("ord_other_000", productA.id, scopedToken),
      "Rejects scoped review token if orderId is tampered"
    );

    // -------------------------------------------------------------------------
    // TEST 5: Cross-Customer & Tampering Review Attacks via Route Handler
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Testing Route Handler Adversarial Defenses ---");
    const phoneCustomerA = "9822110022";
    const phoneCustomerB = "9822330044";

    // Setup Customer A & Order A (Delivered)
    const custA = await prisma.customer.upsert({
      where: { phone: phoneCustomerA },
      update: { name: "Customer A" },
      create: { phone: phoneCustomerA, name: "Customer A" },
    });

    const orderA = await prisma.order.create({
      data: {
        reference: `ADV-A-${Date.now().toString().slice(-5)}`,
        customerName: custA.name,
        customerEmail: "custA@example.com",
        customerPhone: phoneCustomerA,
        customerId: custA.id,
        addressLine1: "Address A",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411001",
        subtotalPaise: 240000,
        totalPaise: 240000,
        paymentStatus: "paid",
        fulfilmentStatus: "delivered", // Delivered so eligible for review
        items: {
          create: [{ productId: productA.id, snapshotName: productA.name, snapshotUnitPaise: 240000, quantity: 1 }],
        },
      },
      include: { items: true },
    });

    // Setup Customer B & Order B (Delivered)
    const custB = await prisma.customer.upsert({
      where: { phone: phoneCustomerB },
      update: { name: "Customer B" },
      create: { phone: phoneCustomerB, name: "Customer B" },
    });

    const orderB = await prisma.order.create({
      data: {
        reference: `ADV-B-${Date.now().toString().slice(-5)}`,
        customerName: custB.name,
        customerEmail: "custB@example.com",
        customerPhone: phoneCustomerB,
        customerId: custB.id,
        addressLine1: "Address B",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411002",
        subtotalPaise: 320000,
        totalPaise: 320000,
        paymentStatus: "paid",
        fulfilmentStatus: "delivered",
        items: {
          create: [{ productId: productB.id, snapshotName: productB.name, snapshotUnitPaise: 320000, quantity: 1 }],
        },
      },
      include: { items: true },
    });

    // Create session for Customer B
    const sessionTokenB = await createCustomerSession({ id: custB.id, phone: custB.phone, name: custB.name });

    // Attack 1: Customer B tries to review Order A using Customer B's session cookie
    const crossReviewReq = new NextRequest("http://localhost:3000/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `mhraani_customer_session=${sessionTokenB}`,
      },
      body: JSON.stringify({
        orderId: orderA.id, // Order A belongs to Customer A!
        productId: productA.id,
        rating: 5,
        comment: "Attempting cross-customer review hijacking",
        customerName: "Attacker B",
      }),
    });
    const crossReviewRes = await postReviewHandler(crossReviewReq);
    assert(crossReviewRes.status === 403, "CRITICAL: Customer B CANNOT review Customer A's order (HTTP 403)");

    // Attack 2: Tampered Product ID (Reviewing productB on orderA which only contains productA)
    const tamperedProductReq = new NextRequest("http://localhost:3000/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: orderA.id,
        productId: productB.id, // productB was never in orderA!
        orderToken: orderA.accessToken,
        rating: 5,
        comment: "Attempting unpurchased product review",
        customerName: "Customer A",
      }),
    });
    const tamperedProductRes = await postReviewHandler(tamperedProductReq);
    assert(tamperedProductRes.status === 400, "CRITICAL: Rejects review for product not in order (HTTP 400)");

    // Attack 3: Stolen order token used on different order ID
    const wrongOrderReq = new NextRequest("http://localhost:3000/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: orderB.id, // orderB ID
        productId: productB.id,
        orderToken: orderA.accessToken, // orderA token!
        rating: 5,
        comment: "Attempting mismatched token authorization",
        customerName: "Customer B",
      }),
    });
    const wrongOrderRes = await postReviewHandler(wrongOrderReq);
    assert(wrongOrderRes.status === 403, "CRITICAL: Rejects mismatched order access token (HTTP 403)");

    // Clean up
    await prisma.orderItem.deleteMany({ where: { orderId: { in: [orderA.id, orderB.id] } } });
    await prisma.order.deleteMany({ where: { id: { in: [orderA.id, orderB.id] } } });
    await prisma.customer.deleteMany({ where: { id: { in: [custA.id, custB.id] } } });
    console.log("[CLEANUP] Successfully cleaned all adversarial test artifacts from database.");

    console.log("\n=================================================");
    console.log(` GATE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Adversarial test gate failed with unhandled exception:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAdversarialGate();
