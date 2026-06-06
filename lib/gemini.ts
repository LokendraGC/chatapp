import { GoogleGenAI, GenerateContentConfig } from "@google/genai";

// Initialize Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  ...(process.env.GEMINI_BASE_URL && { baseURL: process.env.GEMINI_BASE_URL }),
});

const MODEL_FALLBACK_CHAIN = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-3.5-flash",
];

/**
 * Calls generateContent with automatic model fallback on 429 rate-limit errors.
 * Tries each model in MODEL_FALLBACK_CHAIN in order.
 */
export async function generateContentWithFallback(
  client: GoogleGenAI,
  contents: string,
  config?: GenerateContentConfig,
  preferredModel = "gemini-2.0-flash-lite"
) {
  const chain = [
    preferredModel,
    ...MODEL_FALLBACK_CHAIN.filter((m) => m !== preferredModel),
  ];

  let lastError: unknown;
  for (const model of chain) {
    try {
      return await client.models.generateContent({ model, contents, config });
    } catch (error) {
      const status = (error as { status?: number })?.status;
      if (status !== 429 && status !== 404) throw error;
      console.warn(`Rate limited on ${model}, trying next model...`);
      lastError = error;
    }
  }
  throw lastError;
}

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
- Preserve URLs as plain HTML: <a href="URL">Link Text</a>
- Write all contact details (phone, email, address) as plain text, no markdown
- Keep sentences complete and factual
- Organize by topic (Contact Info, Services, Team, etc.)

CRITICAL RULES:
- NEVER truncate contact information (addresses, phones, emails)
- ALWAYS complete your sentences with proper punctuation
- Keep factual density high - every sentence should add value
- Target length: 2000-3000 words of dense, useful information

Input to summarize:
${markdown}`;

    const response = await generateContentWithFallback(ai, prompt, {
      temperature: 0.1,
      maxOutputTokens: 6144,
      topP: 0.95,
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
  model = "gemini-2.0-flash"
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