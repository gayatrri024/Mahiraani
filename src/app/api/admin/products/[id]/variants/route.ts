// src/app/api/admin/products/[id]/variants/route.ts
// CRUD for product variants

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const VariantSchema = z.object({
  name: z.string().min(1),
  options: z.record(z.string(), z.string()),
  price: z.number().int().nonnegative(),
  comparePrice: z.number().int().nonnegative().optional().nullable(),
  sku: z.string().optional().nullable(),
  stock: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const BulkVariantsSchema = z.array(VariantSchema);

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const variants = await prisma.productVariant.findMany({
    where: { productId: id },
    orderBy: { sortOrder: "asc" },
    include: { images: { include: { image: true } } },
  });
  return NextResponse.json({ variants });
}

// Create or replace all variants (used when generating combinations)
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parse = BulkVariantsSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues[0].message }, { status: 400 });
  }

  const variants = await prisma.$transaction(async (tx: any) => {
    // Delete existing variants that are no longer in the list
    const existingVariants = await tx.productVariant.findMany({
      where: { productId: id },
      select: { id: true, sku: true },
    });

    const incomingSkus = parse.data.map((v) => v.sku).filter(Boolean);

    // Delete variants not in incoming list (by SKU or all if no SKU)
    for (const existing of existingVariants) {
      if (existing.sku && incomingSkus.includes(existing.sku)) continue;
      if (!existing.sku) continue; // keep un-SKUed variants
      await tx.productVariant.delete({ where: { id: existing.id } });
    }

    // Upsert variants
    const result = [];
    for (let i = 0; i < parse.data.length; i++) {
      const v = parse.data[i];
      const { options, ...rest } = v;

      // Try to find by SKU
      const existing = v.sku
        ? await tx.productVariant.findFirst({ where: { sku: v.sku, productId: id } })
        : null;

      if (existing) {
        const updated = await tx.productVariant.update({
          where: { id: existing.id },
          data: { ...rest, options: JSON.stringify(options), sortOrder: i },
        });
        result.push(updated);
      } else {
        const created = await tx.productVariant.create({
          data: {
            ...rest,
            options: JSON.stringify(options),
            productId: id,
            sortOrder: i,
          },
        });
        result.push(created);
      }
    }

    return result;
  });

  return NextResponse.json({ variants });
}

// Add a single variant
export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parse = VariantSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues[0].message }, { status: 400 });
  }

  const { options, ...rest } = parse.data;

  const variant = await prisma.productVariant.create({
    data: {
      ...rest,
      options: JSON.stringify(options),
      productId: id,
    },
  });

  return NextResponse.json({ variant }, { status: 201 });
}
