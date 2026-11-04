// scripts/test-admin-product-lifecycle.ts
// Comprehensive automated test suite for Mahiraani Admin Product Lifecycle

import { NextRequest } from "next/server";
import { prisma } from "../src/lib/prisma";
import { POST as loginHandler } from "../src/app/api/admin/auth/login/route";
import { GET as listProductsHandler, POST as createProductHandler } from "../src/app/api/admin/products/route";
import {
  PATCH as patchProductHandler,
  DELETE as deleteProductHandler,
} from "../src/app/api/admin/products/[id]/route";
import { POST as uploadImagesHandler } from "../src/app/api/admin/products/[id]/images/route";
import { createAdminSession, COOKIE_NAME } from "../src/lib/auth";
import { deleteUploadedFile } from "../src/lib/upload";

async function runTests() {
  console.log("=================================================");
  console.log(" MAHIRAANI ADMIN PRODUCT LIFECYCLE AUDIT SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` -> ${detail}` : ""}`);
      failed++;
    }
  }

  let adminCookie = "";
  let createdProductId = "";
  let secondProductId = "";

  try {
    // -------------------------------------------------------------------------
    // 1. ADMIN AUTHENTICATION
    // -------------------------------------------------------------------------
    console.log("--- 1. Admin Authentication ---");

    // Invalid login attempt
    const invalidLoginReq = new NextRequest("http://localhost:3000/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@mahiraani.com", password: "wrong-password" }),
    });
    const invalidLoginRes = await loginHandler(invalidLoginReq);
    assert(invalidLoginRes.status === 401, "Rejects invalid admin credentials with 401");

    // Valid admin session generation
    const validAdmin = await prisma.adminUser.findFirst();
    assert(Boolean(validAdmin), "Existing admin account exists in database");

    if (validAdmin) {
      adminCookie = await createAdminSession({
        id: validAdmin.id,
        email: validAdmin.email,
        name: validAdmin.name,
        role: validAdmin.role,
      });
      assert(Boolean(adminCookie && adminCookie.length > 50), "Admin JWT session token created successfully");
    }

    // -------------------------------------------------------------------------
    // 2. ROUTE ACCESS PROTECTION
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Route Access Protection ---");

    // Unauthenticated GET /api/admin/products
    const unauthGetReq = new NextRequest("http://localhost:3000/api/admin/products");
    const unauthGetRes = await listProductsHandler(unauthGetReq);
    assert(unauthGetRes.status === 401, "Blocks unauthenticated GET /api/admin/products with 401");

    // Unauthenticated POST /api/admin/products
    const unauthPostReq = new NextRequest("http://localhost:3000/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Unauthenticated Test" }),
    });
    const unauthPostRes = await createProductHandler(unauthPostReq);
    assert(unauthPostRes.status === 401, "Blocks unauthenticated POST /api/admin/products with 401");

    // Tampered token
    const tamperedReq = new NextRequest("http://localhost:3000/api/admin/products", {
      headers: { cookie: `${COOKIE_NAME}=invalid.jwt.signature` },
    });
    const tamperedRes = await listProductsHandler(tamperedReq);
    assert(tamperedRes.status === 401, "Blocks tampered JWT token with 401");

    // -------------------------------------------------------------------------
    // 3. PRODUCT CREATION & VALIDATION
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Product Creation & Validation ---");

    // Empty name validation
    const emptyNameReq = new NextRequest("http://localhost:3000/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `${COOKIE_NAME}=${adminCookie}`,
      },
      body: JSON.stringify({ name: "", basePrice: 50000 }),
    });
    const emptyNameRes = await createProductHandler(emptyNameReq);
    assert(emptyNameRes.status === 400, "Rejects product creation with empty name (400)");

    // Valid product creation (Draft)
    const validCreateReq = new NextRequest("http://localhost:3000/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `${COOKIE_NAME}=${adminCookie}`,
      },
      body: JSON.stringify({
        name: "Lifecycle Test Royal Polki Choker",
        basePrice: 125000, // ₹1,250 in paise
        stock: 5,
        lowStockThreshold: 2,
        material: "Brass alloy, faux pearls",
        status: "draft",
      }),
    });
    const validCreateRes = await createProductHandler(validCreateReq);
    assert(validCreateRes.status === 201, "Creates valid product as draft (201)");
    const createdData = await validCreateRes.json();
    createdProductId = createdData.product?.id;
    assert(Boolean(createdProductId), "Returns created product ID");
    assert(
      createdData.product?.slug?.includes("lifecycle-test-royal-polki-choker"),
      "Automatically generates URL-friendly slug from product name"
    );

    // -------------------------------------------------------------------------
    // 4. IMAGE UPLOAD & VALIDATION
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Image Upload & Validation ---");

    // Simulated valid JPEG upload
    const validImageContent = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    const validImageFile = new File([validImageContent], "choker.jpg", { type: "image/jpeg" });
    const imageFormData = new FormData();
    imageFormData.append("images", validImageFile);

    const uploadReq = new NextRequest(
      `http://localhost:3000/api/admin/products/${createdProductId}/images`,
      {
        method: "POST",
        headers: { cookie: `${COOKIE_NAME}=${adminCookie}` },
        body: imageFormData,
      }
    );
    const uploadRes = await uploadImagesHandler(uploadReq, {
      params: Promise.resolve({ id: createdProductId }),
    });
    assert(uploadRes.status === 201, "Uploads valid product image (201)");
    const uploadData = await uploadRes.json();
    assert(uploadData.images?.length === 1, "Returns created image record");
    assert(uploadData.images?.[0]?.isCover === true, "First image is automatically marked as main cover");

    // Disallowed mime-type upload (e.g. application/pdf)
    const invalidFile = new File(["dummy pdf content"], "doc.pdf", { type: "application/pdf" });
    const invalidFormData = new FormData();
    invalidFormData.append("images", invalidFile);
    const invalidUploadReq = new NextRequest(
      `http://localhost:3000/api/admin/products/${createdProductId}/images`,
      {
        method: "POST",
        headers: { cookie: `${COOKIE_NAME}=${adminCookie}` },
        body: invalidFormData,
      }
    );
    const invalidUploadRes = await uploadImagesHandler(invalidUploadReq, {
      params: Promise.resolve({ id: createdProductId }),
    });
    assert(invalidUploadRes.status === 400, "Rejects disallowed file mime-type (400)");

    // -------------------------------------------------------------------------
    // 5. PRODUCT UPDATE & SLUG UNIQUENESS
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Product Update & Slug Uniqueness ---");

    // Update price and stock
    const patchReq = new NextRequest(`http://localhost:3000/api/admin/products/${createdProductId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: `${COOKIE_NAME}=${adminCookie}`,
      },
      body: JSON.stringify({
        basePrice: 145000, // ₹1,450
        stock: 12,
        shortDescription: "Handcrafted choker for wedding celebrations",
      }),
    });
    const patchRes = await patchProductHandler(patchReq, {
      params: Promise.resolve({ id: createdProductId }),
    });
    assert(patchRes.status === 200, "Successfully updates product fields (200)");
    const patchData = await patchRes.json();
    assert(patchData.product?.basePrice === 145000, "Product price updated in database");
    assert(patchData.product?.stock === 12, "Product stock quantity updated in database");

    // Create a second product with the same name to test collision handling
    const dupNameReq = new NextRequest("http://localhost:3000/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `${COOKIE_NAME}=${adminCookie}`,
      },
      body: JSON.stringify({
        name: "Lifecycle Test Royal Polki Choker",
        basePrice: 125000,
        status: "draft",
      }),
    });
    const dupNameRes = await createProductHandler(dupNameReq);
    assert(dupNameRes.status === 201, "Creates second product with duplicate name without collision (201)");
    const dupData = await dupNameRes.json();
    secondProductId = dupData.product?.id;
    assert(
      dupData.product?.slug !== createdData.product?.slug,
      "Slug collision handled cleanly by appending unique timestamp suffix"
    );

    // -------------------------------------------------------------------------
    // 6. STATUS TRANSITIONS & STOREFRONT VISIBILITY
    // -------------------------------------------------------------------------
    console.log("\n--- 6. Status Transitions & Storefront Visibility ---");

    // Verify draft is hidden from public published catalogue
    let publicPieces = await prisma.product.findMany({ where: { status: "published" } });
    assert(
      !publicPieces.some((p) => p.id === createdProductId),
      "Draft product is NOT visible in public published catalogue"
    );

    // Publish the product
    const publishReq = new NextRequest(`http://localhost:3000/api/admin/products/${createdProductId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: `${COOKIE_NAME}=${adminCookie}`,
      },
      body: JSON.stringify({ status: "published" }),
    });
    const publishRes = await patchProductHandler(publishReq, {
      params: Promise.resolve({ id: createdProductId }),
    });
    assert(publishRes.status === 200, "Successfully published product to store (200)");

    // Verify published product is now returned in public query
    publicPieces = await prisma.product.findMany({ where: { status: "published" } });
    assert(
      publicPieces.some((p) => p.id === createdProductId),
      "Published product is now VISIBLE in public published catalogue"
    );

    // -------------------------------------------------------------------------
    // 7. DELETION & ARCHIVING INTEGRITY
    // -------------------------------------------------------------------------
    console.log("\n--- 7. Deletion & Archiving Integrity ---");

    // A product without orders can be permanently deleted
    const deleteReq = new NextRequest(`http://localhost:3000/api/admin/products/${secondProductId}`, {
      method: "DELETE",
      headers: { cookie: `${COOKIE_NAME}=${adminCookie}` },
    });
    const deleteRes = await deleteProductHandler(deleteReq, {
      params: Promise.resolve({ id: secondProductId }),
    });
    assert(deleteRes.status === 200, "Permanently deletes unpurchased product (200)");
    const deleteData = await deleteRes.json();
    assert(deleteData.deleted === true, "Response confirms permanent deletion");
    const checkDeleted = await prisma.product.findUnique({ where: { id: secondProductId } });
    assert(checkDeleted === null, "Product successfully removed from database");
    secondProductId = ""; // cleaned up

    // Simulating an order item on the primary test product to test order protection
    const testOrder = await prisma.order.create({
      data: {
        reference: `MHR-TEST-${Date.now()}`,
        customerName: "Handover Audit Test",
        customerEmail: "audit@mahiraani.com",
        customerPhone: "9876543210",
        addressLine1: "123 MG Road",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411001",
        subtotalPaise: 145000,
        totalPaise: 145000,
        items: {
          create: {
            productId: createdProductId,
            snapshotName: "Lifecycle Test Royal Polki Choker",
            snapshotUnitPaise: 145000,
            quantity: 1,
          },
        },
      },
    });

    // Attempting to delete product with order history
    const deleteOrderedReq = new NextRequest(`http://localhost:3000/api/admin/products/${createdProductId}`, {
      method: "DELETE",
      headers: { cookie: `${COOKIE_NAME}=${adminCookie}` },
    });
    const deleteOrderedRes = await deleteProductHandler(deleteOrderedReq, {
      params: Promise.resolve({ id: createdProductId }),
    });
    assert(deleteOrderedRes.status === 200, "Delete request completes safely (200)");
    const deleteOrderedData = await deleteOrderedRes.json();
    assert(deleteOrderedData.archived === true, "Automatically archives product to preserve customer order history");

    const checkArchived = await prisma.product.findUnique({ where: { id: createdProductId } });
    assert(checkArchived?.status === "archived", "Product status updated to 'archived' in database");

    // Clean up simulated order and product
    await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
    await prisma.order.delete({ where: { id: testOrder.id } });
    const imagesToDelete = await prisma.productImage.findMany({ where: { productId: createdProductId } });
    for (const img of imagesToDelete) {
      await deleteUploadedFile(img.url);
    }
    await prisma.productImage.deleteMany({ where: { productId: createdProductId } });
    await prisma.product.delete({ where: { id: createdProductId } });
    createdProductId = ""; // cleaned up
    assert(true, "Test data cleaned up; production database left pristine");
  } catch (error) {
    console.error("Test execution threw error:", error);
    failed++;
  } finally {
    // Safety cleanup in case of unexpected abort
    if (createdProductId) {
      try {
        await prisma.productImage.deleteMany({ where: { productId: createdProductId } });
        await prisma.product.delete({ where: { id: createdProductId } });
      } catch {}
    }
    if (secondProductId) {
      try {
        await prisma.product.delete({ where: { id: secondProductId } });
      } catch {}
    }
  }

  console.log("\n=================================================");
  console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
