import { prisma } from "@/lib/prisma";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let orgId = clerkUser.id;
    try {
      const client = await clerkClient();
      const memberships = await client.users.getOrganizationMembershipList({
        userId: clerkUser.id,
      });
      if (memberships?.data?.[0]?.organization?.id) {
        orgId = memberships.data[0].organization.id;
      }
    } catch (err) {
      console.error("Error fetching Clerk organization memberships:", err);
    }

    const teamMembers = await prisma.teamMember.findMany({
      where: {
        organization_id: orgId,
      },
    });

    return NextResponse.json({ teamMembers: teamMembers || [] }, { status: 200 });

  } catch (error) {
    console.error("API error in team fetch:", error);
    return NextResponse.json(
      { teamMembers: [], error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
