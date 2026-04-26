import OpenAI from "openai";

// import https from "https";

// const agent = new https.Agent({
//   rejectUnauthorized: false, // For development - set to true in production
// });

const customFetch = (url: RequestInfo | URL, init?: RequestInit) => {
  return fetch(url, {
    ...init,
  });
};

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,

  fetch: customFetch,

  baseURL: process.env.OPENAI_BASE_URL,
});

export async function summarizeMarkdown(markdown: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",

      temperature: 0.1,

      max_tokens: 4000,

      messages: [
        {
          role: "system",

          content: `

You are a data summarization engine for an AI chatbot.

Your task:
- Convert the input website markdown or text or csv files data into a CLEAN, WELL-STRUCTURED SUMMARY for LLM context usage.

STRICT RULES:
- Use bullet points and headings to organize the summary.
- Include relevant links (such as "About Us" or specific website URLs) using <a> tags with target="_blank" so they open in a new tab.
- Always provide FULL messages and complete sentences. Do NOT truncate or cut off thoughts (e.g., avoid "I am..." or "our server is..." without finishing).
- Remove navigation, menus, buttons, CTAs, pricing tables, sponsors, ads, testimonials, community chats, UI labels, emojis, and decorative content.
- Remove repetition and marketing language.
- Keep ONLY factual, informational content that helps answer customer support questions.
- The final output MUST be clear, detailed, and under 3000 words.
- CRITICAL: Never end a message abruptly or mid-sentence. Every response must conclude with a complete thought and proper punctuation.

The result will be stored as long-term context for a chatbot.

`,
        },

        {
          role: "user",

          content: markdown,
        },
      ],
    });

    return completion.choices[0].message.content?.trim() ?? "";
  } catch (error) {
    console.error("Error in summarizeMarkdown:", error);

    throw error;
  }
}

// export async function summarizeConversation(messages: any[]) {
//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",

//       temperature: 0.3,

//       max_tokens: 500,

//       messages: [
//         {
//           role: "system",

//           content:
//             "Summarize the following conversation history into a concise paragraph, preserving key details and user intent.The final output MUST be under 2000 words.",
//         },

//         ...messages,
//       ],
//     });

//     return completion.choices[0].message.content?.trim() ?? "";
//   } catch (error) {
//     console.error("Error in summarizeConversation:", error);

//     throw error;
//   }
// }
