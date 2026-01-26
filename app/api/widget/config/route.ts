import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";

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
    
    const widgetId = payload.widgedId;
    const ownerEmail = payload.ownerEmail;
    const sessionID = payload.sessionID;

    const metadata = await prisma.chatBotMetadata.findUnique({
      where: {
        id: widgetId as string,
      },
    });

    if (!metadata) {
        return new Response(JSON.stringify({ error: "Bot not found" }), {
            status: 404,
        });
    }

    const userSections = await prisma.section.findMany({
      where: {
        user_email: ownerEmail as string,
      },
    });

    return new Response(JSON.stringify({
        metadata,
        userSections,
    }), {
        status: 200,
    });
    
  } catch (error) {
    console.error("[K Xa Hajur] Error getting widget config:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
