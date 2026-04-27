import { getWorkspaceEmail } from "@/lib/workspace";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Section ID is required" },
        { status: 400 }
      );
    }

    const section = await prisma.section.findUnique({
      where: {
        id: id,
      }
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    // Verify the section belongs to the user
    if (section.user_email !== (await getWorkspaceEmail(clerkUser) || "")) {
      return NextResponse.json(
        { error: "You can not delete this section" },
        { status: 403 }
      );
    }

    await prisma.section.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(
      { message: "Section deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    );
  }
}
