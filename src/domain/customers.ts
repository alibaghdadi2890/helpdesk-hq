import { desc, eq } from "drizzle-orm";
import { customers, tickets } from "@/db/schema";
import type { Tx } from "@/db/client";
import { notFound } from "./errors";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A customer by id (uuid) or code (CUS-10442), with their five most recent tickets. */
export async function getCustomer(tx: Tx, ref: string) {
  const where = UUID.test(ref) ? eq(customers.id, ref)
    : /^CUS-\d+$/.test(ref) ? eq(customers.code, ref)
    : null;
  if (!where) throw notFound(`Customer ${ref}`);

  const [c] = await tx.select().from(customers).where(where);
  if (!c) throw notFound(`Customer ${ref}`);

  const recent = await tx.select({
    number: tickets.number, subject: tickets.subject, status: tickets.status, createdAt: tickets.createdAt,
  }).from(tickets).where(eq(tickets.customerId, c.id)).orderBy(desc(tickets.createdAt)).limit(5);

  return {
    id: c.id, code: c.code, name: c.name, email: c.email, language: c.language, plan: c.plan,
    createdAt: c.createdAt, recentTickets: recent,
  };
}
