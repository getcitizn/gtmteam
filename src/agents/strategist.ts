import { readJson, writeJson } from "../storage.js";
import { loadMission, loadIcp, loadPlaybook } from "../config.js";
import { askJson } from "../llm.js";
import type { Lead } from "../types.js";

interface ScoreResult {
  engage: boolean;
  reasoning: string;
}

export async function runStrategist(): Promise<Lead[]> {
  const leads = readJson<Lead[]>("leads.json", []);
  const newLeads = leads.filter((l) => l.status === "new");
  if (newLeads.length === 0) {
    console.log("[strategist] no new leads to score");
    return [];
  }

  const system = [
    "You are the Strategist on a GTM agent team.",
    "Decide whether a lead is worth engaging with based on mission and ICP fit.",
    "## Mission\n" + loadMission(),
    "## ICP\n" + loadIcp(),
    "## Playbook (learnings from past performance)\n" + loadPlaybook(),
  ].join("\n\n");

  const scored: Lead[] = [];
  for (const lead of newLeads) {
    try {
      const result = await askJson<ScoreResult>(
        system,
        `Lead from ${lead.platform} by ${lead.author}:\n"""${lead.text}"""\n\n` +
          `Return JSON: {"engage": boolean, "reasoning": string}`
      );
      lead.status = result.engage ? "engage" : "skip";
      lead.strategistReasoning = result.reasoning;
    } catch (err) {
      console.error(`[strategist] failed to score lead ${lead.id}:`, err);
      lead.status = "skip";
      lead.strategistReasoning = "scoring failed; defaulted to skip";
    }
    scored.push(lead);
  }

  writeJson("leads.json", leads);
  const engaged = scored.filter((l) => l.status === "engage");
  console.log(`[strategist] scored ${scored.length}, ${engaged.length} marked engage`);
  return engaged;
}
