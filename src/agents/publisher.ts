import { writeFileSync } from "fs";
import { join } from "path";
import { readJson, writeJson, DATA_DIR } from "../storage.js";
import type { Draft } from "../types.js";

/**
 * Renders approved drafts into a human-readable markdown queue. Does
 * NOT call any platform posting API — the user copies/pastes these
 * manually, by design (see plan: approval queue, no auto-post).
 */
export function runPublisher(): Draft[] {
  const drafts = readJson<Draft[]>("drafts.json", []);
  const approved = drafts.filter((d) => d.status === "approved");

  const lines = [
    "# Ready to Post",
    "",
    `Generated ${new Date().toISOString()}`,
    "",
  ];

  for (const draft of approved) {
    lines.push(`## ${draft.platform} — ${draft.url}`);
    lines.push("");
    lines.push(draft.text);
    if (draft.design?.needed) {
      lines.push("");
      lines.push(`> Suggested visual: ${draft.design.prompt}`);
    }
    lines.push("");
    draft.status = "ready_to_post";
  }

  if (approved.length === 0) {
    lines.push("_No approved drafts right now. Run `npm run review` to triage._");
  }

  writeFileSync(join(DATA_DIR, "ready-to-post.md"), lines.join("\n") + "\n", "utf-8");
  writeJson("drafts.json", drafts);
  console.log(`[publisher] wrote ${approved.length} approved draft(s) to data/ready-to-post.md`);
  return approved;
}
