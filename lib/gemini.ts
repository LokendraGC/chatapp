import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  ...(process.env.GEMINI_BASE_URL && { baseURL: process.env.GEMINI_BASE_URL }),
});

/**
 * IMPROVED: Better summarization that preserves critical details
 */
export async function summarizeMarkdown(markdown: string) {
  try {
    const prompt = `You are a precision data extraction engine for an AI chatbot knowledge base.

YOUR TASK: Convert the input into a STRUCTURED, FACTUAL SUMMARY that preserves all critical details.

CRITICAL - PRESERVE THESE EXACTLY:
✓ Company name, addresses, locations
✓ Phone numbers, emails, websites, URLs
✓ Names of people, titles, roles
✓ Specific services, products, features
✓ Hours of operation, pricing, policies
✓ Important dates, numbers, statistics

REMOVE:
✗ Navigation menus, buttons, UI elements
✗ "Click here", "Learn more", generic CTAs
✗ Decorative content, emojis, icons
✗ Duplicate information
✗ Marketing fluff and repetitive phrases

FORMAT:
- Use clear headings (##) for main topics
- Use bullet points (-) for lists
- Preserve URLs using markdown format: [Link Text](URL)
- Keep sentences complete and factual
- Organize by topic (Contact Info, Services, Team, etc.)

CRITICAL RULES:
- NEVER truncate contact information (addresses, phones, emails)
- ALWAYS complete your sentences with proper punctuation
- Keep factual density high - every sentence should add value
- Target length: 2000-3000 words of dense, useful information

Input to summarize:
${markdown}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.1, // Low temp for factual extraction
        maxOutputTokens: 6144, // Increased to ensure complete summaries
        topP: 0.95,
      },
    });

    return response.text?.trim() ?? "";
  } catch (error) {
    console.error("Error in summarizeMarkdown:", error);
    throw error;
  }
}

/**
 * Count tokens in conversation for context management
 */
type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function countConversationTokens(
  messages: Message[],
  context = "",
  model = "gemini-3-flash-preview"
): Promise<number> {
  // Combine everything into a single text blob - defined outside try for catch access
  const combinedText = [
    context,
    ...messages.map(
      (m) => `${m.role.toUpperCase()}: ${m.content}`
    ),
  ].join("\n\n");

  try {
    const result = await ai.models.countTokens({
      model,
      contents: combinedText,
    });

    return result.totalTokens ?? 0;
  } catch (error) {
    console.error("Error counting tokens:", error);
    // Return estimate if API call fails
    return Math.ceil(combinedText.length / 3.5);
  }
}