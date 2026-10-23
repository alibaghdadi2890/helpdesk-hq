// Chapter 1 · checks your Setup steps A and B with two tiny model calls (well under one cent).
// Run: npx tsx scripts/ch01/check-setup.ts
import "../env";
import { classifyWithUsage } from "../../src/ai/classify";
import { llm } from "../../src/ai/llm";

const missing = ["LLM_API_KEY", "LLM_MODEL", "PRICE_IN_PER_MTOK", "PRICE_OUT_PER_MTOK"].filter((k) => !process.env[k]);
if (missing.length) {
  console.log(`✗ .env is missing: ${missing.join(", ")}. Fill them in (Exercise 0.3) and run this again.`);
  process.exit(1);
}

console.log("Step A · llm.complete()");
try {
  const res = await llm.complete({ messages: [{ role: "user", content: "Reply with exactly: hello from the model" }], maxTokens: 20 });
  console.log(`  ✓ reply: ${JSON.stringify(res.text)}`);
  console.log(`  ✓ stopReason: ${res.stopReason} · ${res.usage.inputTokens} in · ${res.usage.outputTokens} out · $${res.costUsd.toFixed(6)} · ${res.latencyMs} ms`);
  if (!res.costUsd) console.log("  ! costUsd is 0: check costOf() and the PRICE_ values in .env");
} catch (err) {
  console.log(`  ✗ ${(err as Error).message}`);
  process.exit(1);
}

console.log("Step B · classifyWithUsage()");
try {
  const { classification, completion } = await classifyWithUsage("I was charged twice for invoice INV-2026-0041 in the Billing Portal. Please fix this.");
  console.log(`  ✓ ${JSON.stringify(classification)}`);
  console.log(`  ✓ ${completion.usage.inputTokens} in · ${completion.usage.outputTokens} out · $${completion.costUsd.toFixed(6)}`);
} catch (err) {
  console.log(`  ✗ ${(err as Error).name}: ${(err as Error).message}`);
  process.exit(1);
}
console.log("\nSetup complete. Start Exercise 1.1.");
