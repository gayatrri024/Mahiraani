// src/app/api/admin/orders/route.ts – List and filter orders
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const query = searchParams.get("q");

  const whereClause: Prisma.OrderWhereInput = {};
  if (status && status !== "all") {
    whereClause.fulfilmentStatus = status;
  }
  if (query) {
    whereClause.OR = [
      { reference: { contains: query } },
      { customerName: { contains: query } },
      { customerEmail: { contains: query } },
      { customerPhone: { contains: query } },
    ];
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json({ orders });
}
