// src/lib/audit.ts – write audit log entries for admin actions

import { prisma } from "@/lib/prisma";

export async function writeAuditLog({
  adminUserId,
  action,
  entityType,
  entityId,
  payload,
}: {
  adminUserId: string;
  action: string;
  entityType: string;
  entityId?: string;
  payload?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        adminUserId,
        action,
        entityType,
        entityId,
        payload: payload ? JSON.stringify(payload) : undefined,
      },
    });
  } catch (err) {
    // Audit failures must not crash the primary operation
    console.error("Audit log write failed:", err);
  }
}
