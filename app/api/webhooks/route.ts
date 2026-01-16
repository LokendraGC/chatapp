export const runtime = "nodejs";

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    return new Response(
      "Error: SIGNING_SECRET not configured",
      { status: 500 }
    );
  }

  const wh = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, image_url } = evt.data;

    try {
      const newUser = await prisma.user.create({
        data: {
          id,
          organization_id: randomUUID(),
          email: email_addresses[0]?.email_address,
          name: first_name ?? null,
          image: image_url ?? null,
          created_at: new Date(),
        },
      });

      return new Response(JSON.stringify(newUser), { status: 201 });
    } catch (error) {
      console.error("DB error:", error);
      return new Response("Database error", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
