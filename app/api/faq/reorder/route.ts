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
    const orderedIds = Array.isArray(body?.orderedIds) ? body.orderedIds : [];
    if (orderedIds.length === 0) {
      return NextResponse.json(
        { error: "orderedIds is required" },
        { status: 400 }
      );
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress ?? "";

    await prisma.$transaction(
      orderedIds.map((id: string, index: number) =>
        prisma.faq.updateMany({
          where: {
            id,
            user_email: userEmail,
          },
          data: {
            sort_order: index,
          },
        })
      )
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error reordering FAQs:", error);
    return NextResponse.json(
      { error: "Failed to reorder FAQs" },
      { status: 500 }
    );
  }
}
