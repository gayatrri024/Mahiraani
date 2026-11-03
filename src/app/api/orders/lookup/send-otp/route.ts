// src/app/api/orders/lookup/send-otp/route.ts – Send OTP for Order Lookup
import { NextRequest, NextResponse } from "next/server";
import { requestOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: "Mobile number is required." }, { status: 400 });
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const result = await requestOtp(phone, clientIp);
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          providerMissing: result.providerMissing || false,
          cooldownSeconds: result.cooldownSeconds,
        },
        { status: result.providerMissing ? 503 : 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your mobile number.",
      cooldownSeconds: result.cooldownSeconds,
      devOtp: result.devOtp, // Only present in dev mock mode
    });
  } catch (error) {
    console.error("[Send OTP API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error while dispatching verification code." },
      { status: 500 }
    );
  }
}

