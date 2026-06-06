import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { jwtVerify } from "jose";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message, token, domain } = body;

    let targetUserEmail = "";
    const clerkUser = await currentUser();

    if (clerkUser) {
      targetUserEmail = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    } else if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload?.ownerEmail) {
          targetUserEmail = payload.ownerEmail as string;
        }
      } catch (e) {
        try {
          const bot = await prisma.chatBotMetadata.findUnique({
            where: { id: token },
            select: { user_email: true },
          });
          if (bot?.user_email) targetUserEmail = bot.user_email;
        } catch (dbErr) {
          console.error("Widget ID lookup failed:", dbErr);
        }
      }
    }

    if (!targetUserEmail) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const contact = await prisma.contact.findFirst({
      where: { user_email: targetUserEmail },
      orderBy: { created_at: "desc" },
    });

    const sendToEmail = contact?.email || targetUserEmail;

    // Send email via nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.MAIL_PORT || "587"),
      secure: process.env.MAIL_ENCRYPTION === "ssl", // 587 uses STARTTLS (secure: false), 465 uses SSL (secure: true)
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const fromName = process.env.MAIL_FROM_NAME || "App";
    const fromAddress = process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME;

    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: sendToEmail,
      subject: `New Request from ${name}`,
      text: `You have received a new help request on your website.\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting help request:", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
