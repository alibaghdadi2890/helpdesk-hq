// Exercise 0.4 · Hello, model. Write this by hand: no SDK, no coding agent.
// Run it with `make hello` (or `npm run hello`), which loads .env.
//
// Requirements
// - Read data/tickets/ticket-1042.json and join its message bodies with blank lines.
// - Ask the model to summarise the ticket in one sentence, with max_tokens 200.
// - Print the reply, then one line: input tokens, output tokens, cost in dollars to six decimals.
// - On an HTTP error, print the status code only and exit non-zero. Never print request
//   headers: they contain your key.
import "../env";
import { readFileSync } from "node:fs";

const ticket = JSON.parse(readFileSync("data/tickets/ticket-1042.json", "utf8"));

// 1. Join ticket.messages[].body with "\n\n".
// 2. POST to the Messages API with x-api-key, anthropic-version and a JSON body.
//    (OpenAI-compatible provider? Use /v1/chat/completions and an Authorization header.)
// 3. On !res.ok: console.error(`HTTP ${res.status}`) and process.exit(1).
// 4. Read data.usage.input_tokens and data.usage.output_tokens.
// 5. cost = (in * PRICE_IN_PER_MTOK + out * PRICE_OUT_PER_MTOK) / 1_000_000
// 6. Print the reply text and the usage line: "812 in · 31 out · $0.002901"

console.log(`TODO: summarise ticket #${ticket.number} (${ticket.messages.length} messages). See the comments in scripts/ch00/hello.ts.`);
