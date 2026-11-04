// src/app/api/admin/orders/[id]/route.ts – Order details and status updates
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma/client";

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { fulfilmentStatus, paymentStatus, courierName, trackingNumber, trackingUrl, note } = body;

  const updateData: Prisma.OrderUpdateInput = {};
  if (typeof fulfilmentStatus === "string") updateData.fulfilmentStatus = fulfilmentStatus;
  if (typeof paymentStatus === "string") updateData.paymentStatus = paymentStatus;
  if (typeof courierName === "string" || courierName === null) updateData.courierName = courierName;
  if (typeof trackingNumber === "string" || trackingNumber === null) updateData.trackingNumber = trackingNumber;
  if (typeof trackingUrl === "string" || trackingUrl === null) updateData.trackingUrl = trackingUrl;

  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...updateData,
      events: typeof note === "string" && note
        ? {
            create: {
              type: typeof fulfilmentStatus === "string" ? `status_${fulfilmentStatus}` : "admin_update",
              note: `${session.name}: ${note}`,
            },
          }
        : undefined,
    },
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json({ order: updated });
}
