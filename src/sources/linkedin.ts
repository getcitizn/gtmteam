import type { Lead } from "../types.js";

/**
 * LinkedIn has no public search API suitable for prospecting, and
 * scraping LinkedIn violates its terms of service. This adapter is a
 * documented stub: it always returns no leads. If/when the team has
 * partner-level API access (e.g. via the Marketing Developer Platform)
 * or a manual export of relevant posts, wire that source in here.
 */
export async function searchLinkedin(_keywords: string[]): Promise<Lead[]> {
  return [];
}
