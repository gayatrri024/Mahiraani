// src/app/api/admin/products/[id]/images/route.ts
// Upload and list product images

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";

type Params = Promise<{ id: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const files = formData.getAll("images") as File[];
  if (!files.length) return NextResponse.json({ error: "No files uploaded" }, { status: 400 });

  const existing = await prisma.productImage.count({ where: { productId: id } });

  const created = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const { url } = await saveUploadedFile(file);
      const img = await prisma.productImage.create({
        data: {
          productId: id,
          url,
          altText: (formData.get(`altText_${i}`) as string) ?? "",
          sortOrder: existing + i,
          isCover: existing === 0 && i === 0,
        },
      });
      created.push(img);
    } catch (err) {
      return NextResponse.json(
        { error: `Failed to upload file ${i + 1}: ${(err as Error).message}` },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ images: created }, { status: 201 });
}

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const images = await prisma.productImage.findMany({
    where: { productId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ images });
}
