// scripts/verify-all.mjs – Comprehensive Verification Script
import http from "node:http";
import { spawn } from "node:child_process";

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  console.log("🚀 Starting Next.js production server for verification...");
  const server = spawn("npx", ["next", "start", "-p", "3000"], {
    stdio: "pipe",
    shell: true,
  });

  server.stdout.on("data", (d) => process.stdout.write(`[server] ${d}`));
  server.stderr.on("data", (d) => process.stderr.write(`[server err] ${d}`));

  let ready = false;
  for (let i = 0; i < 30; i++) {
    await wait(1000);
    try {
      const res = await fetchUrl("http://127.0.0.1:3000/robots.txt");
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch {
      // wait more
    }
  }

  if (!ready) {
    console.error("❌ Server failed to start in time");
    server.kill();
    process.exit(1);
  }

  console.log("✓ Server ready on http://127.0.0.1:3000. Running tests...\n");

  const tests = [
    { name: "Homepage (/) 200", url: "http://127.0.0.1:3000/", expectedStatus: [200] },
    { name: "About Page (/about) 200", url: "http://127.0.0.1:3000/about", expectedStatus: [200] },
    { name: "Contact Page (/contact) 200", url: "http://127.0.0.1:3000/contact", expectedStatus: [200] },
    { name: "Privacy Policy (/policies/privacy) 200", url: "http://127.0.0.1:3000/policies/privacy", expectedStatus: [200] },
    { name: "Terms of Service (/policies/terms) 200", url: "http://127.0.0.1:3000/policies/terms", expectedStatus: [200] },
    { name: "Returns Policy (/policies/returns) 200", url: "http://127.0.0.1:3000/policies/returns", expectedStatus: [200] },
    { name: "Shipping Policy (/policies/shipping) 200", url: "http://127.0.0.1:3000/policies/shipping", expectedStatus: [200] },
    { name: "Care Policy (/policies/care) 200", url: "http://127.0.0.1:3000/policies/care", expectedStatus: [200] },
    { name: "Robots.txt (/robots.txt) 200", url: "http://127.0.0.1:3000/robots.txt", expectedStatus: [200] },
    { name: "Sitemap.xml (/sitemap.xml) 200", url: "http://127.0.0.1:3000/sitemap.xml", expectedStatus: [200] },
    { name: "Collections All (/collections/all) 200", url: "http://127.0.0.1:3000/collections/all", expectedStatus: [200] },
    { name: "Under ₹999 (/collections/under-999) 200", url: "http://127.0.0.1:3000/collections/under-999", expectedStatus: [200] },
    { name: "Invalid Collection (/collections/fake-slug) 404", url: "http://127.0.0.1:3000/collections/fake-slug", expectedStatus: [404] },
    { name: "Admin Orders (/admin/orders) Redirects 307/302", url: "http://127.0.0.1:3000/admin/orders", expectedStatus: [307, 302] },
    { name: "Admin Categories (/admin/categories) Redirects 307/302", url: "http://127.0.0.1:3000/admin/categories", expectedStatus: [307, 302] },
    { name: "Admin Collections (/admin/collections) Redirects 307/302", url: "http://127.0.0.1:3000/admin/collections", expectedStatus: [307, 302] },
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const res = await fetchUrl(t.url);
      if (t.expectedStatus.includes(res.status)) {
        console.log(`✅ ${t.name} -> HTTP ${res.status}`);
        passed++;
      } else {
        console.error(`❌ ${t.name} -> FAILED (Got ${res.status}, expected ${t.expectedStatus.join("/")})`);
      }
    } catch (err) {
      console.error(`❌ ${t.name} -> ERROR: ${err.message}`);
    }
  }

  // Test Order Creation via POST /api/orders
  console.log("\n🧪 Testing Storefront Order Creation (POST /api/orders)...");
  try {
    const orderPayload = JSON.stringify({
      customerName: "Radhika Sharma",
      customerEmail: "radhika.sharma@example.com",
      customerPhone: "9876543210",
      addressLine1: "Flat 402, Royal Residency",
      addressLine2: "Senapati Bapat Road",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411016",
      isGiftWrap: true,
      notes: "Please pack with extra care.",
      paymentMethod: "manual_upi",
      items: [
        {
          productId: "cmvuninmc0000z4uizf7ruifh", // modern art earrings
          quantity: 1,
        },
      ],
    });

    const orderRes = await fetchUrl("http://127.0.0.1:3000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(orderPayload),
      },
      body: orderPayload,
    });

    if (orderRes.status === 200) {
      const orderData = JSON.parse(orderRes.body);
      console.log(`✅ Order Creation Successful! Ref: ${orderData.order.reference}, Total: ₹${orderData.order.totalPaise / 100}`);
      passed++;
    } else {
      console.error(`❌ Order Creation Failed: HTTP ${orderRes.status} -> ${orderRes.body}`);
    }
  } catch (err) {
    console.error(`❌ Order Creation Error: ${err.message}`);
  }

  console.log(`\n🎉 Verification Complete: ${passed}/${tests.length + 1} passed.`);
  server.kill();
  process.exit(passed === tests.length + 1 ? 0 : 1);
}

run();
