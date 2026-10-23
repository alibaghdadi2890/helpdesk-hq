// Exercise 1.2 · Temperature lab
// Run: npx tsx scripts/ch01/temperature-lab.ts        Quick test first: RUNS=2 npx tsx scripts/ch01/temperature-lab.ts
// Needs: Setup steps A and B (src/ai/llm.ts and src/ai/classify.ts).
import "../env";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { classify } from "../../src/ai/classify";

const RUNS = Number(process.env.RUNS ?? 20);
const TEMPERATURES = [0, 0.7, 1.0];
const tickets: { id: string; text: string }[] = JSON.parse(readFileSync("data/labels/ambiguous-10.json", "utf8"));

/**
 * Step 1 · TODO. The share of labels that match the most common one.
 *   agreement(["bug", "bug", "how_to", "bug"]) === 0.75
 */
export function agreement(labels: string[]): number {
  void labels;
  throw new Error("TODO: write agreement() in scripts/ch01/temperature-lab.ts (Exercise 1.2, step 1)");
}

// Checks agreement() before spending anything on model calls.
if (agreement(["bug", "bug", "how_to", "bug"]) !== 0.75 || agreement(["a", "b"]) !== 0.5) {
  console.log("agreement() is not right yet: agreement([\"bug\", \"bug\", \"how_to\", \"bug\"]) should be 0.75.");
  process.exit(1);
}

/** Run tasks with at most `limit` in flight, so you stay under your rate limit. Ready to use. */
async function pool<T>(tasks: (() => Promise<T>)[], limit = 4): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]!();
    }
  }));
  return results;
}

const rows = ["ticket_id,temperature,run,category"];
const labels = new Map<string, string[]>(); // key "A01@0.7" → the RUNS categories

for (const temperature of TEMPERATURES) {
  for (const t of tickets) {
    const results = await pool(Array.from({ length: RUNS }, () => () =>
      classify(t.text, { temperature }).then((c) => c.category).catch(() => "INVALID")));
    results.forEach((category, i) => rows.push(`${t.id},${temperature},${i + 1},${category}`));
    labels.set(`${t.id}@${temperature}`, results);
  }
  console.log(`temperature ${temperature}: done`);
}

mkdirSync("results", { recursive: true });
writeFileSync("results/temperature.csv", rows.join("\n") + "\n");
console.log(`\nSaved ${rows.length - 1} rows to results/temperature.csv\n`);

// Step 3 · TODO: print a table of agreement per ticket and temperature (console.table),
// then one line per temperature with the average agreement across the 10 tickets.
