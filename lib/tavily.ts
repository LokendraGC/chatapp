import { tavily } from "@tavily/core";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

export async function searchWeb(query: string) {
  const res = await tvly.search(query, {
    searchDepth: "advanced",
    includeAnswer: true,
    maxResults: 3,
    timeRange: "day",
  });

  

  // Combine useful info
  let webContext = "";

  if (res.answer) {
    webContext += `WEB ANSWER:\n${res.answer}\n\n`;
  }

  if (res.results) {
    webContext += res.results
      .map((r: any) => {
        return `TITLE: ${r.title}\nURL: ${r.url}\nCONTENT: ${r.content}`;
      })
      .join("\n\n");
  }

  return webContext;
}