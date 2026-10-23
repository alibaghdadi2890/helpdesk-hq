import { and, asc, count, desc, eq, ilike, inArray, type SQL } from "drizzle-orm";
import { z } from "zod";
import { CHANNELS, customers, messages, products, slaPolicies, teams, tenants, TICKET_PRIORITIES, TICKET_STATUSES, tickets, users, type TicketStatus } from "@/db/schema";
import { getDb, type Tx } from "@/db/client";
import { withTenant } from "@/db/tenant";
import { badRequest, notFound } from "./errors";
import { addBusinessMinutes, businessMinutesBetween, slaState } from "./sla";
import { assertTransition } from "./status";
import { getCalendar, nextCustomerCode, nextTicketNumber } from "./tenants";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A ticket can be referenced by its number (1042) or its id (uuid). */
export function ticketRef(ref: string): SQL {
  if (/^\d{1,9}$/.test(ref)) return eq(tickets.number, Number(ref));
  if (UUID.test(ref)) return eq(tickets.id, ref);
  throw notFound(`Ticket ${ref}`);
}

// ---------------------------------------------------------------- list

export const ListTicketsQuery = z.object({
  status: z.string().optional().transform((s) => (s ? s.split(",") : undefined))
    .pipe(z.array(z.enum(TICKET_STATUSES)).optional()),
  priority: z.string().optional().transform((s) => (s ? s.split(",") : undefined))
    .pipe(z.array(z.enum(TICKET_PRIORITIES)).optional()),
  team: z.uuid().optional(),
  assignee: z.uuid().optional(),
  customer: z.uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export type ListTicketsQuery = z.infer<typeof ListTicketsQuery>;

export async function listTickets(tx: Tx, f: ListTicketsQuery) {
  const where = and(
    f.status ? inArray(tickets.status, f.status) : undefined,
    f.priority ? inArray(tickets.priority, f.priority) : undefined,
    f.team ? eq(tickets.teamId, f.team) : undefined,
    f.assignee ? eq(tickets.assigneeId, f.assignee) : undefined,
    f.customer ? eq(tickets.customerId, f.customer) : undefined,
    f.q ? ilike(tickets.subject, `%${f.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`) : undefined,
  );

  const rows = await tx
    .select({
      id: tickets.id, number: tickets.number, subject: tickets.subject, status: tickets.status,
      priority: tickets.priority, channel: tickets.channel, language: tickets.language, createdAt: tickets.createdAt,
      firstResponseDueAt: tickets.firstResponseDueAt, firstResponseAt: tickets.firstResponseAt,
      resolutionDueAt: tickets.resolutionDueAt, solvedAt: tickets.solvedAt, pendingSince: tickets.pendingSince,
      product: products.name, team: teams.name, assignee: users.name,
      customerCode: customers.code, customerName: customers.name,
    })
    .from(tickets)
    .innerJoin(customers, eq(customers.id, tickets.customerId))
    .leftJoin(products, eq(products.id, tickets.productId))
    .leftJoin(teams, eq(teams.id, tickets.teamId))
    .leftJoin(users, eq(users.id, tickets.assigneeId))
    .where(where)
    .orderBy(desc(tickets.createdAt))
    .limit(f.pageSize)
    .offset((f.page - 1) * f.pageSize);

  const [{ total } = { total: 0 }] = await tx.select({ total: count() }).from(tickets).where(where);
  const now = new Date();

  return {
    items: rows.map((r) => {
      const sla = slaState(r, now);
      return {
        id: r.id, number: r.number, subject: r.subject, status: r.status, priority: r.priority, channel: r.channel,
        language: r.language, product: r.product, team: r.team, assignee: r.assignee,
        customer: { code: r.customerCode, name: r.customerName },
        createdAt: r.createdAt,
        slaBreached: { firstResponse: sla.firstResponse.breached, resolution: sla.resolution.breached },
      };
    }),
    page: f.page,
    pageSize: f.pageSize,
    total,
  };
}

// ---------------------------------------------------------------- get

export async function getTicket(tx: Tx, ref: string) {
  const [r] = await tx
    .select({ t: tickets, customer: customers, product: products.name, team: teams.name, assignee: users.name, policy: slaPolicies.name })
    .from(tickets)
    .innerJoin(customers, eq(customers.id, tickets.customerId))
    .innerJoin(slaPolicies, eq(slaPolicies.id, tickets.slaPolicyId))
    .leftJoin(products, eq(products.id, tickets.productId))
    .leftJoin(teams, eq(teams.id, tickets.teamId))
    .leftJoin(users, eq(users.id, tickets.assigneeId))
    .where(ticketRef(ref));
  if (!r) throw notFound(`Ticket ${ref}`);

  const [{ n } = { n: 0 }] = await tx.select({ n: count() }).from(messages).where(eq(messages.ticketId, r.t.id));
  return {
    id: r.t.id, number: r.t.number, subject: r.t.subject, status: r.t.status, priority: r.t.priority, channel: r.t.channel,
    language: r.t.language, product: r.product, team: r.team, teamId: r.t.teamId,
    assignee: r.assignee, assigneeId: r.t.assigneeId,
    customer: { id: r.customer.id, code: r.customer.code, name: r.customer.name, email: r.customer.email, plan: r.customer.plan, language: r.customer.language },
    slaPolicy: r.policy,
    sla: slaState(r.t),
    messageCount: n,
    createdAt: r.t.createdAt,
    updatedAt: r.t.updatedAt,
  };
}

async function loadTicketRow(tx: Tx, ref: string) {
  const [t] = await tx.select().from(tickets).where(ticketRef(ref));
  if (!t) throw notFound(`Ticket ${ref}`);
  return t;
}

// ---------------------------------------------------------------- create

export const CreateTicketBody = z.object({
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10_000),
  customerEmail: z.email(),
  customerName: z.string().trim().min(1).max(120).optional(),
  channel: z.enum(CHANNELS),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  productId: z.uuid().optional(),
  language: z.string().regex(/^[a-z]{2}$/).optional(),
});
export type CreateTicketBody = z.infer<typeof CreateTicketBody>;

export async function createTicket(tx: Tx, tenantId: string, input: CreateTicketBody, now = new Date()) {
  const email = input.customerEmail.toLowerCase();
  let [customer] = await tx.select().from(customers).where(eq(customers.email, email));
  if (!customer) {
    const { code } = await nextCustomerCode(tx, tenantId);
    [customer] = await tx.insert(customers).values({
      tenantId, code, email,
      name: input.customerName ?? email.split("@")[0]!,
      language: input.language ?? "en",
    }).returning();
  }
  if (!customer) throw new Error("customer insert failed");

  if (input.productId) {
    const [p] = await tx.select({ id: products.id }).from(products).where(eq(products.id, input.productId));
    if (!p) throw badRequest("Unknown product.", [{ field: "productId", message: "No such product in this company." }]);
  }

  const [policy] = await tx.select().from(slaPolicies).where(eq(slaPolicies.plan, customer.plan));
  if (!policy) throw new Error(`No SLA policy for plan ${customer.plan}`);
  const cal = await getCalendar(tx, tenantId);
  const number = await nextTicketNumber(tx, tenantId);

  const [ticket] = await tx.insert(tickets).values({
    tenantId, number, subject: input.subject, channel: input.channel, priority: input.priority,
    language: input.language ?? customer.language,
    customerId: customer.id, productId: input.productId ?? null, slaPolicyId: policy.id,
    firstResponseDueAt: addBusinessMinutes(now, policy.firstResponseMins, cal),
    resolutionDueAt: addBusinessMinutes(now, policy.resolutionMins, cal),
    createdAt: now, updatedAt: now,
  }).returning();
  if (!ticket) throw new Error("ticket insert failed");

  await tx.insert(messages).values({
    tenantId, ticketId: ticket.id, authorType: "customer", body: input.body, createdAt: now,
  });
  return getTicket(tx, ticket.id);
}

// ---------------------------------------------------------------- update

export const UpdateTicketBody = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  teamId: z.uuid().nullable().optional(),
  assigneeId: z.uuid().nullable().optional(),
}).refine((b) => Object.keys(b).length > 0, { message: "Send at least one of status, priority, teamId or assigneeId." });
export type UpdateTicketBody = z.infer<typeof UpdateTicketBody>;

