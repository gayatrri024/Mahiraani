// src/app/api/reviews/route.ts – Public & Verified Customer Review API
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCustomerSession, CUSTOMER_COOKIE_NAME } from "@/lib/customer";
import { verifyScopedReviewToken } from "@/lib/otp";

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

const ReviewSubmissionSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5 stars"),
  title: z.string().max(120).optional().nullable(),
  comment: z.string().min(5, "Review must be at least 5 characters long").max(2000),
  customerName: z.string().min(2, "Display name is required").max(60),
  images: z.array(z.string().url()).optional().nullable(),
  orderToken: z.string().optional().nullable(),
});

// GET /api/reviews?productId=xxx – Public approved reviews + summary metrics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        status: "approved", // Only approved reviews are public
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        customerName: true,
        isVerifiedPurchase: true,
        images: true,
        createdAt: true,
      },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 0;

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      if (r.rating in ratingCounts) {
        ratingCounts[r.rating as 1 | 2 | 3 | 4 | 5]++;
      }
    }

    // Check if the current customer viewing is eligible to review
    const customerCookie = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const session = await getCustomerSession(customerCookie);
    let isEligible = false;
    let eligibleOrderId: string | null = null;

    if (session) {
      const eligibleOrder = await prisma.order.findFirst({
        where: {
          customerPhone: session.phone,
          fulfilmentStatus: "delivered",
          paymentStatus: { notIn: ["cancelled", "failed"] },
          items: { some: { productId } },
          reviews: { none: { productId } }, // Has not yet reviewed
        },
        select: { id: true },
      });

      if (eligibleOrder) {
        isEligible = true;
        eligibleOrderId = eligibleOrder.id;
      }
    }

    return NextResponse.json({
      reviews,
      summary: {
        totalReviews,
        averageRating,
        ratingCounts,
      },
      viewer: {
        isEligible,
        eligibleOrderId,
        customerName: session?.name || null,
      },
    });
  } catch (error) {
    console.error("[Get Reviews API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}

// POST /api/reviews – Strict backend-verified review submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReviewSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid review data" },
        { status: 400 }
      );
    }

    const { orderId, productId, rating, title, comment, customerName, images, orderToken } =
      parsed.data;

    // 1. Authenticate caller: either via customer session cookie OR order accessToken
    const customerCookie = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const session = await getCustomerSession(customerCookie);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Verify ownership via session cookie, order accessToken, or scoped review token
    const isSessionOwner = Boolean(session && session.phone === order.customerPhone);
    const isTokenOwner = Boolean(
      orderToken &&
        (orderToken === order.accessToken ||
          verifyScopedReviewToken(order.id, productId, orderToken))
    );

    if (!isSessionOwner && !isTokenOwner) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. You can only review products from your verified purchase.",
        },
        { status: 403 }
      );
    }

    // 2. Strict Delivery Check: Review only allowed if order is marked Delivered
    if (order.fulfilmentStatus !== "delivered") {
      return NextResponse.json(
        {
          error:
            "Reviews can only be submitted after your order has been marked as Delivered.",
        },
        { status: 400 }
      );
    }

    // 3. Strict Payment Check
    if (order.paymentStatus === "failed") {
      return NextResponse.json(
        { error: "Orders with failed payment are not eligible for product reviews." },
        { status: 400 }
      );
    }

    // 4. Verify that the order actually purchased this specific product
    const containsProduct = order.items.some((i) => i.productId === productId);
    if (!containsProduct) {
      return NextResponse.json(
        { error: "This order does not contain the specified product." },
        { status: 400 }
      );
    }

    // 5. Duplicate review prevention
    const existingReview = await prisma.review.findUnique({
      where: {
        orderId_productId: {
          orderId,
          productId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already submitted a review for this purchase." },
        { status: 400 }
      );
    }

    // 6. Sanitize Text Content (XSS Protection)
    const cleanTitle = title ? stripHtml(title) : null;
    const cleanComment = stripHtml(comment);
    const cleanName = stripHtml(customerName);

    if (cleanComment.length < 5) {
      return NextResponse.json(
        { error: "Review comment must be at least 5 characters after removing formatting." },
        { status: 400 }
      );
    }

    // 7. Save Verified Review
    const review = await prisma.review.create({
      data: {
        productId,
        orderId,
        customerId: order.customerId || null,
        rating,
        title: cleanTitle || null,
        comment: cleanComment,
        customerName: cleanName || "Verified Patron",
        isVerifiedPurchase: true, // Backend stamped
        status: "pending", // Awaits admin approval
        images: images && images.length > 0 ? JSON.stringify(images) : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you! Your verified review has been submitted and will appear on the product page once approved.",
        review: {
          id: review.id,
          rating: review.rating,
          status: review.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Post Review API] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit review. Please try again." },
      { status: 500 }
    );
  }
}

