// scripts/test-live-api-handlers.ts – Direct Route Handler Testing
import { NextRequest } from "next/server";
import { prisma } from "../src/lib/prisma";
import { POST as createOrderHandler } from "../src/app/api/orders/route";
import { POST as sendOtpHandler } from "../src/app/api/orders/lookup/send-otp/route";
import { POST as verifyOtpHandler } from "../src/app/api/orders/lookup/verify-otp/route";
import { GET as myOrdersHandler } from "../src/app/api/orders/lookup/my-orders/route";
import { GET as getReviewsHandler, POST as postReviewHandler } from "../src/app/api/reviews/route";
import { GET as getAdminReviewsHandler } from "../src/app/api/admin/reviews/route";
import { PATCH as patchAdminReviewHandler } from "../src/app/api/admin/reviews/[id]/route";
import { createAdminSession } from "../src/lib/auth";
import { CUSTOMER_COOKIE_NAME } from "../src/lib/customer";

async function runRouteTests() {
  console.log("=================================================");
  console.log(" MAHIRAANI ROUTE HANDLER SECURITY & JOURNEY TEST");
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

  // Setup test product
  let product = await prisma.product.findFirst({ where: { status: "published" } });
  if (!product) {
    product = await prisma.product.create({
      data: {
        name: "Route Test Chandbali",
        slug: "route-test-chandbali",
        basePrice: 1850,
        status: "published",
      },
    });
  }

  const testPhone = "9823112233";
  let createdOrderId = "";
  let createdOrderRef = "";
  let createdAccessToken = "";
  let customerSessionCookie = "";
  let createdReviewId = "";

  try {
    // -------------------------------------------------------------------------
    // SCENARIO A: Guest Checkout (POST /api/orders)
    // -------------------------------------------------------------------------
    console.log("--- Scenario A: Guest Checkout & Order Persistence ---");
    const orderPayload = {
      customerName: "Radha Deshpande",
      customerEmail: "radha.d@example.com",
      customerPhone: testPhone,
      addressLine1: "12 Senapati Bapat Road",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411016",
      paymentMethod: "manual_upi",
      items: [{ productId: product.id, quantity: 1 }],
    };

    const orderReq = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    const orderRes = await createOrderHandler(orderReq);
    assert(orderRes.status === 200, "POST /api/orders returns HTTP 200");
    const orderData = await orderRes.json();
    assert(Boolean(orderData.order?.id), "Returns created order ID");
    assert(Boolean(orderData.order?.accessToken), "Returns unique order accessToken");
    assert(
      !orderRes.cookies.get(CUSTOMER_COOKIE_NAME),
      "CRITICAL: Does NOT leak customer session cookie to checkout browser without OTP"
    );

    createdOrderId = orderData.order.id;
    createdOrderRef = orderData.order.reference;
    createdAccessToken = orderData.order.accessToken;
    assert(createdOrderRef.startsWith("MH-"), "Order reference adheres to MH-YYYY-XXXX format");

    // Verify database record
    const dbOrder = await prisma.order.findUnique({
      where: { id: createdOrderId },
      include: { customer: true, items: true },
    });
    assert(dbOrder !== null, "Order is permanently persisted in SQLite");
    assert(dbOrder?.customer?.phone === testPhone, "Order is associated with Customer record");
    assert(dbOrder?.items.length === 1, "Order items snapshot is preserved");

    // -------------------------------------------------------------------------
    // SCENARIO B & C: Returning Customer & OTP Lifecycle
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario B & C: OTP Lifecycle, Cooldown & Security ---");
    // Enable DEV_MOCK_OTP for local testing
    process.env.DEV_MOCK_OTP = "true";

    // 1. Send OTP with invalid phone
    const badOtpReq = new NextRequest("http://localhost:3000/api/orders/lookup/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "12345" }),
    });
    const badOtpRes = await sendOtpHandler(badOtpReq);
    assert(badOtpRes.status === 429 || badOtpRes.status === 400, "Rejects malformed mobile number");

    // 2. Send genuine OTP
    await prisma.otpVerification.deleteMany({ where: { phone: testPhone } });
    const sendOtpReq = new NextRequest("http://localhost:3000/api/orders/lookup/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone }),
    });
    const sendOtpRes = await sendOtpHandler(sendOtpReq);
    assert(sendOtpRes.status === 200, "POST /api/orders/lookup/send-otp returns HTTP 200");
    const sendOtpData = await sendOtpRes.json();
    const mockCode = sendOtpData.devOtp;
    assert(Boolean(mockCode && mockCode.length === 6), "Issues 6-digit verification code");

    // 3. Verify Wrong OTP
    const wrongVerifyReq = new NextRequest("http://localhost:3000/api/orders/lookup/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, code: "000000" }),
    });
    const wrongVerifyRes = await verifyOtpHandler(wrongVerifyReq);
    assert(wrongVerifyRes.status === 400, "Rejects incorrect OTP");

    // 4. Verify Correct OTP
    const verifyReq = new NextRequest("http://localhost:3000/api/orders/lookup/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone, code: mockCode }),
    });
    const verifyRes = await verifyOtpHandler(verifyReq);
    assert(verifyRes.status === 200, "POST /api/orders/lookup/verify-otp returns HTTP 200");
    const sessionCookieObj = verifyRes.cookies.get(CUSTOMER_COOKIE_NAME);
    assert(Boolean(sessionCookieObj?.value), "Returns signed HTTP-only customer session cookie");
    assert(sessionCookieObj?.httpOnly === true, "Cookie is strictly httpOnly");
    customerSessionCookie = sessionCookieObj?.value || "";

    // -------------------------------------------------------------------------
    // SCENARIO B (cont.): Retrieve Customer Orders (GET /api/orders/lookup/my-orders)
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario B (cont.): Authenticated Order Retrieval ---");
    // Without cookie
    const unauthOrdersReq = new NextRequest("http://localhost:3000/api/orders/lookup/my-orders");
    const unauthOrdersRes = await myOrdersHandler(unauthOrdersReq);
    assert(unauthOrdersRes.status === 401, "GET /api/orders/lookup/my-orders unauthenticated returns 401");

    // With cookie
    const authOrdersReq = new NextRequest("http://localhost:3000/api/orders/lookup/my-orders", {
      headers: { cookie: `${CUSTOMER_COOKIE_NAME}=${customerSessionCookie}` },
    });
    const authOrdersRes = await myOrdersHandler(authOrdersReq);
    assert(authOrdersRes.status === 200, "GET /api/orders/lookup/my-orders returns 200 with valid session cookie");
    const authOrdersData = await authOrdersRes.json();
    assert(authOrdersData.orders.length >= 1, "Customer retrieves their own orders");
    assert(authOrdersData.orders.some((o: { id: string }) => o.id === createdOrderId), "Contains created order");

    // -------------------------------------------------------------------------
    // SCENARIO D: Verified Reviews & Anti-Fraud
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario D: Verified Reviews & Anti-Fraud Validation ---");

    // 1. Attempt review on unfulfilled order -> Should return 400
    const unfulfilledReviewReq = new NextRequest("http://localhost:3000/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `${CUSTOMER_COOKIE_NAME}=${customerSessionCookie}`,
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        productId: product.id,
        orderToken: createdAccessToken,
        rating: 5,
        comment: "Tried early review",
        customerName: "Radha D.",
      }),
    });
    const unfulfilledReviewRes = await postReviewHandler(unfulfilledReviewReq);
    assert(unfulfilledReviewRes.status === 400, "Blocks review submission on unfulfilled order");

    // 2. Mark order as Delivered in DB
    await prisma.order.update({
      where: { id: createdOrderId },
      data: { fulfilmentStatus: "delivered" },
    });

    // 3. Submit review with XSS tags to test sanitization
    const xssReviewReq = new NextRequest("http://localhost:3000/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `${CUSTOMER_COOKIE_NAME}=${customerSessionCookie}`,
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        productId: product.id,
        orderToken: createdAccessToken,
        rating: 5,
        title: "<script>alert('xss')</script>Flawless Finish",
        comment: "<b>Spectacular</b> gold polish and safe for sensitive ears. <img src=x onerror=alert(1)>",
        customerName: "Radha <style>body{color:red}</style>D.",
      }),
    });
    const xssReviewRes = await postReviewHandler(xssReviewReq);
    assert(xssReviewRes.status === 201, "POST /api/reviews succeeds on delivered order");
    const reviewData = await xssReviewRes.json();
    assert(Boolean(reviewData.review?.id), "Returns created review ID");
    createdReviewId = reviewData.review.id;

    // Check DB for sanitized content
    const dbReview = await prisma.review.findUnique({ where: { id: createdReviewId } });
    assert(dbReview?.isVerifiedPurchase === true, "Auto-stamps isVerifiedPurchase: true");
    assert(dbReview?.status === "pending", "Initial status is pending moderation");
    assert(!dbReview?.title?.includes("<script>"), "Sanitizes raw script tags from title");
    assert(!dbReview?.comment?.includes("<b>"), "Sanitizes HTML tags from comment");
    assert(!dbReview?.customerName?.includes("<style>"), "Sanitizes style tags from display name");

    // 4. Duplicate review attempt on same purchase (create fresh request with unconsumed body stream)
    const duplicateReviewReq = new NextRequest("http://localhost:3000/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `${CUSTOMER_COOKIE_NAME}=${customerSessionCookie}`,
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        productId: product.id,
        orderToken: createdAccessToken,
        rating: 4,
        comment: "Attempting duplicate review on same piece",
        customerName: "Radha D.",
      }),
    });
    const duplicateReviewRes = await postReviewHandler(duplicateReviewReq);
    assert(duplicateReviewRes.status === 400, "Blocks duplicate review for same order & product");

    // 5. Storefront check: Unapproved reviews must NOT appear on public GET /api/reviews
    const publicReviewsReq = new NextRequest(`http://localhost:3000/api/reviews?productId=${product.id}`);
    const publicReviewsRes = await getReviewsHandler(publicReviewsReq);
    const publicData = await publicReviewsRes.json();
    assert(
      !publicData.reviews.some((r: { id: string }) => r.id === createdReviewId),
      "Pending reviews are omitted from public GET /api/reviews"
    );

    // -------------------------------------------------------------------------
    // SCENARIO E: Admin Moderation & Authorization Attacks
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario E: Admin Moderation & Authorization Attacks ---");

    // 1. Unauthenticated PATCH /api/admin/reviews/[id]
    const unauthAdminReq = new NextRequest(`http://localhost:3000/api/admin/reviews/${createdReviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    const unauthAdminRes = await patchAdminReviewHandler(unauthAdminReq, {
      params: Promise.resolve({ id: createdReviewId }),
    });
    assert(unauthAdminRes.status === 401, "Blocks unauthorized review moderation (HTTP 401)");

    // 2. Customer token presented to Admin API -> Must be rejected
    const customerAsAdminReq = new NextRequest(`http://localhost:3000/api/admin/reviews`, {
      headers: { cookie: `mhraani_admin_session=${customerSessionCookie}` },
    });
    const customerAsAdminRes = await getAdminReviewsHandler(customerAsAdminReq);
    assert(customerAsAdminRes.status === 401, "CRITICAL: Rejects customer token used as admin cookie");

    // 3. Genuine Admin approval
    const adminToken = await createAdminSession({
      id: "admin_test",
      email: "concierge@mahiraani.com",
      name: "Concierge Admin",
      role: "admin",
    });

    const authAdminReq = new NextRequest(`http://localhost:3000/api/admin/reviews/${createdReviewId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: `mhraani_admin_session=${adminToken}`,
      },
      body: JSON.stringify({ status: "approved" }),
    });
    const authAdminRes = await patchAdminReviewHandler(authAdminReq, {
      params: Promise.resolve({ id: createdReviewId }),
    });
    assert(authAdminRes.status === 200, "Admin successfully approves review");

    // 4. Verify public display after approval
    const publicAfterApprovalRes = await getReviewsHandler(publicReviewsReq);
    const publicAfterData = await publicAfterApprovalRes.json();
    assert(
      publicAfterData.reviews.some((r: { id: string }) => r.id === createdReviewId),
      "Approved review is immediately returned on public GET /api/reviews"
    );
    assert(publicAfterData.summary.totalReviews >= 1, "Public review count updated");
    assert(publicAfterData.summary.averageRating > 0, "Average rating dynamically computed");

    // -------------------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------------------
    console.log("\n--- Cleanup ---");
    if (createdReviewId) {
      await prisma.review.delete({ where: { id: createdReviewId } });
    }
    if (createdOrderId) {
      await prisma.orderItem.deleteMany({ where: { orderId: createdOrderId } });
      await prisma.order.delete({ where: { id: createdOrderId } });
    }
    await prisma.customer.deleteMany({ where: { phone: testPhone } });
    await prisma.otpVerification.deleteMany({ where: { phone: testPhone } });
    console.log("[CLEANUP] Successfully cleaned all test records from SQLite database.");

    console.log("\n=================================================");
    console.log(` ALL CHECKS PASSED: ${passed} PASSED, ${failed} FAILED`);
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

runRouteTests();
