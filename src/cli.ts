import "dotenv/config";
import { readJson, writeJson } from "./storage.js";
import { runPipeline } from "./pipeline.js";
import { runPublisher } from "./agents/publisher.js";
import { runAnalyst } from "./agents/analyst.js";
import { runCoach } from "./agents/coach.js";
import type { Draft } from "./types.js";

const [, , command, ...args] = process.argv;

async function main(): Promise<void> {
  switch (command) {
    case "run":
      await runPipeline();
      break;

    case "review": {
      const drafts = readJson<Draft[]>("drafts.json", []);
      const pending = drafts.filter((d) => d.status === "pending_review");
      if (pending.length === 0) {
        console.log("No drafts pending review.");
        break;
      }
      for (const d of pending) {
        console.log(`\n[${d.id}] ${d.platform} — ${d.url}`);
        console.log(d.text);
        if (d.design?.needed) console.log(`(visual suggested: ${d.design.prompt})`);
      }
      console.log(
        `\n${pending.length} pending. Use "npm run approve -- <id>" or "npm run reject -- <id>".`
      );
      break;
    }

    case "approve":
    case "reject": {
      const id = args[0];
      if (!id) {
        console.error(`Usage: npm run ${command} -- <draft-id>`);
        process.exit(1);
      }
      const drafts = readJson<Draft[]>("drafts.json", []);
      const draft = drafts.find((d) => d.id === id);
      if (!draft) {
        console.error(`No draft found with id ${id}`);
        process.exit(1);
      }
      draft.status = command === "approve" ? "approved" : "rejected";
      writeJson("drafts.json", drafts);
      console.log(`Draft ${id} marked ${draft.status}.`);
      break;
    }

    case "publish":
      runPublisher();
      break;

    case "analyze":
      runAnalyst();
      break;

    case "coach":
      await runCoach();
      break;

    default:
      console.log(
        "Usage: tsx src/cli.ts <run|review|approve|reject|publish|analyze|coach>"
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
