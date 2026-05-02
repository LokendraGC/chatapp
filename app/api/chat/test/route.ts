import { getWorkspaceEmail } from "@/lib/workspace";
import { countConversationTokens } from "@/lib/countConversationTokens";
import { summarizeMarkdown } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import trimContextByChars from "@/lib/trimContextByChars";
import { searchWeb } from "@/lib/tavily";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    ...(process.env.GEMINI_BASE_URL && {
      baseURL: process.env.GEMINI_BASE_URL,
    }),
  });

  let { messages, knowledge_source_ids, section_id } = await req.json();

  let context = "";
  let sectionRules = "";
  const userEmail = (await getWorkspaceEmail(clerkUser) || "");

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

  // Fetch knowledge sources - use specific IDs if provided, otherwise fetch all for the user
  if (knowledge_source_ids && knowledge_source_ids.length > 0) {
    const sources = await prisma.knowledgeSource.findMany({
      select: {
        content: true,
      },
      where: {
        id: { in: knowledge_source_ids },
        user_email: userEmail,
        status: "active",
      },
    });
    context = sources
      .map((source) => source.content ?? "")
      .filter((content) => content !== null && content.trim() !== "")
      .join("\n\n");
  } else if (userEmail) {
    // If no specific sources provided, fetch all active knowledge sources for the user
    const sources = await prisma.knowledgeSource.findMany({
      select: {
        content: true,
      },
      where: {
        user_email: userEmail,
        status: "active",
      },
    });
    context = sources
      .map((source) => source.content ?? "")
      .filter((content) => content !== null && content.trim() !== "")
      .join("\n\n");
  }

  context = trimContextByChars(context, 12000);

  let useWebSearch = false;
  if (!context || context.length < 200) {
    useWebSearch = true;
  }

  if (useWebSearch) {
    console.log("Using Tavily web search...");
    const lastMessage = messages[messages.length - 1];
    const webContext = await searchWeb(lastMessage.content);

    context = `
WEB SEARCH RESULTS:
${webContext}

USER QUESTION:
${lastMessage.content}
`;
  }

  const tokenCount = await countConversationTokens(messages, context);

  if (tokenCount > 6000) {
    const recentMessages = messages.slice(-10);
    const oldestMessage = messages.slice(0, -10);
    if (oldestMessage.length > 0) {
      const oldestMessageString = oldestMessage.map((m: any) => `${m.role}: ${m.content}`).join("\n\n");
      const summary = await summarizeMarkdown(oldestMessageString);

      context = `PREVIOUS CONVERSATION SUMMARY: ${summary}\n\n${context}`;

      messages = recentMessages;
    }
  }

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

  // Convert messages array to conversation history string
  const conversationHistory = messages
    .map((msg: { role: string; content: string }) => {
      const roleLabel = msg.role === "user" ? "User" : "Assistant";
      return `${roleLabel}: ${msg.content}`;
    })
    .join("\n\n");

  // Build the full prompt
  const fullPrompt = `${systemPrompt}${conversationHistory ? `\n\nCONVERSATION HISTORY:\n${conversationHistory}\n\nAssistant:` : ""}`;

  try {
    const completion = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: fullPrompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });
    
    let reply = completion.text?.trim() ?? "I'm sorry, couldn't generate a response.";
    
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

    // Ensure the response is complete - check if it ends with proper punctuation
    if (reply && !reply.match(/[.!?]$/) && reply.length > 0) {
      console.warn("Response might be incomplete:", reply);
    }
    
    return NextResponse.json({ reply }, { status: 200 });
    
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
