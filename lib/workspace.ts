import { User } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function getWorkspaceEmail(clerkUser: User | null): Promise<string | null> {
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  try {
    // Check if the current user is an invited team member
    const teamMember = await prisma.teamMember.findUnique({
      where: { user_email: email },
    });

    if (teamMember && teamMember.organization_id) {
      const client = await clerkClient();
      
      // If the organization_id is actually a fallback user ID (starts with user_)
      if (teamMember.organization_id.startsWith('user_')) {
        const creator = await client.users.getUser(teamMember.organization_id);
        if (creator && creator.emailAddresses[0]?.emailAddress) {
          return creator.emailAddresses[0].emailAddress;
        }
      } else {
        // It's a real Clerk Organization ID
        const org = await client.organizations.getOrganization({
          organizationId: teamMember.organization_id,
        });

        if (org && org.createdBy) {
          const creator = await client.users.getUser(org.createdBy);
          if (creator && creator.emailAddresses[0]?.emailAddress) {
            return creator.emailAddresses[0].emailAddress;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching workspace email:", error);
  }

  // Fallback to their own email
  return email;
}
