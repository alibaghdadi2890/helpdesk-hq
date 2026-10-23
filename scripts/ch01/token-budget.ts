// Exercise 1.1 · Token budget
// Run: npx tsx scripts/ch01/token-budget.ts
// Needs: Setup step A (src/ai/llm.ts) and toMarkdown() in src/ai/format.ts.
import "../env";
import { readFileSync } from "node:fs";
import { fromExport, toMarkdown } from "../../src/ai/format";
import { llm } from "../../src/ai/llm";

const SYSTEM = "You read support tickets.";
const IDS = [1042, 1105, 1188, 1311, 2207];

/** How many input tokens does this text cost? maxTokens 1 makes the call almost free. */
async function inputTokens(content: string): Promise<number> {
  const res = await llm.complete({ system: SYSTEM, messages: [{ role: "user", content }], maxTokens: 1 });
  return res.usage.inputTokens;
}

// The system prompt and message wrapper cost tokens on every call. Measure them once and subtract.
const baseline = await inputTokens(".");
console.log(`Baseline (system prompt + wrapper): ${baseline} tokens\n`);

const table: Record<string, { prettyJson: number; minJson: number; markdown: number }> = {};
const totals = { prettyJson: 0, minJson: 0, markdown: 0 };

for (const id of IDS) {
  const ticket = JSON.parse(readFileSync(`data/tickets/ticket-${id}.json`, "utf8"));
  const formats = {
    prettyJson: JSON.stringify(ticket, null, 2),
    minJson: JSON.stringify(ticket),
    markdown: toMarkdown(fromExport(ticket)),
  };
  const row = { prettyJson: 0, minJson: 0, markdown: 0 };
  for (const [name, text] of Object.entries(formats) as [keyof typeof row, string][]) {
    row[name] = (await inputTokens(text)) - baseline;
    totals[name] += row[name];
  }
  table[`ticket-${id}`] = row;
}
console.table(table);

// Step 4 · TODO: print the cost of sending 10,000 tickets in each format.
//   average tokens per ticket = totals[name] / IDS.length
//   cost = average × 10,000 × PRICE_IN_PER_MTOK / 1,000,000
