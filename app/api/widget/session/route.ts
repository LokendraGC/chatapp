import prisma from "@/lib/prisma";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function getRequestOrigin(req: Request): string | null {
  const origin = req.headers.get("Origin");
  if (origin) return origin;
  const referer = req.headers.get("Referer");
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      return null;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const widget_id = body.widgetID;

    if (!widget_id || typeof widget_id !== "string" || widget_id.trim() === "") {
      return new Response(JSON.stringify({ error: "Widget ID is required" }), {
        status: 400,
        headers: corsHeaders,
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
        headers: corsHeaders,
      });
    }

    // Domain restriction: only allow MetaData.website_url origin, localhost, or app's own domain
    const requestOrigin = getRequestOrigin(req);
    const allowedOrigins: string[] = [
      "http://localhost:3000",
      "https://localhost:3000",
      "http://127.0.0.1:3000",
      "https://127.0.0.1:3000",
    ];

    // Always allow the app's own domain (e.g. https://kxahajur.vercel.app so /test works)
    const appSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (appSiteUrl?.trim()) {
      try {
        const appOrigin = new URL(appSiteUrl.trim()).origin;
        if (!allowedOrigins.includes(appOrigin)) {
          allowedOrigins.push(appOrigin);
        }
      } catch {
        // ignore invalid URL
      }
    }

    const metadata = await prisma.metaData.findUnique({
      where: { user_email: bot.user_email },
      select: { website_url: true },
    });

    if (metadata?.website_url?.trim()) {
      try {
        const allowedOrigin = new URL(metadata.website_url.trim()).origin;
        if (!allowedOrigins.includes(allowedOrigin)) {
          allowedOrigins.push(allowedOrigin);
        }
      } catch {
        // invalid website_url: keep only localhost
      }
    }

    if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
      return new Response(
        JSON.stringify({
          error: "Embedding not allowed on this domain",
          allowed_domains: allowedOrigins,
        }),
        { status: 403, headers: corsHeaders }
      );
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
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("[Sahayak] Error creating session:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}



export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}