import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from Prisma database
    const user = await prisma.user.findUnique({
      where: {
        email: clerkUser.emailAddresses[0]?.emailAddress,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sources = await prisma.knowledgeSource.findMany({
      where: {
        user_email: user.email,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(
      {
        sources,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching knowledge sources:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

