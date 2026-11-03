// src/app/api/admin/reviews/[id]/route.ts – Moderate or Delete a Review
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, COOKIE_NAME } from "@/lib/auth";

type Params = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const adminCookie = req.cookies.get(COOKIE_NAME)?.value;
  const session = await getAdminSession(adminCookie);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  let body: { status?: string; adminNotes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (body.status && !["pending", "approved", "rejected"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: {
      status: body.status || undefined,
      adminNotes: body.adminNotes !== undefined ? body.adminNotes : undefined,
    },
  });

  return NextResponse.json({ review: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const adminCookie = req.cookies.get(COOKIE_NAME)?.value;
  const session = await getAdminSession(adminCookie);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

