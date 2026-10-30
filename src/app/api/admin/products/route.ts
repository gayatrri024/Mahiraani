// src/app/api/admin/products/route.ts
// List and create products. All operations require admin session.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { writeAuditLog } from "@/lib/audit";

const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
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
  hasVariants: z.boolean().default(false),
  sizeOptions: z.string().optional().nullable(),
  colourOptions: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  collectionIds: z.array(z.string()).optional(),
  isSample: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const status = searchParams.get("status");
  const search = searchParams.get("q");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
    ];
  }

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        images: { where: { isCover: true }, take: 1 },
        category: { select: { name: true } },
        variants: { select: { id: true, stock: true, isActive: true } },
        _count: { select: { variants: true, images: true } },
      },
    }),
  ]);

  return NextResponse.json({ products, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parse = CreateProductSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues[0].message }, { status: 400 });
  }

  const data = parse.data;

  // Auto-generate slug if not provided, ensure uniqueness
  let slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const { collectionIds, ...productData } = data;

  const product = await prisma.product.create({
    data: {
      ...productData,
      slug,
      collections: collectionIds?.length
        ? {
            create: collectionIds.map((id) => ({ collectionId: id })),
          }
        : undefined,
    },
    include: { images: true, variants: true, category: true, collections: { include: { collection: true } } },
  });

  await writeAuditLog({
    adminUserId: session.id,
    action: "product.create",
    entityType: "Product",
    entityId: product.id,
    payload: { name: product.name, status: product.status },
  });

  return NextResponse.json({ product }, { status: 201 });
}
