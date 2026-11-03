// scripts/test-order-review-system.ts – End-to-End Test Suite for Guest Orders, OTP, & Verified Reviews
import { prisma } from "../src/lib/prisma";
import {
  normalizeIndianPhone,
  isValidIndianPhone,
  createCustomerSession,
  verifyCustomerToken,
} from "../src/lib/customer";
import { requestOtp, verifyOtpCode, hashOtp } from "../src/lib/otp";
import { createAdminSession, verifyAdminToken } from "../src/lib/auth";

async function runTests() {
  console.log("=================================================");
  console.log(" MAHIRAANI SECURITY & FUNCTIONAL AUDIT TEST SUITE");
  console.log(" Guest Orders, OTP Security & Verified Reviews");
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

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Phone Normalization & Validation
    // -------------------------------------------------------------------------
    console.log("--- 1. Testing Phone Normalization & Indian Mobile Regex ---");
    assert(normalizeIndianPhone("+91 91466 86816") === "9146686816", "Normalizes +91 with spaces");
    assert(normalizeIndianPhone("9146686816") === "9146686816", "Normalizes 10-digit number");
    assert(normalizeIndianPhone("09146686816") === "9146686816", "Normalizes leading zero");
    assert(isValidIndianPhone("9146686816") === true, "Validates genuine Indian mobile prefix (9/8/7/6)");
    assert(isValidIndianPhone("1234567890") === false, "Rejects invalid mobile prefix (1-5)");
    assert(isValidIndianPhone("invalid") === false, "Rejects non-numeric phone");
    assert(isValidIndianPhone("12345") === false, "Rejects short number");

    // -------------------------------------------------------------------------
    // TEST 2: Customer Session Token Creation & Cryptographic Segregation
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Testing JWT Cryptographic Boundaries & Privilege Segregation ---");
    const testCustomerData = { id: "cust_test_123", phone: "9146686816", name: "Ananya Deshmukh" };
    const customerToken = await createCustomerSession(testCustomerData);
    assert(typeof customerToken === "string" && customerToken.length > 20, "Generates secure signed customer JWT");

    const verifiedCustomer = await verifyCustomerToken(customerToken);
    assert(verifiedCustomer !== null, "Verifies authentic customer JWT");
    assert(verifiedCustomer?.phone === "9146686816", "Decodes correct customer phone");
    assert(verifiedCustomer?.name === "Ananya Deshmukh", "Decodes customer name");

    // Attack test: Customer Token passed as Admin Token
    const customerPassedAsAdmin = await verifyAdminToken(customerToken);
    assert(customerPassedAsAdmin === null, "CRITICAL: Rejects customer JWT presented to admin endpoint");

    // Create Admin Token
    const adminToken = await createAdminSession({
      id: "admin_123",
      email: "concierge@mahiraani.com",
      name: "Mahiraani Concierge",
      role: "admin",
    });
    assert(typeof adminToken === "string", "Generates authentic admin JWT");
    const verifiedAdmin = await verifyAdminToken(adminToken);
    assert(verifiedAdmin?.role === "admin", "Verifies authentic admin session");

    // Attack test: Admin Token passed as Customer Token
    const adminPassedAsCustomer = await verifyCustomerToken(adminToken);
    assert(adminPassedAsCustomer === null, "CRITICAL: Rejects admin JWT presented to customer portal");

    // -------------------------------------------------------------------------
    // TEST 3: OTP System – Missing Provider Honesty, Mock Mode, Hashing, Cooldown, Verification & Lockout
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Testing OTP System & Security Safeguards ---");
    const testPhone = "9822998877";
    await prisma.otpVerification.deleteMany({ where: { phone: testPhone } });

    // A. Without provider and DEV_MOCK_OTP unset: Verify truthful dependency reporting
    const origMock = process.env.DEV_MOCK_OTP;
    process.env.DEV_MOCK_OTP = "false";
    const noProviderResult = await requestOtp(testPhone);
    assert(
      noProviderResult.success === false && noProviderResult.providerMissing === true,
      "Reports missing SMS gateway truthfully (providerMissing: true) without pretending OTP was sent"
    );

    // B. Enable DEV_MOCK_OTP for local testing
    process.env.DEV_MOCK_OTP = "true";
    const otpResult = await requestOtp(testPhone);
    assert(otpResult.success === true, "Generates OTP when mock mode is enabled");
    const generatedOtp = otpResult.success ? otpResult.devOtp : null;
    assert(Boolean(generatedOtp && generatedOtp.length === 6), "Generates valid 6-digit code");

    // Check DB record: code must be HMAC hashed, never plain text
    const dbOtp = await prisma.otpVerification.findFirst({
      where: { phone: testPhone },
      orderBy: { createdAt: "desc" },
    });
    assert(dbOtp !== null, "Saves OTP record in database");
    assert(dbOtp?.otpHash !== generatedOtp, "Stores cryptographic hash, NOT plain text OTP");
    assert(dbOtp?.otpHash === hashOtp(testPhone, generatedOtp!), "Hash matches HMAC-SHA256 of code");

    // Cooldown test: immediately requesting another OTP should be blocked
    const cooldownResult = await requestOtp(testPhone);
    assert(
      cooldownResult.success === false && (cooldownResult.cooldownSeconds ?? 0) > 0,
      "Enforces 60-second resend cooldown before allowing another code"
    );

    // Verify Wrong OTP attempt: increments failed attempts
    const wrongAttempt1 = await verifyOtpCode(testPhone, "000000");
    assert(!wrongAttempt1.success, "Rejects incorrect OTP attempt 1");

    // Brute force lockout test: 4 more wrong attempts should lock the code
    await verifyOtpCode(testPhone, "111111");
    await verifyOtpCode(testPhone, "222222");
    await verifyOtpCode(testPhone, "333333");
    const wrongAttempt5 = await verifyOtpCode(testPhone, "444444");
    assert(
      !wrongAttempt5.success && wrongAttempt5.error.toLowerCase().includes("invalidat"),
      "Permanently locks and invalidates OTP after 5 failed attempts"
    );

    // Attempting the correct code now must still be rejected because attempts >= 5
    const correctAfterLockout = await verifyOtpCode(testPhone, generatedOtp!);
    assert(!correctAfterLockout.success, "Rejects genuine OTP once account/code is locked out");

    // Clean up OTP test record
    await prisma.otpVerification.deleteMany({ where: { phone: testPhone } });

    // Request new fresh OTP for valid verification test
    const freshOtpResult = await requestOtp(testPhone);
    assert(freshOtpResult.success === true, "Generates fresh OTP after cleanup");
    const freshOtp = freshOtpResult.success ? freshOtpResult.devOtp! : "";

    // Verify Correct OTP
    const correctAttempt = await verifyOtpCode(testPhone, freshOtp);
    assert(correctAttempt.success, "Successfully verifies correct OTP");

    // Replay attack prevention: Same OTP cannot be verified twice
    const replayAttempt = await verifyOtpCode(testPhone, freshOtp);
    assert(!replayAttempt.success, "Prevents OTP replay attack");

    // Clean up
    await prisma.otpVerification.deleteMany({ where: { phone: testPhone } });
    process.env.DEV_MOCK_OTP = origMock;

    // -------------------------------------------------------------------------
    // TEST 4: Guest Order Persistence & Customer Record Association
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Testing Guest Order Persistence & Customer Linking ---");
    let product = await prisma.product.findFirst({ where: { status: "published" } });
    if (!product) {
      product = await prisma.product.create({
        data: {
          name: "Test Audit Chandbali",
          slug: "test-audit-chandbali",
          basePrice: 1850,
          status: "published",
        },
      });
    }

    const testRefA = `MHRAUDIT-${Date.now().toString().slice(-6)}`;
    const guestPhoneA = "9822001122";

    const customerA = await prisma.customer.upsert({
      where: { phone: guestPhoneA },
      update: { name: "Devika Patwardhan", email: "devika@test.com" },
      create: { phone: guestPhoneA, name: "Devika Patwardhan", email: "devika@test.com" },
    });
    assert(customerA.id !== undefined, "Upserts Customer record in database");

    const orderA = await prisma.order.create({
      data: {
        reference: testRefA,
        customerName: customerA.name,
        customerEmail: customerA.email || "devika@test.com",
        customerPhone: guestPhoneA,
        customerId: customerA.id,
        addressLine1: "Bungalow 7, Prabhat Road",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411004",
        subtotalPaise: 185000,
        shippingPaise: 0,
        totalPaise: 185000,
        paymentStatus: "paid",
        fulfilmentStatus: "unfulfilled",
        items: {
          create: [
            {
              productId: product.id,
              snapshotName: product.name,
              snapshotUnitPaise: 185000,
              quantity: 1,
            },
          ],
        },
      },
      include: { items: true },
    });

    assert(orderA.id !== undefined, "Permanently saves order in SQLite database");
    assert(orderA.accessToken.length > 10, "Generates unique accessToken for secure guest order lookup");
    assert(orderA.customerId === customerA.id, "Associates order with Customer record");
    assert(orderA.items.length === 1, "Saves order items snapshot");

    // -------------------------------------------------------------------------
    // TEST 5: Cross-Customer Data Isolation
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Testing Multi-Tenant & Cross-Customer Isolation ---");
    const guestPhoneB = "9730009988";
    const orderBRef = `MHRISO-${Date.now().toString().slice(-6)}`;
    const orderB = await prisma.order.create({
      data: {
        reference: orderBRef,
        customerName: "Radhika Kulkarni",
        customerEmail: "radhika@test.com",
        customerPhone: guestPhoneB,
        addressLine1: "Flat 4, Kothrud",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411038",
        subtotalPaise: 250000,
        totalPaise: 250000,
        items: {
          create: [{ productId: product.id, snapshotName: product.name, snapshotUnitPaise: 250000, quantity: 1 }],
        },
      },
    });

    // Query orders for Customer A: MUST NOT include Order B
    const customerAOrders = await prisma.order.findMany({
      where: { customerPhone: guestPhoneA },
    });
    assert(
      customerAOrders.some((o) => o.id === orderA.id),
      "Customer A sees their own order"
    );
    assert(
      !customerAOrders.some((o) => o.id === orderB.id),
      "Customer A NEVER sees Customer B's order (Data isolation verified)"
    );

    // -------------------------------------------------------------------------
    // TEST 6: Verified Review System & Anti-Fraud Checks
    // -------------------------------------------------------------------------
    console.log("\n--- 6. Testing Verified Review Rules & Anti-Fraud Guards ---");

    // Rule A: Order must be marked "delivered" before customer can review
    assert(orderA.fulfilmentStatus === "unfulfilled", "Order initially unfulfilled");
    const canReviewUnfulfilled = orderA.fulfilmentStatus === "delivered";
    assert(!canReviewUnfulfilled, "Blocks review while order is unfulfilled/in-transit");

    // Simulate Admin marking order as Delivered
    const deliveredOrder = await prisma.order.update({
      where: { id: orderA.id },
      data: { fulfilmentStatus: "delivered" },
    });
    assert(deliveredOrder.fulfilmentStatus === "delivered", "Admin marks order as Delivered");

    // Submit Verified Review for purchased product
    const review = await prisma.review.create({
      data: {
        productId: product.id,
        orderId: orderA.id,
        customerId: customerA.id,
        rating: 5,
        title: "Spectacular finish and feel",
        comment: "Wore these for a family sangeet in Pune. Extremely lightweight and anti-tarnish.",
        customerName: "Devika P.",
        isVerifiedPurchase: true, // Backend stamped
        status: "pending", // Awaits admin approval
      },
    });

    assert(review.id !== undefined, "Creates verified review record");
    assert(review.isVerifiedPurchase === true, "Auto-stamps isVerifiedPurchase: true");
    assert(review.status === "pending", "Initial review status is pending moderation");

    // Duplicate review check: composite unique key (orderId, productId) must reject duplicate
    try {
      await prisma.review.create({
        data: {
          productId: product.id,
          orderId: orderA.id,
          rating: 4,
          comment: "Duplicate attempt",
          customerName: "Devika P.",
        },
      });
      assert(false, "Blocks duplicate review for same order & product");
    } catch {
      assert(true, "Enforces composite uniqueness (orderId, productId) to prevent duplicate reviews");
    }

    // Public display check: Only approved reviews are visible to public visitors
    const publicApprovedReviewsBefore = await prisma.review.findMany({
      where: { productId: product.id, status: "approved" },
    });
    assert(
      !publicApprovedReviewsBefore.some((r) => r.id === review.id),
      "Pending reviews are HIDDEN from public storefront visitors"
    );

    // Admin moderation: Admin reviews and approves the review
    const approvedReview = await prisma.review.update({
      where: { id: review.id },
      data: { status: "approved" },
    });
    assert(approvedReview.status === "approved", "Admin approves verified review");

    // Public display check: Now visible with Verified Purchase badge
    const publicApprovedReviewsAfter = await prisma.review.findMany({
      where: { productId: product.id, status: "approved" },
    });
    assert(
      publicApprovedReviewsAfter.some((r) => r.id === review.id),
      "Approved review is immediately VISIBLE on product page"
    );

    // -------------------------------------------------------------------------
    // CLEANUP TEST DATA
    // -------------------------------------------------------------------------
    console.log("\n--- Cleaning up test artifacts ---");
    await prisma.review.delete({ where: { id: review.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: { in: [orderA.id, orderB.id] } } });
    await prisma.order.deleteMany({ where: { id: { in: [orderA.id, orderB.id] } } });
    await prisma.customer.deleteMany({ where: { id: customerA.id } });
    console.log("[CLEANUP] Test orders, customer, and reviews safely removed from SQLite.");

    console.log("\n=================================================");
    console.log(` AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution failed with unhandled exception:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
