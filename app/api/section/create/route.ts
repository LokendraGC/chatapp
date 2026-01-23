import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      description,
      tone,
      allowedTopics,
      blockedTopics,
      fallbackBehavior,
      sourceIds,
      status,
    } = body;
    if (!name || !description || !tone) {
      return NextResponse.json(
        { error: "Name, description and tone are required" },
        { status: 400 }
      );
    }

    if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
      return NextResponse.json(
        { error: "Source IDs are required" },
        { status: 400 }
      );
    }

    await prisma.section.create({
      data: {
        user_email: clerkUser.emailAddresses[0]?.emailAddress,
        name,
        description,
        tone,
        allowed_topics: allowedTopics,
        blocked_topics: blockedTopics,
        source_ids: sourceIds,
        status: status || "active",
      },
    });

    return NextResponse.json(
      { message: "Section created successfully" },
      { status: 200 }
    );


  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}
