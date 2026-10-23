// llm.ts: the only file in Helpdesk HQ that knows which model provider we use.
// Everything else calls llm.complete() with these types.
//
// Chapter 1 · Setup step A: fill in the three TODOs below. The course shows the full code
// in Lesson 1.5 and in the Setup section of the Exercises tab.

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface CompleteOptions {
  system?: string;
  messages: Message[];
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface Completion {
  text: string;
  stopReason: string; // "end_turn", "max_tokens", ...
  usage: { inputTokens: number; outputTokens: number };
  costUsd: number;
  latencyMs: number;
  model: string;
}

export class LlmHttpError extends Error {
  constructor(public status: number, body: string) {
    super(`LLM HTTP ${status}: ${body.slice(0, 200)}`);
    this.name = "LlmHttpError";
  }
}

/** Cost of one call, from the prices in .env (US dollars per million tokens). */
export function costOf(usage: { inputTokens: number; outputTokens: number }): number {
  // TODO 1: read PRICE_IN_PER_MTOK and PRICE_OUT_PER_MTOK from process.env (here, not at the
  // top of the file, so tests can change them) and return the cost in dollars.
  void usage;
  throw new Error("TODO: write costOf() in src/ai/llm.ts (Chapter 1, Setup step A)");
}

async function complete(o: CompleteOptions): Promise<Completion> {
  // TODO 2: POST to `${process.env.LLM_BASE_URL || "https://api.anthropic.com"}/v1/messages`
  // with the model, system, messages, max_tokens and temperature, and a timeout signal.
  // Throw LlmHttpError when !res.ok. Return text, stopReason, usage, costUsd, latencyMs, model.
  void o;
  throw new Error("TODO: write complete() in src/ai/llm.ts (Chapter 1, Setup step A)");
}

/** Retry rate limits, server errors and timeouts with exponential backoff. Never retry a 400. */
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  // TODO 3 (needed for the chapter task): copy withRetry from Lesson 1.5.
  void attempts;
  return fn();
}

// An object rather than bare functions, so tests can replace llm.complete with a fake.
export const llm = { complete };
