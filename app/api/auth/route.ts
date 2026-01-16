// app/api/auth/route.ts
import { NextResponse } from "next/server";
import Crypto from "crypto";
import { cookies } from "next/headers";
import scalekit from "@/lib/scalekit";

export async function GET() {
  try {
    const state = Crypto.randomBytes(32).toString("hex");

    // Store state in a cookie
    (await cookies()).set("sk_state", state, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    const redirectUri = process.env.SCALEKIT_REDIRECT_URI!;
    const options = {
      scopes: ["openid", "profile", "email", "offline_access"],
      state: state,
    };

    const authUrl = scalekit.getAuthorizationUrl(redirectUri, options);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
