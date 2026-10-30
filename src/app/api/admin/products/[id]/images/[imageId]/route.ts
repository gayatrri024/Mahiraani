// src/app/api/admin/products/[id]/images/[imageId]/route.ts
// Update image metadata (alt, sort, cover) or delete an image

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { deleteUploadedFile } from "@/lib/upload";

const UpdateImageSchema = z.object({
  altText: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isCover: z.boolean().optional(),
});

type Params = Promise<{ id: string; imageId: string }>;

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, imageId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parse = UpdateImageSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  // If setting as cover, unset all others first
  if (parse.data.isCover) {
    await prisma.productImage.updateMany({
      where: { productId: id },
      data: { isCover: false },
    });
  }

  const updated = await prisma.productImage.update({
    where: { id: imageId },
    data: parse.data,
  });

  return NextResponse.json({ image: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageId } = await params;

  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.productImage.delete({ where: { id: imageId } });
  await deleteUploadedFile(image.url);

  return NextResponse.json({ ok: true });
}
