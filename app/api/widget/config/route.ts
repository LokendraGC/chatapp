import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      return new Response(JSON.stringify({ error: "Token is required" }), {
        status: 400,
      });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (!payload) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 400,
      });
    }

    const widgetId = payload.widgedId as string;
    const ownerEmail = payload.ownerEmail as string;
    const sessionID = payload.sessionID as string;

    const metadata = await prisma.chatBotMetadata.findUnique({
      where: {
        id: widgetId,
      },
    });

    if (!metadata) {
      return new Response(JSON.stringify({ error: "Bot not found" }), {
        status: 404,
      });
    }

    // Get sections for the widget owner (from token, not current user)
    const sections = await prisma.section.findMany({
      where: {
        user_email: ownerEmail,
        status: "active", // Only get active sections
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return new Response(
      JSON.stringify({
        metadata,
        sections, // Changed from userSections to sections
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[Sahayak] Error getting widget config:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
