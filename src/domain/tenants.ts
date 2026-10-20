import { eq, sql } from "drizzle-orm";
import { tenants } from "@/db/schema";
import type { Tx } from "@/db/client";
import type { BusinessCalendar } from "./sla";
import { notFound } from "./errors";

export async function getCalendar(tx: Tx, tenantId: string): Promise<BusinessCalendar> {
  const [t] = await tx.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!t) throw notFound("Tenant");
  return { utcOffsetMinutes: t.utcOffsetMinutes, workdays: t.workdays, startHour: t.workStartHour, endHour: t.workEndHour };
}

/** Atomically take the next ticket number for a tenant. */
export async function nextTicketNumber(tx: Tx, tenantId: string): Promise<number> {
  const rows = await tx.execute<{ n: number }>(
    sql`update tenants set next_ticket_number = next_ticket_number + 1 where id = ${tenantId} returning next_ticket_number - 1 as n`,
  );
  return Number(rows.rows[0]!.n);
}

/** Atomically take the next customer code, e.g. CUS-10442. */
export async function nextCustomerCode(tx: Tx, tenantId: string): Promise<{ code: string; number: number }> {
  const rows = await tx.execute<{ n: number }>(
    sql`update tenants set next_customer_number = next_customer_number + 1 where id = ${tenantId} returning next_customer_number - 1 as n`,
  );
  const n = Number(rows.rows[0]!.n);
  return { code: `CUS-${n}`, number: n };
}
