// A fake model for tests: replace llm.complete so no real API call is ever made.
import { vi } from "vitest";
import { llm, LlmHttpError, type Completion } from "@/ai/llm";

/** A successful completion with sensible defaults. Override any field. */
export function completion(over: Partial<Completion> = {}): Completion {
  return {
    text: JSON.stringify({ category: "billing", urgency: "high", product: "Billing Portal", sentiment: "negative" }),
    stopReason: "end_turn",
    usage: { inputTokens: 400, outputTokens: 30 },
    costUsd: 0.00055,
    latencyMs: 5,
    model: "fake-model",
    ...over,
  };
}

/** Make llm.complete return (or throw) these, one per call, in order. */
export function fakeLlm(...steps: (Completion | Error)[]) {
  const spy = vi.spyOn(llm, "complete");
  for (const step of steps) {
    if (step instanceof Error) spy.mockRejectedValueOnce(step);
    else spy.mockResolvedValueOnce(step);
  }
  return spy;
}

export const httpError = (status: number) => new LlmHttpError(status, "fake error");

/** What fetch's AbortSignal.timeout() throws. */
export const timeoutError = () => new DOMException("The operation timed out.", "TimeoutError");
