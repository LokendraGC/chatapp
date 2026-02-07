import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      address,
      location_url,
      logo,
      email,
      phone,
      social_media,
    } = body ?? {};

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const existing = await prisma.contact.findFirst({
      where: {
        user_email: userEmail,
      },
    });

    const payload = {
      address: typeof address === "string" ? address.trim() : "",
      location_url: typeof location_url === "string" ? location_url.trim() : "",
      logo: typeof logo === "string" ? logo : "",
      email: typeof email === "string" ? email.trim() : "",
      phone: typeof phone === "string" ? phone.trim() : "",
      social_media: Array.isArray(social_media)
        ? social_media.map((item) => ({
            platform: typeof item?.platform === "string" ? item.platform : "",
            url: typeof item?.url === "string" ? item.url : "",
          }))
        : [],
    };

    const contact = existing
      ? await prisma.contact.update({
          where: { id: existing.id },
          data: payload,
        })
      : await prisma.contact.create({
          data: {
            user_email: userEmail,
            ...payload,
          },
        });

    return NextResponse.json({ contact }, { status: 200 });
  } catch (error) {
    console.error("Error saving contact info:", error);
    return NextResponse.json(
      { error: "Failed to save contact info" },
      { status: 500 }
    );
  }
}