export async function updateTicket(tx: Tx, tenantId: string, ref: string, input: UpdateTicketBody, now = new Date()) {
  const t = await loadTicketRow(tx, ref);
  const patch: Partial<typeof tickets.$inferInsert> = { updatedAt: now };

  if (input.priority) patch.priority = input.priority;
  if (input.teamId !== undefined) {
    if (input.teamId) {
      const [team] = await tx.select({ id: teams.id }).from(teams).where(eq(teams.id, input.teamId));
      if (!team) throw badRequest("Unknown team.", [{ field: "teamId", message: "No such team in this company." }]);
    }
    patch.teamId = input.teamId;
  }
  if (input.assigneeId !== undefined) {
    if (input.assigneeId) {
      const [u] = await tx.select({ id: users.id }).from(users).where(eq(users.id, input.assigneeId));
      if (!u) throw badRequest("Unknown user.", [{ field: "assigneeId", message: "No such user in this company." }]);
    }
    patch.assigneeId = input.assigneeId;
  }
  if (input.status && input.status !== t.status) {
    assertTransition(t.status, input.status);
    Object.assign(patch, await statusEffects(tx, tenantId, t, input.status, now));
  }

  await tx.update(tickets).set(patch).where(eq(tickets.id, t.id));
  return getTicket(tx, t.id);
}

