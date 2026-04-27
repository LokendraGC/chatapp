import { getWorkspaceEmail } from "@/lib/workspace";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bots = await prisma.chatBotMetadata.findMany({
            where: {
                user_email: (await getWorkspaceEmail(clerkUser) || ""),
            },
        });

        // Group knowledge sources by type and count them for this user
        const knowledgeByType = await prisma.knowledgeSource.groupBy({
            by: ["type"],
            where: {
                user_email: (await getWorkspaceEmail(clerkUser) || ""),
            },
            _count: {
                _all: true,
            },
        });

        const knowledgeStats = {
            website: 0,
            upload: 0,
            text: 0,
            total: 0,
        }

        knowledgeByType.forEach((item: { type: string; _count: { _all: number } }) => {
            if (item.type === "website") knowledgeStats.website += item._count._all;
            if (item.type === "upload") knowledgeStats.upload += item._count._all;
            if (item.type === "text") knowledgeStats.text += item._count._all;
            knowledgeStats.total += item._count._all;
        });

        const recentSections = await prisma.section.findMany({
            where: {
                user_email: (await getWorkspaceEmail(clerkUser) || ""),
            },
            orderBy: {
                created_at: "desc",
            },
        });

        const sectionStats = {
            total: recentSections.length,
            list: recentSections.map((section: { name: string; source_ids: string[]; tone: string }) => {
                return {
                    name: section.name,
                    sourceCount: section.source_ids?.length || 0,
                    tone: section.tone,
                }
            })
        }

        const totalSection = recentSections.length;
        const totalSource = recentSections.reduce((acc: number, section: { source_ids: string[] }) => acc + (section.source_ids?.length || 0), 0);
        const botIds = bots.map((bot) => bot.id);


        let recentChats: { title: string; snippet: string; time: string }[] = [];
        let totalConversations = 0;

        if (botIds.length > 0) {
            const rawConvs = await prisma.conversation.findMany({
                where: {
                    chatbot_id: { in: botIds },
                },
                orderBy: {
                    created_at: "desc",
                },
            });

            totalConversations = await prisma.conversation.count({
                where: {
                    chatbot_id: { in: botIds },
                },
            });

            recentChats = await Promise.all(
                rawConvs.map(async (conv) => {
                    const lastMessage = await prisma.message.findFirst({
                        where: {
                            conversation_id: conv.id,
                        },
                        orderBy: {
                            created_at: "desc",
                        },
                        take: 1,
                    });

                    let timeDisplay = "";
                    const date = new Date(
                        lastMessage?.created_at || conv.created_at || new Date().toISOString()
                    );
                    const now = new Date();
                    const diffMs = now.getTime() - date.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMins / 60);
                    if (diffMins < 60) timeDisplay = `${diffMins}m ago`;
                    else if (diffHours < 24) timeDisplay = `${diffHours}h ago`;
                    else timeDisplay = date.toLocaleDateString();

                    return {
                        title: conv.name || "New conversation",
                        snippet: lastMessage?.content || "",
                        time: timeDisplay,
                    };
                })
            );
        }

        return NextResponse.json({
            botId: botIds[0] || null,
            knowledge: knowledgeStats,
            sections: sectionStats,
            chats: recentChats,
            counts: {
                knowledge: knowledgeStats.total,
                sections: sectionStats.total,
                conversations: totalConversations
            }
        })
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}