import { getWorkspaceEmail } from "@/lib/workspace";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      name,
      description,
      tone,
      allowedTopics,
      blockedTopics,
      fallbackBehavior,
      sourceIds,
      status,
    } = body;
    if (!id || !name || !description || !tone) {
      return NextResponse.json(
        { error: "ID, name, description and tone are required" },
        { status: 400 }
      );
    }

    if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
      return NextResponse.json(
        { error: "ID, source IDs are required" },
        { status: 400 }
      );
    }

    await prisma.section.update({
      where: {
        id: id,
      },
      data: {
        user_email: (await getWorkspaceEmail(clerkUser) || ""),
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
      { message: "Section updated successfully" },
      { status: 200 }
    );


  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}
