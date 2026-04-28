import { countConversationTokens } from "@/lib/countConversationTokens";
import { summarizeMarkdown } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import trimContextByChars from "@/lib/trimContextByChars";
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
        let widgetId: string | undefined;

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);

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
            widgetId = payload.widgedId as string;

            console.log("JWT payload:", payload);
            console.log("sessionID from token:", sessionID);
            console.log("widgetId from token:", widgetId);

            if (!sessionID || !widgetId) {
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

        let { messages, knowledge_source_ids } = await req.json();

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
                        chatbot_id: widgetId
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

            // IMPROVED: Increase context size limit to preserve more information
            context = trimContextByChars(context, 12000); // Increased from 6000

            // Token counting and message summarization
            const tokenCount = await countConversationTokens(messages, context);

            // IMPROVED: Higher threshold before summarizing
            if (tokenCount > 12000) {
                const recentMessages = messages.slice(-15); // Keep more recent messages
                const oldestMessage = messages.slice(0, -15);
                if (oldestMessage.length > 0) {
                    const oldestMessageString = oldestMessage.map((m: any) => `${m.role}: ${m.content}`).join("\n\n");
                    const summary = await summarizeMarkdown(oldestMessageString);
                    context = `PREVIOUS CONVERSATION SUMMARY: ${summary}\n\n${context}`;
                    messages = recentMessages;
                }
            }

            // IMPROVED: Better structured system prompt
const systemPrompt = `You are a friendly, helpful AI customer support assistant for Indaram Health Clinic.

RESPONSE GUIDELINES:
- Provide complete, thorough answers - NEVER cut off mid-sentence
- Be conversational and natural in your tone
- Give specific, accurate information from the CONTEXT below
- If multiple pieces of information are relevant, share them all
- Use bullet points with "-" when listing multiple items

CONTEXT USAGE - CRITICAL:
The CONTEXT section below contains the company's information. This is your PRIMARY source of truth.
- When asked about location, address, phone, email, services, doctors, or any company details, extract the EXACT information from the CONTEXT
- If the user asks "where are you located" or "what's your address", look for address, location, or contact information in the CONTEXT
- ALWAYS check the CONTEXT thoroughly before saying you don't know
- Reference specific details from CONTEXT in your answers
- If team members or staff are listed in CONTEXT, provide their names and roles when asked

FORMATTING:
- Use bullet points when listing services, features, or multiple items
- Include URLs that appear in the CONTEXT using proper markdown links
- Keep responses clear and well-organized

IMPORTANT: 
- Complete every sentence fully with proper punctuation
- Never end responses abruptly or mid-thought
- If you're unsure, say so clearly, but always check CONTEXT first

ESCALATION:
- If information is truly not in CONTEXT and you cannot help, ask: "Would you like me to create a support ticket for you?"
- If user agrees to escalation, respond with: "[ESCALATED] I have created a support ticket for you. Our team will respond soon."

=== CONTEXT (Your primary information source) ===
${context || "No context available."}
=== END CONTEXT ===
`;

            // IMPROVED: Better conversation history formatting
            const conversationHistory = messages
                .map((msg: { role: string; content: string }) => {
                    return `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`;
                })
                .join("\n\n");

            // Build the prompt with clear structure
            const fullPrompt = `${systemPrompt}\n\n=== CONVERSATION HISTORY ===\n${conversationHistory}\n\nAssistant: `;

            console.log("Context length:", context.length);
            console.log("Full prompt length:", fullPrompt.length);

            try {
                const completion = await ai.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: fullPrompt,
                    config: {
                        temperature: 0.7,
                        maxOutputTokens: 2048, // INCREASED from 1000 to allow complete responses
                        topP: 0.95,
                        topK: 40,
                    },
                });

                let reply = completion.text?.trim() ?? "I apologize, but I couldn't generate a response. Please try again.";

                // IMPROVED: Better incomplete response detection
                if (reply && !reply.match(/[.!?]$/) && reply.length > 50) {
                    console.warn("Response appears incomplete (no ending punctuation):", reply);
                    // Try to append an ellipsis to show truncation
                    reply += "...";
                }

                // Check if response is suspiciously short for a complex query
                if (lastMessage.content.length > 50 && reply.length < 30) {
                    console.warn("Response might be too short for query length");
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
                    { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
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
            { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}