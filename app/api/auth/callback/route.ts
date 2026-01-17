import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Clerk handles authentication, so we just verify the user exists in our DB
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.redirect(
        new URL("/error?error=Unauthorized", request.url)
      );
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "No email found in authentication." },
        { status: 400 }
      );
    }

    // Check if user exists in database, if not, it will be created by webhook
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist yet, redirect and let webhook handle it
    // Or you could create it here, but webhook is cleaner
    if (!existingUser) {
      // User will be created by Clerk webhook
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));
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
