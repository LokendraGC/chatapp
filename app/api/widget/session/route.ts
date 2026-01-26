import prisma from "@/lib/prisma";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const widget_id = body.widgetID;
    
    if (!widget_id || typeof widget_id !== "string" || widget_id.trim() === "") {
      return new Response(JSON.stringify({ error: "Widget ID is required" }), {
        status: 400,
      });
    }

    const bot = await prisma.chatBotMetadata.findUnique({
      where: {
        id: widget_id.trim(),
      },
    });

    if (!bot) {
      return new Response(JSON.stringify({ error: "Bot not found" }), {
        status: 404,
      });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const sessionID = crypto.randomUUID();

    const token = await new SignJWT({
      widgedId: bot.id,
      ownerEmail: bot.user_email,
      sessionID,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    return new Response(JSON.stringify({ token }), {
      status: 200,
    });
    
  } catch (error) {
    console.error("[K Xa Hajur] Error creating session:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
