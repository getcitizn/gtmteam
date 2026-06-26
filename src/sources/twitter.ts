import type { Lead } from "../types.js";

/**
 * Searches recent tweets via Twitter/X API v2 recent search endpoint.
 * Requires TWITTER_BEARER_TOKEN (app-only auth is sufficient).
 */
export async function searchTwitter(keywords: string[]): Promise<Lead[]> {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token || keywords.length === 0) return [];

  const query = keywords.map((k) => `"${k}"`).join(" OR ") + " -is:retweet";
  const url = new URL("https://api.twitter.com/2/tweets/search/recent");
  url.searchParams.set("query", query);
  url.searchParams.set("max_results", "25");
  url.searchParams.set("tweet.fields", "author_id,created_at");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Twitter search failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as {
    data?: { id: string; text: string; author_id: string; created_at: string }[];
  };

  return (body.data ?? []).map((tweet) => ({
    id: `twitter:${tweet.id}`,
    platform: "twitter" as const,
    url: `https://twitter.com/i/web/status/${tweet.id}`,
    author: tweet.author_id,
    text: tweet.text,
    foundAt: new Date().toISOString(),
    status: "new" as const,
  }));
}
