import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from Prisma database
    const user = await prisma.user.findUnique({
      where: {
        email: clerkUser.emailAddresses[0]?.emailAddress,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    const metaDataCookie = cookieStore.get("metadata");

    if (metaDataCookie?.value) {
      return NextResponse.json(
        {
          exists: true,
          source: "cookie",
          data: JSON.parse(metaDataCookie.value),
        },
        { status: 200 }
      );
    }

    const metadata = await prisma.metaData.findUnique({
      where: {
        user_email: user.email,
      },
    });

    if (metadata) {
      cookieStore.set(
        "metadata",
        JSON.stringify({ business_name: metadata.business_name }),
        {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        }
      );
      return NextResponse.json(
        {
          exists: true,
          source: "database",
          data: metadata,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        exists: false,
        source: "none",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
