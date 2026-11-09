// src/lib/prisma.ts – singleton Prisma client for Next.js dev/prod

import path from "path";
import fs from "fs";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

export type { Prisma } from "@/generated/prisma/client";
export { PrismaClient } from "@/generated/prisma/client";

/**
 * Resolves SQLite database URL to an absolute filesystem path.
 * This prevents better-sqlite3 from failing with "Cannot open database because
 * the directory does not exist" when Next.js worker threads execute from subdirectories (e.g. .next).
 */
function resolveSqliteUrl(rawUrl?: string): string {
  if (rawUrl && !rawUrl.startsWith("file:")) {
    return rawUrl;
  }

  const rawPath = rawUrl ? rawUrl.replace(/^file:/, "") : "";

  // If already an absolute path and exists, use it directly
  if (rawPath && path.isAbsolute(rawPath) && fs.existsSync(rawPath)) {
    return `file:${rawPath}`;
  }

  const candidates: string[] = [];

  if (rawPath) {
    candidates.push(path.resolve(process.cwd(), rawPath.replace(/^\.\//, "")));
  }

  candidates.push(
    path.resolve(process.cwd(), "prisma", "dev.db"),
    path.join(process.cwd(), "prisma", "dev.db"),
    path.resolve(__dirname, "..", "..", "prisma", "dev.db"),
    path.resolve(__dirname, "..", "..", "..", "prisma", "dev.db")
  );

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return `file:${candidate}`;
    }
  }

  const fallback = path.resolve(process.cwd(), "prisma", "dev.db");
  const fallbackDir = path.dirname(fallback);
  try {
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
  } catch {
    // Ignore in read-only serverless environments
  }

  return `file:${fallback}`;
}

function createPrismaClient() {
  const isVercel = process.env.VERCEL === "1";
  const isProduction = process.env.NODE_ENV === "production";
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  const dbUrl = process.env.DATABASE_URL;

  // In production or on Vercel at runtime, forbid silent fallback to a local SQLite database.
  // During the static build phase (NEXT_PHASE === "phase-production-build"), allow reading
  // the bundled catalogue database so that Next.js static page generation succeeds.
  if ((isProduction || isVercel) && !dbUrl && !isBuildPhase) {
    throw new Error(
      "[FATAL DATABASE GATE] DATABASE_URL environment variable is missing in production. Silent fallback to a local SQLite database is disabled to prevent data loss and runtime failures on serverless platforms. Please configure DATABASE_URL in your deployment environment."
    );
  }

  const effectiveUrl = resolveSqliteUrl(dbUrl);
  const adapter = new PrismaBetterSqlite3({ url: effectiveUrl });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
