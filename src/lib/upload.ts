// src/lib/upload.ts
// Local file upload adapter using the filesystem.
// Swap this adapter for S3/Cloudflare R2 in production by implementing the same interface.

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export interface UploadResult {
  url: string;
  filename: string;
}

export async function saveUploadedFile(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Use JPEG, PNG, or WebP.`);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`File exceeds maximum size of ${MAX_FILE_BYTES / 1024 / 1024} MB.`);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const safeFilename = `${randomUUID()}.${ext}`;
  const fullPath = path.join(UPLOAD_DIR, safeFilename);

  const bytes = await file.arrayBuffer();
  await writeFile(fullPath, Buffer.from(bytes));

  return {
    url: `/uploads/${safeFilename}`,
    filename: safeFilename,
  };
}

export async function deleteUploadedFile(url: string): Promise<void> {
  try {
    const { unlink } = await import("fs/promises");
    const filename = path.basename(url);
    // Prevent path traversal
    const safePath = path.join(UPLOAD_DIR, filename);
    if (!safePath.startsWith(UPLOAD_DIR)) {
      throw new Error("Invalid file path");
    }
    await unlink(safePath);
  } catch {
    // File may already be gone; log but don't throw
    console.warn("Could not delete upload:", url);
  }
}
