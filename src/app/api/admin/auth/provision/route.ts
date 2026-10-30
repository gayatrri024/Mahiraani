// src/app/api/admin/auth/provision/route.ts
// One-time owner provisioning. Disabled after first admin user is created.

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ProvisionSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, "Password must be at least 12 characters"),
  name: z.string().min(1),
  provisionKey: z.string(),
});

export async function POST(req: NextRequest) {
  // Refuse if any admin already exists
  const count = await prisma.adminUser.count();
  if (count > 0) {
    return NextResponse.json(
      { error: "Owner account already provisioned. Use the login page." },
      { status: 409 }
    );
  }

  // Require a server-side provision key so this endpoint can't be brute-forced
  const PROVISION_KEY = process.env.ADMIN_PROVISION_KEY;
  if (!PROVISION_KEY) {
    return NextResponse.json(
      { error: "ADMIN_PROVISION_KEY not configured on server" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parse = ProvisionSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues[0].message }, { status: 400 });
  }

  const { email, password, name, provisionKey } = parse.data;

  if (provisionKey !== PROVISION_KEY) {
    return NextResponse.json({ error: "Invalid provision key" }, { status: 403 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.create({
    data: { email, passwordHash, name, role: "owner" },
  });

  return NextResponse.json({ ok: true, message: "Owner account created. You can now log in." });
}
