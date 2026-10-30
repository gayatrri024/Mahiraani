// src/app/api/admin/products/[id]/variants/[variantId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const UpdateVariantSchema = z.object({
  name: z.string().min(1).optional(),
  options: z.record(z.string(), z.string()).optional(),
  price: z.number().int().nonnegative().optional(),
  comparePrice: z.number().int().nonnegative().optional().nullable(),
  sku: z.string().optional().nullable(),
  stock: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

type Params = Promise<{ id: string; variantId: string }>;

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { variantId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parse = UpdateVariantSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues[0].message }, { status: 400 });
  }

  const { options, ...rest } = parse.data;

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      ...rest,
      ...(options ? { options: JSON.stringify(options) } : {}),
    },
  });

  return NextResponse.json({ variant });
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { variantId } = await params;

  await prisma.productVariant.delete({ where: { id: variantId } });
  return NextResponse.json({ ok: true });
}
