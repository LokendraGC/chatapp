import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { business_name, website_url } = body ?? {};

    if (!business_name || !website_url) {
      return NextResponse.json(
        { error: "Workspace Name and Primary Website are required." },
        { status: 400 }
      );
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress ?? "";

    const existing = await prisma.metaData.findFirst({
      where: {
        user_email: userEmail,
      },
    });

    const payload = {
      business_name: typeof business_name === "string" ? business_name.trim() : "",
      website_url: typeof website_url === "string" ? website_url.trim() : "",
    };

    const organization = existing
      ? await prisma.metaData.update({
          where: { id: existing.id },
          data: payload,
        })
      : await prisma.metaData.create({
          data: {
            user_email: userEmail,
            ...payload,
          },
        });

    return NextResponse.json({ organization }, { status: 200 });
  } catch (error) {
    console.error("Error saving organization info:", error);
    return NextResponse.json(
      { error: "Failed to save organization info" },
      { status: 500 }
    );
  }
}
