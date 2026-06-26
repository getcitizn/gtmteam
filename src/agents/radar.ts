import { readJson, writeJson } from "../storage.js";
import { loadIcp } from "../config.js";
import { searchTwitter } from "../sources/twitter.js";
import { searchReddit } from "../sources/reddit.js";
import { searchLinkedin } from "../sources/linkedin.js";
import type { Lead } from "../types.js";

function parseListField(icp: string, label: string): string[] {
  const line = icp
    .split("\n")
    .find((l) => l.trim().toLowerCase().startsWith(`- ${label.toLowerCase()}`));
  if (!line) return [];
  const value = line.split(":").slice(1).join(":").trim();
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function runRadar(): Promise<Lead[]> {
  const icp = loadIcp();
  const twitterKeywords = parseListField(icp, "Keywords to search (Twitter)");
  const subreddits = parseListField(icp, "Subreddits to search (Reddit)");

  const [twitterLeads, redditLeads, linkedinLeads] = await Promise.all([
    searchTwitter(twitterKeywords).catch((err) => {
      console.error("[radar] twitter search failed:", err.message);
      return [];
    }),
    searchReddit(twitterKeywords, subreddits).catch((err) => {
      console.error("[radar] reddit search failed:", err.message);
      return [];
    }),
    searchLinkedin(twitterKeywords),
  ]);

  const existing = readJson<Lead[]>("leads.json", []);
  const existingIds = new Set(existing.map((l) => l.id));
  const fresh = [...twitterLeads, ...redditLeads, ...linkedinLeads].filter(
    (l) => !existingIds.has(l.id)
  );

  const updated = [...existing, ...fresh];
  writeJson("leads.json", updated);
  console.log(`[radar] found ${fresh.length} new lead(s)`);
  return fresh;
}
