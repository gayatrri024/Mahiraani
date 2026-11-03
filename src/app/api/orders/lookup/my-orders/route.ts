// src/app/api/orders/lookup/my-orders/route.ts – Authenticated Customer Orders API
import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession, CUSTOMER_COOKIE_NAME } from "@/lib/customer";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const cookieToken = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  const session = await getCustomerSession(cookieToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please verify via OTP." }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: {
      customerPhone: session.phone,
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: { take: 1, orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
      reviews: {
        select: {
          id: true,
          productId: true,
          rating: true,
          status: true,
        },
      },
    },
  });

  return NextResponse.json({
    customer: session,
    orders,
  });
}

