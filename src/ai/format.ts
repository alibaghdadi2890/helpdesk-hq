// Turn a ticket into compact Markdown for a prompt. Exercise 1.1 writes toMarkdown().

export interface PromptTicket {
  number: number;
  subject: string;
  customer: { name: string; plan: string };
  messages: { from: string; at: string | Date; body: string; internal: boolean }[];
}

/**
 * Exercise 1.1 · TODO. Return Markdown like this (skip internal messages):
 *
 *   # Ticket 1042: Charged twice for invoice INV-2026-0041
 *   Customer: Sara Haddad (priority plan)
 *
 *   ## Customer Sara Haddad, 2026-10-14 09:12
 *   Hi, I was charged twice ...
 *
 *   ## Agent Lina Saab, 2026-10-14 10:03
 *   Thanks Sara ...
 */
export function toMarkdown(t: PromptTicket): string {
  void t;
  throw new Error("TODO: write toMarkdown() in src/ai/format.ts (Exercise 1.1, step 2)");
}

/** Map a file from data/tickets/ (the full API export) to PromptTicket. Ready to use. */
export function fromExport(e: {
  number: number;
  subject: string;
  customer: { name: string; plan: string };
  messages: { created_at: string; internal: boolean; body: string; author: { type: string; name: string } }[];
}): PromptTicket {
  return {
    number: e.number,
    subject: e.subject,
    customer: { name: e.customer.name, plan: e.customer.plan },
    messages: e.messages.map((m) => ({
      from: m.author.type === "agent" ? `Agent ${m.author.name}` : m.author.type === "customer" ? `Customer ${m.author.name}` : "System",
      at: m.created_at,
      body: m.body,
      internal: m.internal,
    })),
  };
}
