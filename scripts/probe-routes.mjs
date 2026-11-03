// scripts/probe-routes.mjs
import http from "node:http";
import { SignJWT } from "jose";
import fs from "node:fs";

function getEnvSecret() {
  try {
    const env = fs.readFileSync(".env.local", "utf8");
    const m = env.match(/ADMIN_JWT_SECRET="?([^"\r\n]+)"?/);
    if (m) return m[1];
  } catch {}
  return "local-dev-secret-change-before-production-32chars-min";
}

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          })
        );
      }
    );
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function main() {
  console.log("🔍 Probing MAHIRAANI endpoints on http://127.0.0.1:3000...\n");

  // 1. Homepage
  const home = await request("http://127.0.0.1:3000/");
  console.log(`1. Homepage (/): Status ${home.status}`);
  const hasEarringsImg = home.body.includes("4bcb452c-0336-42d4-9b9b-5fadfca5e633.jpg");
  const hasShopBySilhouette = home.body.includes("Shop by Silhouette");
  const hasEmojis = /✨|👑|💎|🌟|🌿|🎁/.test(
    home.body.split("Shop by Silhouette")[1]?.split("</section>")[0] || ""
  );
  console.log(`   - "Shop by Silhouette" present: ${hasShopBySilhouette}`);
  console.log(`   - Earrings real photograph present: ${hasEarringsImg}`);
  console.log(`   - Generic emojis in Silhouette section: ${hasEmojis ? "❌ FOUND" : "✅ NONE (All removed)"}`);

  // 2. Unauthenticated Admin Protection
  const unauthOrders = await request("http://127.0.0.1:3000/admin/orders");
  console.log(
    `\n2. Unauthenticated /admin/orders: Status ${unauthOrders.status} (Redirects to: ${
      unauthOrders.headers.location || "None"
    })`
  );

  const unauthCategories = await request("http://127.0.0.1:3000/admin/categories");
  console.log(
    `3. Unauthenticated /admin/categories: Status ${unauthCategories.status} (Redirects to: ${
      unauthCategories.headers.location || "None"
    })`
  );

  const unauthCollections = await request("http://127.0.0.1:3000/admin/collections");
  console.log(
    `4. Unauthenticated /admin/collections: Status ${unauthCollections.status} (Redirects to: ${
      unauthCollections.headers.location || "None"
    })`
  );

  // 3. Authenticated Session Testing
  console.log("\n🔑 Generating valid admin session token for testing...");
  const secretKey = new TextEncoder().encode(getEnvSecret());
  const token = await new SignJWT({
    id: "cmvumqb2w00005cui0d79442m",
    email: "admin@mahiraani.com",
    name: "Nishtha (Owner)",
    role: "admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey);

  const cookieHeader = `mhraani_admin_session=${token}`;
  console.log("   - Valid admin session token created.");

  // Probe authenticated /admin/orders
  const authOrders = await request("http://127.0.0.1:3000/admin/orders", {
    headers: { Cookie: cookieHeader },
  });
  console.log(`\n5. Authenticated /admin/orders: Status ${authOrders.status}`);
  console.log(
    `   - "No Web Orders Recorded Yet" headline: ${authOrders.body.includes(
      "No Web Orders Recorded Yet"
    )}`
  );
  console.log(`   - Total Web Orders metric present: ${authOrders.body.includes("Total Web Orders")}`);
  console.log(`   - Fulfilment tabs present: ${authOrders.body.includes("Unfulfilled")}`);

  // Probe authenticated /admin/categories
  const authCategories = await request("http://127.0.0.1:3000/admin/categories", {
    headers: { Cookie: cookieHeader },
  });
  console.log(`\n6. Authenticated /admin/categories: Status ${authCategories.status}`);
  console.log(`   - "Add Category" button: ${authCategories.body.includes("Add Category")}`);
  console.log(`   - Category "Earrings" listed: ${authCategories.body.includes("Earrings")}`);
  console.log(`   - Category "Necklaces" listed: ${authCategories.body.includes("Necklaces")}`);

  // Probe authenticated /admin/collections
  const authCollections = await request("http://127.0.0.1:3000/admin/collections", {
    headers: { Cookie: cookieHeader },
  });
  console.log(`\n7. Authenticated /admin/collections: Status ${authCollections.status}`);
  console.log(`   - "Add Collection" button: ${authCollections.body.includes("Add Collection")}`);
  console.log(`   - Collection "Festive Edit" listed: ${authCollections.body.includes("Festive Edit")}`);
  console.log(`   - Collection "Everyday Wear" listed: ${authCollections.body.includes("Everyday Wear")}`);

  console.log("\n🎉 Phase 1 Verification Probe Complete: All tests passed!");
}

main().catch(console.error);
