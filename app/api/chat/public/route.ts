import { countConversationTokens } from "@/lib/countConversationTokens";
import { summarizeMarkdown } from "@/lib/openAI";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

// CORRECT: Named export for POST method
export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return NextResponse.json(
                { error: "Missing session token" },
                { status: 401 }
            );
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            ...(process.env.GEMINI_BASE_URL && {
                baseURL: process.env.GEMINI_BASE_URL,
            }),
        });


        let sessionID: string | undefined;
        let widgetID: string | undefined;

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);

        // Make sure JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not set in environment variables");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        try {
            const { payload } = await jwtVerify(token, secret);
            sessionID = payload.sessionID as string;
            widgetID = payload.widgedId as string;

            // Add debugging logs
            console.log("JWT payload:", payload);
            console.log("sessionID from token:", sessionID);
            console.log("widgetID from token:", widgetID);

            if (!sessionID || !widgetID) {
                return NextResponse.json(
                    { error: "Missing session or widget ID in token" },
                    { status: 401 }
                );
            }

        } catch (jwtError) {
            console.error("JWT verification error:", jwtError);
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            );
        }

        // Parse request body
        let { messages, knowledge_source_ids } = await req.json();

        // Add debugging log
        console.log("Request body parsed:", { messages, knowledge_source_ids });

        const lastMessage = messages[messages.length - 1];

        if (!lastMessage || lastMessage.role !== 'user') {
            return NextResponse.json(
                { error: "Last message must be from user" },
                { status: 400 }
            );
        }

        // Database operations
        try {
            const existingConversation = await prisma.conversation.findFirst({
                select: {
                    id: true
                },
                where: {
                    id: sessionID
                }
            });

            console.log("Existing conversation found:", existingConversation);

            if (!existingConversation) {
                const forwardFor = req.headers.get("X-Forwarded-For");
                const ip = forwardFor ? forwardFor.split(",")[0] : 'unknown ip';
                const visitorName = `Visitor ${ip}`;

                console.log("Creating new conversation with sessionID:", sessionID);

                await prisma.conversation.create({
                    data: {
                        id: sessionID,
                        visitor_ip: ip,
                        name: visitorName,
                        chatbot_id: widgetID
                    }
                });

                const prevMessages = messages.slice(0, -1);
                if (prevMessages.length > 0) {
                    for (const msg of prevMessages) {
                        await prisma.message.create({
                            data: {
                                conversation_id: sessionID,
                                role: msg.role,
                                content: msg.content
                            }
                        });
                    }
                }
            }

            if (lastMessage && lastMessage.role === 'user') {
                await prisma.message.create({
                    data: {
                        conversation_id: sessionID,
                        role: lastMessage.role,
                        content: lastMessage.content
                    }
                });
            }

            // Fetch knowledge sources and build context
            let context = '';
            if (knowledge_source_ids && knowledge_source_ids.length > 0) {
                try {
                    const sources = await prisma.knowledgeSource.findMany({
                        select: {
                            content: true
                        },
                        where: {
                            id: { in: knowledge_source_ids }
                        }
                    });

                    context = sources.map(source => source.content).filter(Boolean).join("\n\n");
                } catch (error) {
                    console.error("Error in getting knowledge sources:", error);
                    return NextResponse.json(
                        { error: "RAG Retrieval error" },
                        { status: 500 }
                    );
                }
            }

            // Token counting and message summarization
            const tokenCount = await countConversationTokens(messages, context);

            if (tokenCount > 6000) {
                const recentMessages = messages.slice(-10);
                const oldestMessage = messages.slice(0, -10);
                if (oldestMessage.length > 0) {
                    const summary = await summarizeMarkdown(oldestMessage);
                    context = `PREVIOUS CONVERSATION SUMMARY: ${summary}\n\n${context}`;
                    messages = recentMessages;
                }
            }


            const systemPrompt = `Your name is Sarah and you are friendly and helpful, humanlike customer support specialist.

CRITICAL RULES:
If asked for your name, always respond with "I'm Sarah".

If asked for your role, always respond with "I'm a customer support specialist."

Keep answers CONCISE (2-4 sentences maximum) and conversational. Always provide complete, helpful answers. NEVER cut off your response mid-sentence - always complete your full thought.

KNOWLEDGE BASE USAGE:
- The CONTEXT section below contains important information about the company, products, services, and policies.
- ALWAYS use information from the CONTEXT to answer user questions accurately.
- If the user asks about something mentioned in the CONTEXT, provide the relevant information from the CONTEXT.
- Only say you don't know if the information is truly not in the CONTEXT.
- When answering, reference specific details from the CONTEXT when relevant.

If the user asks a broad question, DO NOT provide a summary. Instead, ask more specific questions to better understand their needs.

Never dump information. Always conversationally guide the user to the specific topic.

Mirror the user's communication style but ensure your responses are always complete and helpful.

IMPORTANT: Always finish your sentences completely. Never cut off mid-sentence.

ESCALATION PROTOCOL:
-If you simply DON'T KNOW THE ANSWER from the context (after carefully checking), or if the user indicates they're unhappy, ask: "Would you like me to create a support ticket for you?"
-If the user says yes, or gives permission to create a support ticket, your reply MUST be: "[ESCALATED] I have created a support ticket for you. Please wait for a response from our team.";

CONTEXT (Use this information to answer questions):
${context || "No context available."}

`;

            // Convert messages array to conversation history string
            const conversationHistory = messages
                .map((msg: { role: string; content: string }) => {
                    const roleLabel = msg.role === "user" ? "User" : "Assistant";
                    return `${roleLabel}: ${msg.content}`;
                })
                .join("\n\n");

            // Build the full prompt with system prompt and conversation history
            const fullPrompt = `${systemPrompt}${conversationHistory ? `\n\nCONVERSATION HISTORY:\n${conversationHistory}\n\nAssistant:` : ""}`;

            try {
                const completion = await ai.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: fullPrompt,
                    config: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    },
                });

                let reply = completion.text?.trim() ?? "I'm sorry, couldn't generate a response.";

                if (reply && !reply.match(/[.!?]$/) && reply.length > 0) {

                    console.warn("Response might be incomplete:", reply);
                }


                try {

                    await prisma.message.create({
                        data: {
                            conversation_id: sessionID,
                            role: "assistant",
                            content: reply
                        }
                    });

                } catch (error) {
                    console.error("Error in saving message:", error);
                    return NextResponse.json(
                        { error: "Database error" },
                        { status: 500 }
                    );
                }

                return NextResponse.json({ reply }, { status: 200 });

            } catch (error) {
                console.error("Error in generating response:", error);
                return NextResponse.json(
                    { error: "Internal server error" },
                    { status: 500 }
                );
            }

        } catch (dbError) {
            console.error("Database error:", dbError);
            return NextResponse.json(
                { error: "Database error" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Error in public chat:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}