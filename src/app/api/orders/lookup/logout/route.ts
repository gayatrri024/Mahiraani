// src/app/api/orders/lookup/logout/route.ts – Logout customer session
import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE_NAME } from "@/lib/customer";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(CUSTOMER_COOKIE_NAME);
  return response;
}

