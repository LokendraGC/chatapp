import { getWorkspaceEmail } from "@/lib/workspace";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const chatbotMetadata = await prisma.chatBotMetadata.findMany({
            where: {
                user_email: (await getWorkspaceEmail(clerkUser) || ""),
            },
        });
        if (chatbotMetadata.length === 0) {
            return NextResponse.json({ error: "No chatbot metadata found" }, { status: 404 });
        }

        const botIds = chatbotMetadata.map((bot) => bot.id);

        const conversations = await prisma.conversation.findMany({
            where: {
                chatbot_id: { in: botIds },

            },
            orderBy: {
                created_at: "desc",
            }
        });

        const data = await Promise.all(conversations.map(async (conversation) => {
            const lastMessage = await prisma.message.findFirst({
                where: {
                    conversation_id: conversation.id,
                },
                orderBy: {
                    created_at: "desc",
                },
                take: 1,
            });

            let timeDisplay = "";
            const date = new Date(lastMessage?.created_at || conversation.created_at || new Date().toISOString());
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            if (diffMins < 60) timeDisplay = `${diffMins}m ago`;
            else if (diffHours < 24) timeDisplay = `${diffHours}h ago`;
            else timeDisplay = date.toLocaleDateString();

            return {
                id: conversation.id,
                user: conversation.name || "Anonymous",
                lastMessage: lastMessage?.content || "Started a conversation",
                time: timeDisplay,
                status: "active",
                visitorIp: conversation.visitor_ip,
                email: conversation.user_email,
            };
        }));

        return NextResponse.json({ conversations: data }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}