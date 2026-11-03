// src/app/api/orders/route.ts – Storefront Order Creation Endpoint
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone } from "@/lib/customer";

const OrderCreateSchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  customerEmail: z.string().email("Valid email address is required"),
  customerPhone: z
    .string()
    .min(10, "Valid 10-digit phone number is required")
    .regex(/^[0-9+\s-]{10,15}$/, "Invalid phone format"),
  addressLine1: z.string().min(5, "Delivery address is required"),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid 6-digit PIN code is required"),
  isGiftWrap: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  paymentMethod: z.enum(["manual_upi", "razorpay"]).default("manual_upi"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional().nullable(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "At least one item is required in the bag"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OrderCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid order information" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Fetch and verify products from database
    const productIds = data.items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        variants: true,
      },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedSubtotalPaise = 0;
    const orderItemsToCreate = [];

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      let unitPaise = product.basePrice || 0;
      let variantName: string | null = null;
      let sku: string | null = product.sku || null;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          unitPaise = variant.price;
          variantName = variant.name;
          sku = variant.sku || sku;
        }
      }

      calculatedSubtotalPaise += unitPaise * item.quantity;

      orderItemsToCreate.push({
        productId: product.id,
        variantId: item.variantId || null,
        snapshotName: product.name,
        snapshotVariantName: variantName,
        snapshotSku: sku,
        snapshotUnitPaise: unitPaise,
        quantity: item.quantity,
      });
    }

    // Gift wrap adds ₹70 (7000 paise)
    const giftWrapPaise = data.isGiftWrap ? 7000 : 0;
    // Free shipping on prepaid orders
    const shippingPaise = 0;
    const totalPaise = calculatedSubtotalPaise + giftWrapPaise + shippingPaise;

    // Normalize phone & find or create permanent Customer record
    const normalizedPhone = normalizeIndianPhone(data.customerPhone);
    const customer = await prisma.customer.upsert({
      where: { phone: normalizedPhone },
      update: {
        name: data.customerName,
        email: data.customerEmail || undefined,
      },
      create: {
        phone: normalizedPhone,
        name: data.customerName,
        email: data.customerEmail || undefined,
      },
    });

    // Generate unique human-readable reference: MH-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const reference = `MH-${currentYear}-${randomHex}`;

    const order = await prisma.order.create({
      data: {
        reference,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: normalizedPhone,
        customerId: customer.id,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: "India",
        subtotalPaise: calculatedSubtotalPaise,
        shippingPaise,
        discountPaise: 0,
        taxPaise: 0,
        totalPaise,
        paymentStatus: "pending",
        fulfilmentStatus: "unfulfilled",
        paymentProvider: data.paymentMethod,
        isTest: false,
        items: {
          create: orderItemsToCreate,
        },
        events: {
          create: [
            {
              type: "order_placed",
              note: `Web order placed by ${data.customerName}. Payment method: ${data.paymentMethod}. ${
                data.notes ? `Customer note: ${data.notes}` : ""
              }`,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });

    // Return order details with secure one-click accessToken for post-checkout confirmation
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        reference: order.reference,
        accessToken: order.accessToken,
        totalPaise: order.totalPaise,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order. Please try again or reach our WhatsApp concierge." },
      { status: 500 }
    );
  }
}

