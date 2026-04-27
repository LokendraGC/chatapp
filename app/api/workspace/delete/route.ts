import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const organizationId = clerkUser.id;

    // First find all conversations so we can delete their messages
    const conversations = await prisma.conversation.findMany({
      where: { user_email: userEmail }
    });
    const conversationIds = conversations.map(c => c.id);

    // Delete all related records in a transaction to ensure data integrity
    await prisma.$transaction([
      prisma.message.deleteMany({
        where: { conversation_id: { in: conversationIds } }
      }),
      prisma.conversation.deleteMany({
        where: { user_email: userEmail }
      }),
      prisma.metaData.deleteMany({
        where: { user_email: userEmail }
      }),
      prisma.contact.deleteMany({
        where: { user_email: userEmail }
      }),
      prisma.faq.deleteMany({
        where: { user_email: userEmail }
      }),
      prisma.knowledgeSource.deleteMany({
        where: { user_email: userEmail }
      }),
      prisma.section.deleteMany({
        where: { user_email: userEmail }
      }),
      prisma.chatBotMetadata.deleteMany({
        where: { user_email: userEmail }
      }),
      prisma.teamMember.deleteMany({
        where: { organization_id: organizationId }
      }),
      prisma.widget.deleteMany({
        where: { organization_id: organizationId }
      }),
      prisma.user.deleteMany({
        where: { email: userEmail }
      })
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    );
  }
}
