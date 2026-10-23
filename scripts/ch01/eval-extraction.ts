// Exercise 1.4 · Structured extraction harness. This one is complete: you run it, you do not write it.
// Run:  npx tsx scripts/ch01/eval-extraction.ts
//       PROMPT=classify.v2 RUNS=3 npx tsx scripts/ch01/eval-extraction.ts
import "../env";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { classifyWithUsage, type Classification } from "../../src/ai/classify";

type Labelled = { id: string; text: string; expected: Classification };
const rows: Labelled[] = JSON.parse(readFileSync("data/labels/tickets-30.json", "utf8"));
const FIELDS = ["category", "urgency", "product", "sentiment"] as const;
const PROMPT = process.env.PROMPT ?? "classify.v1";
const RUNS = Number(process.env.RUNS ?? 1);

const norm = (s: string) => s.trim().toLowerCase();
const pct = (n: number, d: number) => `${((100 * n) / d).toFixed(1)}%`;

const runs: Record<string, string>[] = [];
const misses: string[] = [];
let totalCost = 0;

for (let run = 1; run <= RUNS; run++) {
  const hits = { parsed: 0, category: 0, urgency: 0, product: 0, sentiment: 0, exact: 0 };
  for (const row of rows) {
    try {
      const { classification: got, completion } = await classifyWithUsage(row.text, { promptVersion: PROMPT });
      totalCost += completion.costUsd;
      hits.parsed++;
      let allRight = true;
      for (const f of FIELDS) {
        if (norm(got[f]) === norm(row.expected[f])) hits[f]++;
        else {
          allRight = false;
          if (run === 1) misses.push(`${row.id}  ${f}: expected "${row.expected[f]}", got "${got[f]}"   | ${row.text}`);
        }
      }
      if (allRight) hits.exact++;
    } catch (err) {
      if (run === 1) misses.push(`${row.id}  could not parse: ${(err as Error).message.slice(0, 120)}`);
    }
  }
  runs.push(Object.fromEntries(Object.entries(hits).map(([k, v]) => [k, pct(v, rows.length)])));
  console.log(`run ${run}/${RUNS} done`);
}

console.log(`\nPrompt ${PROMPT}, ${rows.length} tickets, ${RUNS} run(s)`);
console.table(runs);
console.log(`Total cost: $${totalCost.toFixed(4)}`);
mkdirSync("results", { recursive: true });
writeFileSync(`results/extraction-misses-${PROMPT}.txt`, misses.join("\n") + "\n");
console.log(`Misses from run 1: results/extraction-misses-${PROMPT}.txt (${misses.length} lines)`);
