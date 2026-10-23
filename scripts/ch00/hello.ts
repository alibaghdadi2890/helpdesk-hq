// Exercise 0.4 · Hello, model. Write this by hand: no SDK, no coding agent.
// Run it with `make hello` (or `npm run hello`), which loads .env.
//
// Requirements
// - Read data/tickets/ticket-1042.json and join its message bodies with blank lines.
// - Ask the model to summarise the ticket in one sentence, with max_tokens 200.
// - Print the reply, then one line: input tokens, output tokens, cost in dollars to six decimals.
// - On an HTTP error, print the status code only and exit non-zero. Never print request
//   headers: they contain your key.
import { messages } from "@/db/schema";
import "../env";
import { readFileSync } from "node:fs";

const ticket = JSON.parse(readFileSync("data/tickets/ticket-1042.json", "utf8"))
  .messages.map((m: { body: string }) => m.body)
  .join("\n\n");

const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
        "content-type": "application/json",
        "x-api-key": process.env.LLM_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
        model: process.env.LLM_MODEL,
        max_tokens: 200,
        messages: [{ role: "user", content: `Summarize this support ticket in one sentence: \n\n${ticket}`}],
    })
});

if(!res.ok) {
    console.error(`HTTP ${res.status}`);
    process.exit(1);
}

const data = await res.json();
const { input_tokens: inT, output_tokens: outT } = data.usage;
const cost = (inT * Number(process.env.PRICE_IN_PER_MTOK) + outT * Number(process.env.PRICE_OUT_PER_MTOK)) / 1e6;

console.log(data.content[1].text);
console.log(`${inT} in · ${outT} out · $${cost.toFixed(6)}`);