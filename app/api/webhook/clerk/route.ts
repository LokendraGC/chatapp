import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!SIGNING_SECRET) {
      return NextResponse.json(
        { error: "CLERK_WEBHOOK_SECRET not configured" },
        { status: 500 }
      );
    }

    const wh = new Webhook(SIGNING_SECRET);

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: "Missing Svix headers" },
        { status: 400 }
      );
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
      console.error("Invalid webhook signature", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("Received Clerk webhook event:", evt.type);

    // 2️⃣ Handle different events
    switch (evt.type) {
      case "organizationMembership.created":
        // User accepted invitation and joined organization
        const membership = evt.data;
        // Find member by email since we may not have invitation_id in metadata
        if (membership.public_user_data?.identifier) {
          await prisma.teamMember.updateMany({
            where: { user_email: membership.public_user_data.identifier as string },
            data: {
              status: "active",
              clerk_user_id: membership.public_user_data.user_id || null,
            },
          });
        }
        break;

      case "organizationInvitation.created":
        // Invitation was created (already handled in team/add route)
        console.log("Invitation created:", evt.data.id);
        break;

      case "organizationInvitation.revoked":
        // Invitation was revoked before acceptance
        const revokedInvite = evt.data;
        await prisma.teamMember.updateMany({
          where: { clerk_invitation_id: revokedInvite.id },
          data: { status: "revoked" },
        });
        break;

      case "organizationInvitation.accepted":
        // Invitation was accepted
        // Note: clerk_user_id will be set by organizationMembership.created event
        const acceptedInvite = evt.data;
        await prisma.teamMember.updateMany({
          where: { clerk_invitation_id: acceptedInvite.id },
          data: {
            status: "active",
          },
        });
        break;

      default:
        console.log("Unhandled event type:", evt.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Failed to handle webhook" },
      { status: 500 }
    );
  }
}
