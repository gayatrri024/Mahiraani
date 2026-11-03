// src/app/api/orders/lookup/verify-otp/route.ts – Verify OTP and Establish Customer Session
import { NextRequest, NextResponse } from "next/server";
import { verifyOtpCode } from "@/lib/otp";
import { createCustomerSession, CUSTOMER_COOKIE_NAME } from "@/lib/customer";
import { shouldSecureCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Both mobile number and verification code are required." },
        { status: 400 }
      );
    }

    const result = await verifyOtpCode(phone, code);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const token = await createCustomerSession({
      id: result.customer.id,
      phone: result.customer.phone,
      name: result.customer.name,
    });

    const response = NextResponse.json({
      success: true,
      customer: result.customer,
    });

    response.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: shouldSecureCookie(req),
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("[Verify OTP API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error while verifying code." },
      { status: 500 }
    );
  }
}