/** Side effects of a status change: the pending pause, solved time, reopening. */
async function statusEffects(tx: Tx, tenantId: string, t: typeof tickets.$inferSelect, to: TicketStatus, now: Date) {
  const patch: Partial<typeof tickets.$inferInsert> = { status: to };
  if (t.status === "pending" && t.pendingSince) {
    // Leaving pending: push the resolution target back by the business time spent waiting.
    const cal = await getCalendar(tx, tenantId);
    const paused = businessMinutesBetween(t.pendingSince, now, cal);
    patch.resolutionDueAt = addBusinessMinutes(t.resolutionDueAt, paused, cal);
    patch.pendingSince = null;
  }
  if (to === "pending") patch.pendingSince = now;
  if (to === "solved") patch.solvedAt = now;
  if (t.status === "solved" && to === "open") patch.solvedAt = null;
  return patch;
}

// ---------------------------------------------------------------- messages

export async function listMessages(tx: Tx, ref: string, opts: { includeInternal: boolean }) {
  const t = await loadTicketRow(tx, ref);
  const rows = await tx.select({
    id: messages.id, authorType: messages.authorType, authorId: messages.authorId, author: users.name,
    body: messages.body, internal: messages.internal, createdAt: messages.createdAt,
  })
    .from(messages)
    .leftJoin(users, eq(users.id, messages.authorId))
    .where(and(eq(messages.ticketId, t.id), opts.includeInternal ? undefined : eq(messages.internal, false)))
    .orderBy(asc(messages.createdAt));
  return { ticketId: t.id, number: t.number, messages: rows };
}

export const AddMessageBody = z.object({
  body: z.string().trim().min(1).max(10_000),
  internal: z.boolean().default(false),
  // Development only: simulate an inbound customer email.
  authorType: z.enum(["agent", "customer"]).default("agent"),
});
export type AddMessageBody = z.infer<typeof AddMessageBody>;

export async function addMessage(tx: Tx, tenantId: string, ref: string, input: AddMessageBody, authorId: string | null, now = new Date()) {
  const t = await loadTicketRow(tx, ref);
  if (t.status === "closed") throw badRequest("This ticket is closed. Create a new ticket instead.");
  if (input.authorType === "customer" && input.internal) throw badRequest("Customers cannot write internal notes.");

  const [m] = await tx.insert(messages).values({
    tenantId, ticketId: t.id, authorType: input.authorType,
    authorId: input.authorType === "agent" ? authorId : null,
    body: input.body, internal: input.internal, createdAt: now,
  }).returning();

  const patch: Partial<typeof tickets.$inferInsert> = { updatedAt: now };
  if (input.authorType === "agent" && !input.internal) {
    if (!t.firstResponseAt) patch.firstResponseAt = now;
    if (t.status === "new") patch.status = "open";
  }
  if (input.authorType === "customer" && (t.status === "solved" || t.status === "pending")) {
    Object.assign(patch, await statusEffects(tx, tenantId, t, "open", now)); // a customer reply reopens
  }
  await tx.update(tickets).set(patch).where(eq(tickets.id, t.id));
  return m;
}

// ---------------------------------------------------------------- for agents (Chapter 3)

/** A compact view of one ticket for an AI agent: no internal notes, no internal ids. */
export async function getTicketForAgent(tenantSlug: string, number: number) {
  const [tenant] = await getDb()
    .select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, tenantSlug));
  if (!tenant) return null;
  return withTenant(tenant.id, async (tx) => {
    try {
      const t = await getTicket(tx, String(number));
      const { messages: thread } = await listMessages(tx, String(number), { includeInternal: false });
      return {
        number: t.number, subject: t.subject, status: t.status, product: t.product, language: t.language,
        channel: t.channel, customer: { code: t.customer.code, name: t.customer.name, plan: t.customer.plan },
        sla: { firstResponseBreached: t.sla.firstResponse.breached, resolutionBreached: t.sla.resolution.breached },
        thread: thread.map((m) => ({ at: m.createdAt, from: m.authorType, body: m.body })),
      };
    } catch {
      return null;
    }
  });
}

