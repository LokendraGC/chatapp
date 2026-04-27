import { getWorkspaceEmail } from "@/lib/workspace";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }


        const { id: conversationId } = await params;

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
            },

        });
        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }


        const chatbotMetadata = await prisma.chatBotMetadata.findMany({
            where: {
                user_email: (await getWorkspaceEmail(clerkUser) || ""),
            },
        });
        if (chatbotMetadata.length === 0) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const botIds = chatbotMetadata.map((bot: { id: string }) => bot.id);

        const messages = await prisma.message.findMany({
            where: {
                conversation_id: conversationId,
            },
            orderBy: {
                created_at: "asc",
            },
        });
        if (messages.length === 0) {
            return NextResponse.json({ error: "No messages found" }, { status: 404 });
        }

        return NextResponse.json({ messages }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}