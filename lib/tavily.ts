import { tavily } from "@tavily/core";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

/**
 * Dynamic Tavily search (advanced + fresh data)
 */
export async function searchWeb(query: string) {
  const q = query.trim();
  if (!q) return "";

  const res = await tvly.search(q, {
    includeAnswer: "basic",
    searchDepth: "advanced",
    timeRange: "week", // latest info
  });

  let webContext = "";

  if (res.answer) {
    webContext += `WEB ANSWER:\n${res.answer}\n\n`;
  }

  if (res.results?.length) {
    webContext += res.results
      .map((r) => {
        const published = r.publishedDate
          ? `\nPUBLISHED: ${r.publishedDate}`
          : "";

        return `TITLE: ${r.title}
URL: ${r.url}${published}
CONTENT: ${r.content}`;
      })
      .join("\n\n");
  }

  return webContext;
}