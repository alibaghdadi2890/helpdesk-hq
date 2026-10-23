// Exercise 1.3 · Chat loop
// Run: npx tsx scripts/ch01/chat.ts          With a small cap: CHAT_TOKEN_CAP=2000 npx tsx scripts/ch01/chat.ts
// Needs: Setup step A (src/ai/llm.ts).
import "../env";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { llm, type Message } from "../../src/ai/llm";

const CAP = Number(process.env.CHAT_TOKEN_CAP ?? 20_000);
const SYSTEM = "You are a helpful support engineer for Helpdesk HQ. Be concise.";

const rl = readline.createInterface({ input, output });
let history: Message[] = [];
let used = 0; // input + output tokens so far
let cost = 0; // dollars so far

console.log(`Chat started. Token cap: ${CAP}. Commands: /reset, /exit`);
rl.setPrompt("you › ");
rl.prompt();

// Each loop turn is one line you typed. The loop also ends cleanly on Ctrl+D.
for await (const raw of rl) {
  const line = raw.trim();
  // Step 2 · TODO: /exit leaves the loop; /reset empties history.
  // Step 4 · TODO: when used >= CAP, print a message and do not call the model.
  if (line) await send(line);
  rl.prompt();
}
rl.close();
console.log(`\nSession total: ${used} tokens, $${cost.toFixed(4)}`);

async function send(line: string) {
  // Step 1 · TODO: push the user message, call llm.complete with the WHOLE history,
  //                push the assistant reply, print it.
  // Step 3 · TODO: add the usage to `used` and `cost`, and print one usage line:
  //                [412 in · 38 out · 450/20000 tokens · $0.0012]
  // Step 5 · TODO: if the call throws, remove the unanswered user message from history.
  void line; void history; void llm; void SYSTEM;
  console.log("TODO: write send() in scripts/ch01/chat.ts");
}
