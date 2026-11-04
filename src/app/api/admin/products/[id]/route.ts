// src/app/api/admin/products/[id]/route.ts
// GET, PATCH, DELETE a single product. Admin-only.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { writeAuditLog } from "@/lib/audit";

const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  basePrice: z.number().int().nonnegative().optional().nullable(),
  comparePrice: z.number().int().nonnegative().optional().nullable(),
  sku: z.string().optional().nullable(),
  stock: z.number().int().nonnegative().optional().nullable(),
  lowStockThreshold: z.number().int().nonnegative().optional().nullable(),
  material: z.string().optional().nullable(),
  finish: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  closureType: z.string().optional().nullable(),
  careInstructions: z.string().optional().nullable(),
  originDetails: z.string().optional().nullable(),
  packageContents: z.string().optional().nullable(),
  hasVariants: z.boolean().optional(),
  sizeOptions: z.string().optional().nullable(),
  colourOptions: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  collectionIds: z.array(z.string()).optional(),
});

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        orderBy: { sortOrder: "asc" },
        include: { images: { include: { image: true } } },
      },
      category: true,
      collections: { include: { collection: true } },
    },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parse = UpdateProductSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues[0].message }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { collectionIds, slug: rawSlug, ...rest } = parse.data;

  let slug: string | undefined;
  if (rawSlug !== undefined) {
    slug = slugify(rawSlug);
    const conflict = await prisma.product.findFirst({
      where: { slug, NOT: { id } },
    });
    if (conflict) slug = `${slug}-${Date.now()}`;
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (collectionIds !== undefined) {
      await tx.productCollection.deleteMany({ where: { productId: id } });
      if (collectionIds.length > 0) {
        await tx.productCollection.createMany({
          data: collectionIds.map((cid) => ({ productId: id, collectionId: cid })),
        });
      }
    }

    return tx.product.update({
      where: { id },
      data: { ...rest, ...(slug ? { slug } : {}) },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
        category: true,
        collections: { include: { collection: true } },
      },
    });
  });

  await writeAuditLog({
    adminUserId: session.id,
    action: "product.update",
    entityType: "Product",
    entityId: id,
    payload: { changes: Object.keys(parse.data) },
  });

  return NextResponse.json({ product: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const searchParams = req.nextUrl.searchParams;
  const forceArchive = searchParams.get("archive") === "true";

  // If the product is linked to past orders or archive was explicitly requested, archive it
  if (forceArchive || product._count.orderItems > 0) {
    await prisma.product.update({
      where: { id },
      data: { status: "archived" },
    });

    await writeAuditLog({
      adminUserId: session.id,
      action: "product.archive",
      entityType: "Product",
      entityId: id,
      payload: { reason: product._count.orderItems > 0 ? "orders_exist" : "admin_requested" },
    });

    return NextResponse.json({
      ok: true,
      archived: true,
      message:
        product._count.orderItems > 0
          ? "This product has past order records and has been safely archived instead of permanently deleted."
          : "Product archived successfully.",
    });
  }

  // Safe to permanently delete (no orders exist)
  await prisma.$transaction(async (tx) => {
    // Delete cart items referencing this product or its variants
    await tx.cartItem.deleteMany({ where: { productId: id } });
    // Delete product (cascades images, variants, collections, reviews, wishlist)
    await tx.product.delete({ where: { id } });
  });

  await writeAuditLog({
    adminUserId: session.id,
    action: "product.delete",
    entityType: "Product",
    entityId: id,
  });

  return NextResponse.json({
    ok: true,
    deleted: true,
    message: "Product permanently deleted.",
  });
}
