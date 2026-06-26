import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = join(__dirname, "..", "config");

function readConfig(filename: string): string {
  try {
    return readFileSync(join(CONFIG_DIR, filename), "utf-8");
  } catch {
    return "";
  }
}

export function loadMission(): string {
  return readConfig("mission.md");
}

export function loadVoice(): string {
  return readConfig("voice.md");
}

export function loadIcp(): string {
  return readConfig("icp.md");
}

export function loadPlaybook(): string {
  return readConfig("playbook.md");
}
