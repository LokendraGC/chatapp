import { getWorkspaceEmail } from "@/lib/workspace";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userEmail = await getWorkspaceEmail(clerkUser) || "";
    
    let user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    if (!user) {
      // Create user if not found (fallback if webhook hasn't run)
      user = await prisma.user.create({
        data: {
          id: clerkUser.id,
          organization_id: randomUUID(),
          email: clerkUser.emailAddresses[0]?.emailAddress || userEmail,
          name: clerkUser.firstName,
          image: clerkUser.imageUrl,
        },
      });
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
        user_email: userEmail,
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
      { message: "Metadata stored successfully" },
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
