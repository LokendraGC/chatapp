import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { currentUser } from "@clerk/nextjs/server";

const FALLBACK_CONTACT = {
  address: "123 Business St, Innovation City",
  location_url: "https://maps.google.com",
  email: "support@example.com",
  phone: "+1 555 000 0000",
  social_media: [
    { platform: "facebook", url: "https://facebook.com" },
    { platform: "instagram", url: "https://instagram.com" },
    { platform: "x", url: "https://x.com" },
  ],
};

export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    let user_email = "";

    if (clerkUser) {
      user_email = clerkUser.emailAddresses[0].emailAddress ?? "";
    } else if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload?.ownerEmail) {
          user_email = payload.ownerEmail as string;
        }
      } catch (e) {
        try {
          const bot = await prisma.chatBotMetadata.findUnique({
            where: { id: token },
            select: { user_email: true },
          });
          if (bot?.user_email) user_email = bot.user_email;
        } catch (dbErr) {
          console.error("Widget ID lookup failed:", dbErr);
        }
      }
    }

    if (!user_email) {
      return NextResponse.json({ contact: FALLBACK_CONTACT }, { status: 200 });
    }

    const contact = await prisma.contact.findFirst({
      where: { user_email },
      orderBy: { created_at: "desc" },
    });

    const normalizedContact = contact
      ? {
          ...contact,
          social_media: Array.isArray(contact.social_media)
            ? contact.social_media
            : [],
        }
      : FALLBACK_CONTACT;

    return NextResponse.json({ contact: normalizedContact }, { status: 200 });

  } catch (error) {
    console.error("Error fetching contact info:", error);
    return NextResponse.json({ contact: FALLBACK_CONTACT }, { status: 200 });
  }
}