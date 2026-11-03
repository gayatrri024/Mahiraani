// src/app/api/admin/reviews/route.ts – Admin Reviews Management API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, COOKIE_NAME } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get(COOKIE_NAME)?.value;
  const session = await getAdminSession(adminCookie);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const query = searchParams.get("q");

  const whereClause: Prisma.ReviewWhereInput = {};
  if (status && status !== "all") {
    whereClause.status = status;
  }
  if (query) {
    whereClause.OR = [
      { customerName: { contains: query } },
      { comment: { contains: query } },
      { title: { contains: query } },
      { order: { reference: { contains: query } } },
      { product: { name: { contains: query } } },
    ];
  }

  const reviews = await prisma.review.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      order: {
        select: {
          id: true,
          reference: true,
          customerName: true,
          customerPhone: true,
          fulfilmentStatus: true,
        },
      },
    },
  });

  return NextResponse.json({ reviews });
}

