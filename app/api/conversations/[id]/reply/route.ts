import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: conversationId } = await params;
        const { content } = await req.json();

        if (!content || content.trim() === "") {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

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
                user_email: clerkUser.emailAddresses[0]?.emailAddress,
            },
        });
        if (chatbotMetadata.length === 0) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const botIds = chatbotMetadata.map((bot: { id: string }) => bot.id);

        if (!chatbotMetadata) {
            return NextResponse.json({ error: "Bot not found" }, { status: 404 });
        }

        await prisma.message.create({
            data: {
                conversation_id: conversationId,
                role: "user",
                content: content,
            }
        })

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}