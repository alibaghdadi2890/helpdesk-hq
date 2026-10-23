// classify.ts: turn ticket text into a validated Classification.
// Chapter 1 · Setup step B: fill in classifyWithUsage(). Everything else here is ready.
import { z } from "zod";
import { llm, type Completion } from "./llm";
import { loadPrompt } from "./prompts";

export const Classification = z.object({
  category: z.enum(["billing", "bug", "account", "how_to", "feature_request", "other"]),
  urgency: z.enum(["low", "normal", "high", "urgent"]),
  product: z.string().min(1),
  sentiment: z.enum(["negative", "neutral", "positive"]),
});
export type Classification = z.infer<typeof Classification>;

/** The model replied, but not with a valid classification. */
export class InvalidModelOutputError extends Error {
  constructor(message: string, public completion: Completion) {
    super(message);
    this.name = "InvalidModelOutputError";
  }
}

/** The model hit maxTokens, so the JSON is cut off. */
export class TruncatedOutputError extends Error {
  constructor(public completion: Completion) {
    super(`Output truncated at ${completion.usage.outputTokens} tokens`);
    this.name = "TruncatedOutputError";
  }
}

export interface ClassifyOptions {
  temperature?: number;   // default 0
  promptVersion?: string; // default "classify.v1", read from prompts/classify.v1.md
  timeoutMs?: number;
}

export interface ClassifyResult {
  classification: Classification;
  completion: Completion; // keeps tokens and cost, even for the caller that only wants the fields
}

/** Classify one ticket's text. Throws InvalidModelOutputError or TruncatedOutputError. */
export async function classifyWithUsage(ticketText: string, opts: ClassifyOptions = {}): Promise<ClassifyResult> {
  // TODO: 1. call llm.complete with loadPrompt(opts.promptVersion ?? "classify.v1") as the system
  //          prompt, the ticket text as the user message, maxTokens 200, temperature opts.temperature ?? 0
  //       2. stopReason "max_tokens" → throw new TruncatedOutputError(completion)
  //       3. Classification.safeParse(parseJson(completion.text)); failure → throw InvalidModelOutputError
  //       4. return { classification, completion }
  void ticketText; void opts; void llm; void loadPrompt;
  throw new Error("TODO: write classifyWithUsage() in src/ai/classify.ts (Chapter 1, Setup step B)");
}

/** The short form the exercises use. */
export async function classify(ticketText: string, opts: ClassifyOptions = {}): Promise<Classification> {
  return (await classifyWithUsage(ticketText, opts)).classification;
}

/** Models sometimes wrap JSON in ```json fences even when told not to. Strip them, then parse. */
export function parseJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    return undefined;
  }
}
