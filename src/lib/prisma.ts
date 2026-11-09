// src/lib/prisma.ts – singleton Prisma client for Next.js dev/prod

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

export type { Prisma } from "@/generated/prisma/client";
export { PrismaClient } from "@/generated/prisma/client";

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

  const effectiveUrl = dbUrl || "file:./prisma/dev.db";
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
