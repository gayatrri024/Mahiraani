// scripts/manage-admin.ts – Secure Admin User & Password Management CLI
// Usage:
//   npx tsx scripts/manage-admin.ts list
//   npx tsx scripts/manage-admin.ts reset <email> <newPassword>
//   npx tsx scripts/manage-admin.ts create <email> <name> <password>

import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const [action, ...args] = process.argv.slice(2);

  if (!action || action === "help") {
    console.log(`
MAHIRAANI Secure Admin User CLI
================================
Commands:
  npx tsx scripts/manage-admin.ts list
      List all existing administrator accounts.

  npx tsx scripts/manage-admin.ts reset <email> <newPassword>
      Reset password for an existing admin account (minimum 8 characters).

  npx tsx scripts/manage-admin.ts create <email> <name> <password>
      Create a new administrator account.
`);
    process.exit(0);
  }

  if (action === "list") {
    const users = await prisma.adminUser.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "asc" },
    });
    console.log("\nRegistered Administrator Accounts:");
    console.table(users);
    process.exit(0);
  }

  if (action === "reset") {
    const [email, newPassword] = args;
    if (!email || !newPassword) {
      console.error("Error: Missing email or new password.");
      console.log("Usage: npx tsx scripts/manage-admin.ts reset <email> <newPassword>");
      process.exit(1);
    }
    if (newPassword.length < 8) {
      console.error("Error: Password must be at least 8 characters long.");
      process.exit(1);
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      console.error(`Error: No administrator found with email: ${email}`);
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.adminUser.update({
      where: { email },
      data: { passwordHash },
    });

    console.log(`\n[SUCCESS] Password for ${email} (${user.name}) has been securely updated.`);
    console.log("You can now log in at /admin/login with your updated credentials.\n");
    process.exit(0);
  }

  if (action === "create") {
    const [email, name, password] = args;
    if (!email || !name || !password) {
      console.error("Error: Missing email, name, or password.");
      console.log("Usage: npx tsx scripts/manage-admin.ts create <email> <name> <password>");
      process.exit(1);
    }
    if (password.length < 8) {
      console.error("Error: Password must be at least 8 characters long.");
      process.exit(1);
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      console.error(`Error: An admin user with email ${email} already exists.`);
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const created = await prisma.adminUser.create({
      data: {
        email,
        name,
        passwordHash,
        role: "admin",
      },
      select: { id: true, email: true, name: true, role: true },
    });

    console.log(`\n[SUCCESS] Administrator created successfully:`, created);
    process.exit(0);
  }

  console.error(`Unknown action: "${action}". Run with "help" for options.`);
  process.exit(1);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

