// Close tickets that have been solved for at least 7 days (npm run jobs:close-solved).
// Runs as helpdesk_app, one tenant at a time through withTenant, like the API does.
// Chapter 5 turns this into a scheduled job; Chapter 8 adds tracing to it.
import "../env";
import { and, eq, lte } from "drizzle-orm";
import { closeDb, getDb } from "../../src/db/client";
import { tenants, tickets } from "../../src/db/schema";
import { withTenant } from "../../src/db/tenant";

const DAYS = Number(process.env.CLOSE_AFTER_DAYS ?? 7);

async function main() {
  const cutoff = new Date(Date.now() - DAYS * 24 * 3_600_000);
  const all = await getDb().select({ id: tenants.id, slug: tenants.slug }).from(tenants);
  let total = 0;

  for (const t of all) {
    const closed = await withTenant(t.id, (tx) =>
      tx.update(tickets)
        .set({ status: "closed", updatedAt: new Date() })
        .where(and(eq(tickets.status, "solved"), lte(tickets.solvedAt, cutoff)))
        .returning({ number: tickets.number }),
    );
    total += closed.length;
    console.log(`${t.slug.padEnd(12)} closed ${closed.length}`);
  }
  console.log(`total        closed ${total} (solved before ${cutoff.toISOString()})`);
}

main()
  .catch((err) => { console.error(err); process.exitCode = 1; })
  .finally(closeDb);
