import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user from Prisma database
    const user = await prisma.user.findUnique({
      where: {
        email: clerkUser.emailAddresses[0]?.emailAddress,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { business_name, website_url, external_links } = await req.json();

    if (!business_name || !website_url) {
      return NextResponse.json(
        { error: "Business name and website URL are required" },
        { status: 400 }
      );
    }

    const metadata = await prisma.metaData.create({
      data: {
        user_email: clerkUser.emailAddresses[0]?.emailAddress,
        business_name,
        website_url,
        external_links: external_links ?? null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("metadata", JSON.stringify({ business_name }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json(
      { message: "Metadata stored successfully" + metadata },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in metadata store:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
