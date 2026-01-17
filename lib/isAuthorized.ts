"use server";

import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function isAuthorized() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  try {
    // Get user from Prisma database
    const user = await prisma.user.findUnique({
      where: {
        email: clerkUser.emailAddresses[0]?.emailAddress,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      organization_id: user.organization_id,
      name: user.name,
      image: user.image,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
  