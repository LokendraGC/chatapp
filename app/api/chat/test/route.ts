import { countConversationTokens } from "@/lib/countConversationTokens";
import { summarizeMarkdown } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import trimContextByChars from "@/lib/trimContextByChars";
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

  let { messages, knowledge_source_ids } = await req.json();

  let context = "";
  const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

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

  context = trimContextByChars(context, 6000);

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

  // Build the full prompt
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
    
    // Ensure the response is complete - check if it ends with proper punctuation
    // If it seems cut off, try to get more content
    if (reply && !reply.match(/[.!?]$/) && reply.length > 0) {
      // Response might be incomplete, but we'll return what we have
      // The increased token limit should prevent this
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
