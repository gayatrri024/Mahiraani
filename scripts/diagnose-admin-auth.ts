// scripts/diagnose-admin-auth.ts
import { proxy } from "../src/proxy";
import { verifyAdminToken, createAdminSession, COOKIE_NAME, shouldSecureCookie } from "../src/lib/auth";
import { NextRequest } from "next/server";
import { prisma } from "../src/lib/prisma";

async function runDiagnosis() {
  console.log("=================================================");
  console.log(" MAHIRAANI LAN & LOCALHOST AUTHENTICATION AUDIT  ");
  console.log("=================================================\n");

  let assertionsPassed = 0;
  let assertionsFailed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      assertionsPassed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      assertionsFailed++;
    }
  }

  // 1. Verify Admin User in SQLite DB
  const admin = await prisma.adminUser.findUnique({
    where: { email: "admin@mahiraani.com" },
  });
  assert(Boolean(admin), "Admin user exists in SQLite database (admin@mahiraani.com)");

  // 2. Test shouldSecureCookie across environments
  console.log("\n--- Testing shouldSecureCookie Behavior ---");
  const localReq = new NextRequest("http://localhost:3000/api/admin/auth/login", {
    headers: { host: "localhost:3000" },
  });
  const lanReq = new NextRequest("http://192.168.50.100:3000/api/admin/auth/login", {
    headers: { host: "192.168.50.100:3000" },
  });
  const prodHttpsReq = new NextRequest("https://mahiraani.com/api/admin/auth/login", {
    headers: { host: "mahiraani.com", "x-forwarded-proto": "https" },
  });

  assert(shouldSecureCookie(localReq) === false, "Localhost HTTP yields secure: false");
  assert(shouldSecureCookie(lanReq) === false, "LAN IP (192.168.50.100:3000) yields secure: false (prevents mobile Safari dropping session)");

  // Test production HTTPS
  const origEnv = process.env.NODE_ENV;
  (process.env as Record<string, string>).NODE_ENV = "production";
  assert(shouldSecureCookie(prodHttpsReq) === true, "Production HTTPS yields secure: true");
  assert(shouldSecureCookie(lanReq) === false, "LAN IP in production still yields secure: false for plain HTTP testing");
  (process.env as Record<string, string>).NODE_ENV = origEnv || "test";

  // 3. Generate Authentic Admin Session
  console.log("\n--- Testing JWT Generation & Verification ---");
  const token = await createAdminSession({
    id: admin!.id,
    email: admin!.email,
    name: admin!.name,
    role: admin!.role,
  });
  assert(typeof token === "string" && token.length > 50, "Generated signed Admin JWT");

  const verified = await verifyAdminToken(token);
  assert(Boolean(verified && verified.email === admin!.email && verified.role === admin!.role), "verifyAdminToken successfully decodes payload");

  // 4. Test Proxy & Middleware on LAN IP: GET http://192.168.50.100:3000/admin WITH cookie
  console.log("\n--- Testing Proxy / Middleware on LAN IP (http://192.168.50.100:3000) ---");
  const adminReqWithCookie = new NextRequest("http://192.168.50.100:3000/admin", {
    method: "GET",
    headers: {
      host: "192.168.50.100:3000",
      cookie: `${COOKIE_NAME}=${token}`,
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    },
  });

  const proxyResWithCookie = await proxy(adminReqWithCookie);
  assert(proxyResWithCookie.status === 200, "Proxy allows GET /admin with valid LAN cookie (status 200)");
  assert(!proxyResWithCookie.headers.get("location"), "Proxy does NOT redirect authenticated LAN request");

  // 5. Test Proxy on LAN IP WITHOUT cookie (must redirect to /admin/login with no-cache headers)
  console.log("\n--- Testing Proxy on LAN IP WITHOUT cookie ---");
  const adminReqNoCookie = new NextRequest("http://192.168.50.100:3000/admin", {
    method: "GET",
    headers: {
      host: "192.168.50.100:3000",
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      referer: "http://192.168.50.100:3000/admin/login",
    },
  });

  const proxyResNoCookie = await proxy(adminReqNoCookie);
  assert(proxyResNoCookie.status === 307, "Proxy redirects unauthenticated LAN request (status 307)");
  const redirectLoc = proxyResNoCookie.headers.get("location");
  assert(
    redirectLoc === "http://192.168.50.100:3000/admin/login?error=cookie_missing",
    "Redirects to LAN IP login URL with error parameter"
  );
  assert(
    Boolean(proxyResNoCookie.headers.get("cache-control")?.includes("no-store")),
    "CRITICAL: Redirect sets Cache-Control: no-store (prevents iOS Safari aggressive redirect caching)"
  );

  // 6. Test Proxy on /admin/login WITH cookie (must redirect to /admin)
  console.log("\n--- Testing Proxy on /admin/login WITH cookie ---");
  const loginReqWithCookie = new NextRequest("http://192.168.50.100:3000/admin/login", {
    method: "GET",
    headers: {
      host: "192.168.50.100:3000",
      cookie: `${COOKIE_NAME}=${token}`,
    },
  });

  const proxyLoginWithCookie = await proxy(loginReqWithCookie);
  assert(proxyLoginWithCookie.status === 307, "Authenticated user visiting /admin/login redirects (status 307)");
  assert(
    proxyLoginWithCookie.headers.get("location") === "http://192.168.50.100:3000/admin",
    "Redirects to LAN IP dashboard URL (http://192.168.50.100:3000/admin)"
  );
  assert(
    Boolean(proxyLoginWithCookie.headers.get("cache-control")?.includes("no-store")),
    "Sets Cache-Control: no-store on login redirect"
  );

  // 7. Test Proxy on /admin/login WITHOUT cookie (must allow through)
  console.log("\n--- Testing Proxy on /admin/login WITHOUT cookie ---");
  const loginReqNoCookie = new NextRequest("http://192.168.50.100:3000/admin/login", {
    method: "GET",
    headers: { host: "192.168.50.100:3000" },
  });

  const proxyLoginNoCookie = await proxy(loginReqNoCookie);
  assert(proxyLoginNoCookie.status === 200, "Unauthenticated user visiting /admin/login is allowed through (status 200)");
  assert(!proxyLoginNoCookie.headers.get("location"), "Does not redirect");

  // 8. Test Protected API Route on LAN IP (/api/admin/orders)
  console.log("\n--- Testing Protected Admin API on LAN IP ---");
  const apiReqNoCookie = new NextRequest("http://192.168.50.100:3000/api/admin/orders", {
    method: "GET",
    headers: { host: "192.168.50.100:3000" },
  });
  const apiResNoCookie = await proxy(apiReqNoCookie);
  assert(apiResNoCookie.status === 401, "Blocks unauthorized API access without cookie (HTTP 401)");

  const apiReqWithCookie = new NextRequest("http://192.168.50.100:3000/api/admin/orders", {
    method: "GET",
    headers: {
      host: "192.168.50.100:3000",
      cookie: `${COOKIE_NAME}=${token}`,
    },
  });
  const apiResWithCookie = await proxy(apiReqWithCookie);
  assert(apiResWithCookie.status === 200, "Allows authorized API access with valid cookie (HTTP 200)");

  console.log("\n=================================================");
  console.log(` AUDIT SUMMARY: ${assertionsPassed} PASSED, ${assertionsFailed} FAILED`);
  console.log("=================================================");

  if (assertionsFailed > 0) {
    process.exit(1);
  }
}

runDiagnosis().catch((err) => {
  console.error("Diagnosis encountered fatal error:", err);
  process.exit(1);
});
