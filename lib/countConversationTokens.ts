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
  model = "gemini-3-flash-preview"
): Promise<number> {
  // Combine everything into a single text blob
  const combinedText = [
    context,
    ...messages.map(
      (m) => `${m.role.toUpperCase()}: ${m.content}`
    ),
  ].join("\n\n");

  const result = await ai.models.countTokens({
    model,
    contents: combinedText,
  });

  return result.totalTokens ?? 0;
}
