import { randomUUID } from "crypto";
import { readJson, writeJson } from "../storage.js";
import { loadMission, loadVoice, loadPlaybook } from "../config.js";
import { ask } from "../llm.js";
import type { Draft, Lead } from "../types.js";

export async function runWriter(leads: Lead[]): Promise<Draft[]> {
  if (leads.length === 0) {
    console.log("[writer] no leads to draft replies for");
    return [];
  }

  const system = [
    "You are the Writer on a GTM agent team.",
    "Draft a short, genuine reply to the lead below in the team's voice.",
    "Do not be salesy or use marketing-speak. Sound like a helpful human.",
    "## Mission\n" + loadMission(),
    "## Voice\n" + loadVoice(),
    "## Playbook (learnings from past performance)\n" + loadPlaybook(),
  ].join("\n\n");

  const drafts = readJson<Draft[]>("drafts.json", []);
  const newDrafts: Draft[] = [];

  for (const lead of leads) {
    try {
      const text = await ask(
        system,
        `Lead from ${lead.platform} by ${lead.author}:\n"""${lead.text}"""\n\n` +
          `Strategist reasoning for engaging: ${lead.strategistReasoning ?? "n/a"}\n\n` +
          `Write only the reply text, nothing else.`
      );
      const draft: Draft = {
        id: randomUUID(),
        leadId: lead.id,
        platform: lead.platform,
        url: lead.url,
        text: text.trim(),
        status: "pending_review",
        createdAt: new Date().toISOString(),
      };
      drafts.push(draft);
      newDrafts.push(draft);
    } catch (err) {
      console.error(`[writer] failed to draft reply for lead ${lead.id}:`, err);
    }
  }

  writeJson("drafts.json", drafts);
  console.log(`[writer] created ${newDrafts.length} draft(s)`);
  return newDrafts;
}
