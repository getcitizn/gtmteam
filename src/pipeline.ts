import { runRadar } from "./agents/radar.js";
import { runStrategist } from "./agents/strategist.js";
import { runWriter } from "./agents/writer.js";
import { runDesigner } from "./agents/designer.js";
import { runPublisher } from "./agents/publisher.js";

export async function runPipeline(): Promise<void> {
  await runRadar();
  const engaged = await runStrategist();
  const drafts = await runWriter(engaged);
  await runDesigner(drafts);
  runPublisher();
}
