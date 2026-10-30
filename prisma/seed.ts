// prisma/seed.ts
// Seeds a clearly labelled sample product with size and colour variants.
// Run: npx ts-node --esm prisma/seed.ts  (or via npm run seed)
// Sample products are marked isSample:true, status:"draft", excluded from live checkout.

import { PrismaClient } from "../src/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱  Seeding Mahiraani development database...");

  // ── Categories ────────────────────────────────────────────────────────────
  const necklaces = await prisma.category.upsert({
    where: { slug: "necklaces" },
    update: {},
    create: { name: "Necklaces", slug: "necklaces", sortOrder: 1 },
  });

  await prisma.category.upsert({
    where: { slug: "earrings" },
    update: {},
    create: { name: "Earrings", slug: "earrings", sortOrder: 2 },
  });

  await prisma.category.upsert({
    where: { slug: "bangles" },
    update: {},
    create: { name: "Bangles & Bracelets", slug: "bangles", sortOrder: 3 },
  });

  await prisma.category.upsert({
    where: { slug: "sets" },
    update: {},
    create: { name: "Jewellery Sets", slug: "sets", sortOrder: 4 },
  });

  // ── Collections ───────────────────────────────────────────────────────────
  const festive = await prisma.collection.upsert({
    where: { slug: "festive-edit" },
    update: {},
    create: {
      name: "Festive Edit",
      slug: "festive-edit",
      description: "Curated pieces for celebrations and festivities.",
      sortOrder: 1,
    },
  });

  await prisma.collection.upsert({
    where: { slug: "everyday-wear" },
    update: {},
    create: {
      name: "Everyday Wear",
      slug: "everyday-wear",
      description: "Refined pieces to wear every day.",
      sortOrder: 2,
    },
  });

  // ── Sample Product ─────────────────────────────────────────────────────────
  // Check if sample already exists
  const existingSample = await prisma.product.findUnique({
    where: { slug: "sample-kundan-polki-necklace" },
  });

  if (!existingSample) {
    const sampleProduct = await prisma.product.create({
      data: {
        name: "[SAMPLE] Kundan Polki Necklace",
        slug: "sample-kundan-polki-necklace",
        description: `This is a sample product to demonstrate the Mahiraani admin workflow. It is not a real product.

Replace this description with your actual product details before publishing. Include only verified information about materials, dimensions, and care.`,
        shortDescription: "Sample product – for admin demonstration only.",
        status: "draft",
        isSample: true,
        hasVariants: true,
        sizeOptions: "Choker (40cm), Princess (45cm), Matinee (55cm)",
        colourOptions: "Antique Gold, Polished Silver",
        material: "[SAMPLE] Enter verified material here",
        careInstructions: "Store in the provided box. Avoid contact with water and perfume.",
        categoryId: necklaces.id,
        collections: {
          create: [{ collectionId: festive.id }],
        },
      },
    });

    console.log("✓  Created sample product:", sampleProduct.id);

    // Generate variants
    const sizes = ["Choker (40cm)", "Princess (45cm)", "Matinee (55cm)"];
    const colours = ["Antique Gold", "Polished Silver"];
    let sortOrder = 0;

    for (const size of sizes) {
      for (const colour of colours) {
        await prisma.productVariant.create({
          data: {
            productId: sampleProduct.id,
            name: `${size} / ${colour}`,
            options: JSON.stringify({ size, colour }),
            price: colour === "Antique Gold" ? 350000 : 280000, // ₹3500 / ₹2800 in paise
            sku: `SAMPLE-${size.split(" ")[0].toUpperCase()}-${colour.split(" ")[0].toUpperCase()}`,
            stock: 5,
            isActive: true,
            sortOrder: sortOrder++,
          },
        });
      }
    }

    console.log("✓  Created", sizes.length * colours.length, "sample variants");
  } else {
    console.log("ℹ️   Sample product already exists, skipping.");
  }

  // ── Store Config defaults ─────────────────────────────────────────────────
  const configs = [
    { key: "store.name", value: "Mahiraani" },
    { key: "store.tagline", value: "Elegant Indian Jewellery" },
    { key: "announcement.text", value: "" },
    { key: "announcement.active", value: "false" },
    { key: "social.instagram", value: "" },
    { key: "social.whatsapp", value: "" },
  ];

  for (const c of configs) {
    await prisma.storeConfig.upsert({
      where: { key: c.key },
      update: {},
      create: c,
    });
  }

  console.log("✓  Store config defaults set");
  console.log("\n✅  Seed complete.");
  console.log("\n📋  Next step: create your admin account by calling:");
  console.log("   POST /api/admin/auth/provision");
  console.log("   with { email, password, name, provisionKey: <ADMIN_PROVISION_KEY from .env.local> }");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
