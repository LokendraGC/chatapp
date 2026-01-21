import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
// The client gets the API key from the environment variable `GEMINI_API_KEY`
// If GEMINI_BASE_URL is set, it will be used as the base URL
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  ...(process.env.GEMINI_BASE_URL && { baseURL: process.env.GEMINI_BASE_URL }),
});

export async function summarizeMarkdown(markdown: string) {
  try {
    const prompt = `You are a data summarization engine for an AI chatbot.

Your task:
- Convert the input website markdown or text or csv files data into a CLEAN, DENSE SUMMARY for LLM context usage.

STRICT RULES:
- Output ONLY plain text (no markdown, no bullet points, no headings).
- Write as ONE continuous paragraph.
- Remove navigation, menus, buttons, CTAs, pricing tables, sponsors, ads, testimonials, community chats, UI labels, emojis, and decorative content.
- Remove repetition and marketing language.
- Keep ONLY factual, informational content that helps answer customer support questions.
- Do NOT copy sentences verbatim unless absolutely necessary.
- Compress aggressively while preserving meaning.
- The final output MUST be under 2000 words.

The result will be stored as long-term context for a chatbot.

Input data to summarize:

${markdown}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 900,
      },
    });

    return response.text?.trim() ?? "";
  } catch (error) {
    console.error("Error in summarizeMarkdown:", error);
    throw error;
  }
}