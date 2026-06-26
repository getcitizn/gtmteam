import { readJson, writeJson } from "../storage.js";
import type { Metric } from "../types.js";

/**
 * Reads manually-recorded engagement numbers from data/metrics-input.json
 * (the user fills this in after posting, since Twitter/Reddit free tiers
 * don't reliably expose performance for arbitrary replies) and merges
 * them into data/metrics.json.
 */
export function runAnalyst(): Metric[] {
  const input = readJson<Omit<Metric, "recordedAt">[]>("metrics-input.json", []);
  if (input.length === 0) {
    console.log("[analyst] no new metrics in data/metrics-input.json");
    return [];
  }

  const existing = readJson<Metric[]>("metrics.json", []);
  const recordedAt = new Date().toISOString();
  const newMetrics = input.map((m) => ({ ...m, recordedAt }));

  writeJson("metrics.json", [...existing, ...newMetrics]);
  writeJson("metrics-input.json", []);
  console.log(`[analyst] recorded ${newMetrics.length} metric(s)`);
  return newMetrics;
}
