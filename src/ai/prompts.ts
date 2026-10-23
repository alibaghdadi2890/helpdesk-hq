import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Load a prompt by version id, e.g. "classify.v1" reads prompts/classify.v1.md. */
export function loadPrompt(id: string): string {
  return readFileSync(join(process.cwd(), "prompts", `${id}.md`), "utf8").trim();
}
