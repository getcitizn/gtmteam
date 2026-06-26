import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | undefined;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and fill it in."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function ask(system: string, prompt: string): Promise<string> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export async function askJson<T>(system: string, prompt: string): Promise<T> {
  const text = await ask(
    system,
    `${prompt}\n\nRespond with ONLY valid JSON, no markdown fences, no commentary.`
  );
  return JSON.parse(text) as T;
}
