import { db } from "@/db/client";
import scalekit from "@/lib/scalekit";
import { NextRequest, NextResponse } from "next/server";
import { user as User } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  console.log("Authentication callback received:", { code, state, error, errorDescription });

  if (error) {
    console.error("Authentication error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/error?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    console.error("No code provided");
    return NextResponse.redirect(
      new URL(
        `/error?error=${encodeURIComponent("No authorization code received.")}`,
        request.url
      )
    );
  }

  try {
    const redirectUri = process.env.SCALEKIT_REDIRECT_URI!;
    const authResponse = await scalekit.authenticateWithCode(code, redirectUri);

    const { user, idToken } = authResponse;

    const claims = await scalekit.validateToken(idToken);

    const organizationId =
      (claims as any).organization_id ||
      (claims as any).org_id ||
      (claims as any).oid ||
      null;

    if (!organizationId) {
      return NextResponse.json(
        {
          error: "No organization ID found in authentication.",
        },
        { status: 400 }
      );
    }

    const existingUsers = await db
      .select()
      .from(User)
      .where(eq(User.email, user.email));

    if (existingUsers.length === 0) {
      await db.insert(User).values({
        organization_id: organizationId,
        email: user?.email,
        name: user?.name || "Anonymous User",
      });
    }

    const response = NextResponse.redirect(new URL("/", request.url));
    const userSession = JSON.stringify({
      email: user.email,
      organization_id: organizationId,
    });

    response.cookies.set("user_session", JSON.stringify(userSession), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      {
        error: "Authentication failed.",
      },
      { status: 500 }
    );
  }
}
