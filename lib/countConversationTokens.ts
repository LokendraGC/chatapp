import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function countConversationTokens(
  messages: Message[],
  context = "",
  model = "gemini-2.0-flash-lite"
): Promise<number> {
  // Combine everything into a single text blob
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
  } catch {
    return Math.ceil(combinedText.length / 3.5);
  }
}
