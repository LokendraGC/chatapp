import { countConversationTokens } from "@/lib/countConversationTokens";
import { summarizeMarkdown } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import trimContextByChars from "@/lib/trimContextByChars";
import { searchWeb } from "@/lib/tavily";
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

            // console.log("JWT payload:", payload);
            // console.log("sessionID from token:", sessionID);
            // console.log("widgetId from token:", widgetId);

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

        let { messages, knowledge_source_ids, section_id } = await req.json();

        let sectionRules = "";

        // Fetch Section Metadata if section_id is provided
        if (section_id) {
            const section = await prisma.section.findUnique({
                where: { id: section_id }
            });

            if (section) {
                sectionRules = `
BEHAVIORAL RULES FOR THIS SESSION:
- TONE: ${section.tone}
${section.allowed_topics ? `- ALLOWED TOPICS: ${section.allowed_topics}` : ""}
${section.blocked_topics ? `- BLOCKED TOPICS: ${section.blocked_topics}` : ""}
- MISSION: ${section.description}
`;
            }
        }

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

            // console.log("Existing conversation found:", existingConversation);

            if (!existingConversation) {
                const forwardFor = req.headers.get("X-Forwarded-For");
                const ip = forwardFor ? forwardFor.split(",")[0] : 'unknown ip';
                const visitorName = `Visitor ${ip}`;

                // console.log("Creating new conversation with sessionID:", sessionID);

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
            let useWebSearch = false;
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

            if (!context || context.length < 200) {
                useWebSearch = true;
            }

            if (useWebSearch) {
                // console.log("Using Tavily web search...");

                const webContext = await searchWeb(lastMessage.content);

                context = `
WEB SEARCH RESULTS:
${webContext}

USER QUESTION:
${lastMessage.content}
`;
                }

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
            const systemPrompt = `You are a friendly AI assistant — talk like a helpful friend, not a formal support agent.

LANGUAGE RULE (MOST IMPORTANT):
- Detect the language of the user's message and reply in that EXACT same language.
- If user writes in Nepali (नेपाली), reply fully in Nepali.
- If user writes in English, reply in English.
- Never mix languages unless the user does.

PERSONALITY:
- Warm, casual, friendly — like texting a knowledgeable friend.
- Use natural conversational tone. No corporate speak.
- Short responses unless a detailed answer is truly needed.
- Never start with "Certainly!", "Sure!", "Of course!" or similar filler.
- Never dump all information at once — answer only what was asked.

FORMATTING (HTML only):
- Use <a href="URL" target="_blank" style="color:#ffffff;text-decoration:underline;word-break:break-all;">Link Text</a> for all URLs.
- Use <ul><li>item</li></ul> for lists only when listing 3+ items.
- Use <br> for line breaks when needed.
- NO markdown — no **bold**, no [text](url), no ## headings.
- Keep responses short — 2-4 sentences max unless a list is needed.

${sectionRules}

CONTEXT USAGE:
- Only use the CONTEXT below to answer questions about the company.
- Answer only what was asked — never volunteer extra info.
- First use CONTEXT (company knowledge)
- If CONTEXT is empty or insufficient, use WEB SEARCH RESULTS
- STICK TO THE BEHAVIORAL RULES PROVIDED ABOVE (if any).
- If both are insufficient, say you don't know
- Never hallucinate
- If user agrees: "[ESCALATED] Support ticket created. Our team will be in touch soon."

CONTEXT:
${context || "No context available."}
END CONTEXT`;


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

                // Safe Link Conversion & Hallucination Cleanup
                reply = reply
                    // Clean up potential AI hallucinations like ["](URL) inside href
                    .replace(/href="([^"]+)\["\]\((https?:\/\/[^\s)]+)\)"/g, 'href="$1$2"')
                    // Convert markdown links ONLY if they are not already part of an HTML link
                    .replace(/<a[^>]*>.*?<\/a>|\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (match, text, url) => {
                        if (text && url) {
                            return `<a href="${url}" target="_blank">${text}</a>`;
                        }
                        return match;
                    })
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .replace(/\*(.*?)\*/g, '$1')
                    .replace(/#{1,6}\s/g, '')
                    .replace(/^\s*[-*]\s/gm, '- ');
                
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