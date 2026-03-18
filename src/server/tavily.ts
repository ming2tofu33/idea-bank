import { tavily } from "@tavily/core";

const client = tavily({ apiKey: process.env.TAVILY_API_KEY! });

export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

/**
 * 아이디어 관련 경쟁사 + 시장 데이터를 검색하여 반환.
 * 3개 검색 쿼리를 병렬로 실행: 경쟁사, 시장 규모, 트렌드
 */
export async function searchForReport(idea: {
  title: string;
  summary: string;
  keywords_used: string[];
}): Promise<{
  competitors: SearchResult[];
  market: SearchResult[];
  trends: SearchResult[];
}> {
  const keywordsStr = idea.keywords_used.join(" ");
  const topic = `${idea.title} ${idea.summary}`;

  const [competitorRes, marketRes, trendRes] = await Promise.all([
    client.search(`${topic} competitor alternative service app`, {
      maxResults: 5,
      topic: "general",
    }),
    client.search(`${keywordsStr} market size TAM growth rate 2024 2025`, {
      maxResults: 3,
      topic: "news",
    }),
    client.search(`${keywordsStr} trend startup recent`, {
      maxResults: 3,
      topic: "news",
    }),
  ]);

  return {
    competitors: competitorRes.results.map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
    })),
    market: marketRes.results.map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
    })),
    trends: trendRes.results.map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
    })),
  };
}
