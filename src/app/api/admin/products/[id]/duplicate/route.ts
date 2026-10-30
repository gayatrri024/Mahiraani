// src/app/api/admin/products/[id]/duplicate/route.ts
// Duplicate a product as draft

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

type Params = Promise<{ id: string }>;

export async function POST(_req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const original = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        include: { images: { include: { image: true } } },
      },
      collections: true,
    },
  });

  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const baseSlug = `${original.slug}-copy`;
  const existing = await prisma.product.findFirst({ where: { slug: { startsWith: baseSlug } } });
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  const {
    id: _id,
    createdAt: _c,
    updatedAt: _u,
    images,
    variants,
    collections,
    sku,
    ...rest
  } = original;

  const duplicate = await prisma.$transaction(async (tx: any) => {
    const newProduct = await tx.product.create({
      data: {
        ...rest,
        slug,
        name: `${original.name} (Copy)`,
        status: "draft",
        sku: sku ? `${sku}-COPY` : undefined,
      },
    });

    // Duplicate images
    const imageMap = new Map<string, string>();
    for (const img of images) {
      const { id: _iid, productId: _pid, ...imgRest } = img;
      const newImg = await tx.productImage.create({
        data: { ...imgRest, productId: newProduct.id },
      });
      imageMap.set(img.id, newImg.id);
    }

    // Duplicate variants
    for (const v of variants) {
      const { id: _vid, productId: _vpid, images: vImages, ...vRest } = v;
      const newVariant = await tx.productVariant.create({
        data: { ...vRest, productId: newProduct.id },
      });
      for (const vi of vImages) {
        const newImageId = imageMap.get(vi.imageId);
        if (newImageId) {
          await tx.variantImage.create({
            data: { variantId: newVariant.id, imageId: newImageId },
          });
        }
      }
    }

    // Duplicate collection assignments
    for (const col of collections) {
      await tx.productCollection.create({
        data: { productId: newProduct.id, collectionId: col.collectionId },
      });
    }

    return newProduct;
  });

  await writeAuditLog({
    adminUserId: session.id,
    action: "product.duplicate",
    entityType: "Product",
    entityId: duplicate.id,
    payload: { sourceId: id },
  });

  return NextResponse.json({ product: duplicate }, { status: 201 });
}
