import type { Lead } from "../types.js";

interface RedditChild {
  data: {
    id: string;
    permalink: string;
    author: string;
    title?: string;
    selftext?: string;
    body?: string;
    created_utc: number;
  };
}

/**
 * Searches Reddit's public search.json endpoint (no auth required, but
 * Reddit requires a descriptive User-Agent on all requests).
 */
export async function searchReddit(
  keywords: string[],
  subreddits: string[]
): Promise<Lead[]> {
  if (keywords.length === 0) return [];
  const userAgent = process.env.REDDIT_USER_AGENT ?? "gtmteam-radar/0.1";
  const query = keywords.join(" OR ");
  const scope = subreddits.length > 0 ? subreddits.join("+") : null;
  const base = scope
    ? `https://www.reddit.com/r/${scope}/search.json`
    : "https://www.reddit.com/search.json";

  const url = new URL(base);
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "new");
  url.searchParams.set("limit", "25");
  if (scope) url.searchParams.set("restrict_sr", "1");

  const res = await fetch(url, { headers: { "User-Agent": userAgent } });
  if (!res.ok) {
    throw new Error(`Reddit search failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { data?: { children?: RedditChild[] } };

  return (body.data?.children ?? []).map(({ data }) => ({
    id: `reddit:${data.id}`,
    platform: "reddit" as const,
    url: `https://reddit.com${data.permalink}`,
    author: data.author,
    text: [data.title, data.selftext ?? data.body].filter(Boolean).join("\n"),
    foundAt: new Date().toISOString(),
    status: "new" as const,
  }));
}
