import { appendFileSync } from "fs";
import { join } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { readJson } from "../storage.js";
import { loadMission, loadIcp, loadVoice, loadPlaybook } from "../config.js";
import { ask } from "../llm.js";
import type { Draft, Lead, Metric, Post } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLAYBOOK_PATH = join(__dirname, "..", "..", "config", "playbook.md");

export async function runCoach(): Promise<string> {
  const leads = readJson<Lead[]>("leads.json", []);
  const drafts = readJson<Draft[]>("drafts.json", []);
  const posts = readJson<Post[]>("posts.json", []);
  const metrics = readJson<Metric[]>("metrics.json", []);

  if (metrics.length === 0) {
    console.log("[coach] no metrics yet, nothing to learn from");
    return "";
  }

  const system = [
    "You are the Coach on a GTM agent team.",
    "Compare past Strategist/Writer decisions against actual engagement metrics.",
    "Write 2-5 short, concrete, actionable bullet points the team should apply going forward.",
    "## Mission\n" + loadMission(),
    "## ICP\n" + loadIcp(),
    "## Voice\n" + loadVoice(),
    "## Existing playbook\n" + loadPlaybook(),
  ].join("\n\n");

  const prompt = [
    "Leads:",
    JSON.stringify(leads.slice(-50), null, 2),
    "Drafts:",
    JSON.stringify(drafts.slice(-50), null, 2),
    "Posts:",
    JSON.stringify(posts.slice(-50), null, 2),
    "Metrics:",
    JSON.stringify(metrics.slice(-50), null, 2),
    "",
    "Return only the bullet points (markdown list), no heading.",
  ].join("\n\n");

  const learnings = await ask(system, prompt);
  const date = new Date().toISOString().slice(0, 10);
  appendFileSync(PLAYBOOK_PATH, `\n## ${date}\n${learnings.trim()}\n`, "utf-8");
  console.log("[coach] appended learnings to config/playbook.md");
  return learnings;
}
