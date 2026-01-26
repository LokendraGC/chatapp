import { clerkClient } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    const user = await prisma.user.findUnique({
      where: {
        email: clerkUser?.emailAddresses[0]?.emailAddress,
      },
    });
    if (!clerkUser || !user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }


    const organizationId = clerkUser.id;

    // Check if member exists locally
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        user_email: email,
        organization_id: organizationId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a team member or already invited" },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    let invitation: any = null;
    let clerkOrganizationId: string | null = null;

    try {
      // Try to get user's organization memberships
      const organizationMemberships = await client.users.getOrganizationMembershipList({
        userId: clerkUser.id,
      });
      clerkOrganizationId = organizationMemberships.data[0]?.organization.id || null;
    } catch (orgError: any) {
      // If we can't get organizations (403/404), that's okay - we'll continue without Clerk invitation
      console.log("Could not get organization memberships:", orgError?.status || orgError?.message);
      clerkOrganizationId = null;
    }


    console.log("clerkOrganizationId", clerkOrganizationId);
    // 2️⃣ Create Clerk invitation (only if we have a valid organization)
    if (clerkOrganizationId) {
      try {
        // Get the base URL from headers
        const headersList = await headers();
        const host = headersList.get("host") || "localhost:3000";
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
        const redirectUrl = `${protocol}://${host}/`; // Redirect to home page after sign-up

        invitation = await client.organizations.createOrganizationInvitation({
          organizationId: clerkOrganizationId,
          emailAddress: email,
          role: "org:member", 
          redirectUrl: redirectUrl,
        });
      } catch (inviteError: any) {
        // If invitation fails (404 means org doesn't exist), continue without it
        console.log("Could not create Clerk invitation:", inviteError?.status || inviteError?.message);
        invitation = null;
      }
    }

    // 3️⃣ Create team member in database (this always happens, even without Clerk invitation)
    const newMember = await prisma.teamMember.create({
      data: {
        name,
        user_email: email,
        organization_id: organizationId,
        clerk_invitation_id: invitation?.id || null,
        status: "pending",
      },
    });

    return NextResponse.json(
      { member: newMember, invitation },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in team/add route:", error);

    // Handle specific error types
    if (error?.code === "P1001") {
      return NextResponse.json(
        { error: "Database connection error. Please try again later." },
        { status: 503 }
      );
    }
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Member with this email already exists" },
        { status: 400 }
      );
    }

    // Handle Clerk API errors
    if (
      error?.errors?.[0]?.message?.includes("already exists") ||
      error?.errors?.[0]?.code === "duplicate_record"
    ) {
      return NextResponse.json(
        { error: "An invitation for this email already exists" },
        { status: 400 }
      );
    }
    
    // Handle invalid resource ID error
    if (error?.message?.includes("A valid resource ID is required")) {
      return NextResponse.json(
        { error: "Invalid organization. Please try again." },
        { status: 400 }
      );
    }
    
    // Handle Clerk 404 Not Found errors (organization doesn't exist)
    if (error?.status === 404 || error?.clerkError) {
      // If it's a database error, that's serious. If it's just Clerk, we can continue
      if (error?.code === "P2002" || error?.code === "P1001") {
        throw error; // Re-throw database errors
      }
      // For Clerk 404, we'll still try to save to database in the main try block
      // This error handler should only catch if database save also fails
    }

    // Generic error response
    return NextResponse.json(
      { error: error?.message || "Failed to invite member" },
      { status: 500 }
    );
  }
}
