import { readJson, writeJson } from "../storage.js";
import { askJson } from "../llm.js";
import type { Draft, DesignSpec } from "../types.js";

/**
 * Decides whether a draft would benefit from an accompanying visual.
 * Does not call an image-generation API (none is configured); it just
 * produces a spec/prompt a human (or a future image-gen step) can use.
 */
export async function runDesigner(drafts: Draft[]): Promise<Draft[]> {
  if (drafts.length === 0) {
    console.log("[designer] no drafts to review");
    return [];
  }

  const system =
    "You are the Designer on a GTM agent team. For a given social reply, " +
    "decide if a visual (chart, screenshot, meme, diagram) would meaningfully " +
    "increase engagement. Most short replies do not need one.";

  const allDrafts = readJson<Draft[]>("drafts.json", []);
  const byId = new Map(allDrafts.map((d) => [d.id, d]));

  for (const draft of drafts) {
    try {
      const spec = await askJson<DesignSpec>(
        system,
        `Reply text:\n"""${draft.text}"""\n\n` +
          `Return JSON: {"needed": boolean, "prompt": string (image prompt if needed, else ""), ` +
          `"rationale": string}`
      );
      draft.design = spec;
      const stored = byId.get(draft.id);
      if (stored) stored.design = spec;
    } catch (err) {
      console.error(`[designer] failed to evaluate draft ${draft.id}:`, err);
    }
  }

  writeJson("drafts.json", allDrafts);
  const needed = drafts.filter((d) => d.design?.needed).length;
  console.log(`[designer] reviewed ${drafts.length}, ${needed} flagged for a visual`);
  return drafts;
}
