// Deterministic seed: same tickets, ids and text for every learner (random seed 42).
// Timestamps are relative to the moment you seed, so some open tickets always breach SLA.
// Runs as the table owner (MIGRATION_DATABASE_URL), which bypasses row-level security.
import { pathToFileURL } from "node:url";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { requireEnv } from "../env";
import * as s from "../../src/db/schema";
import { addBusinessMinutes, type BusinessCalendar } from "../../src/domain/sla";
import { ANCHOR_CUSTOMERS, ANCHOR_TICKETS, type AnchorTicket } from "../seed/anchors";
import { AGENT_REPLIES, CUSTOMER_FOLLOWUPS, FEATURES, FIRST_NAMES, INTERNAL_NOTES, LAST_NAMES, SCENARIOS } from "../seed/content";
import { CORE_ARTICLES, generateArticles } from "../seed/kb";
import { fill, Rng } from "../seed/random";
import { TENANTS, type Plan, type TenantSeed } from "../seed/tenants";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const CUSTOMER_BASE: Record<TenantSeed["slug"], number> = { hq: 10001, "cedar-bank": 20001, "souk-market": 30001 };
const EMAIL_DOMAINS = ["mail.test", "inbox.test", "post.test", "example.test"];

type Db = ReturnType<typeof drizzle<typeof s>>;

async function insertChunks<T extends Record<string, unknown>>(db: Db, table: Parameters<Db["insert"]>[0], rows: T[]) {
  for (let i = 0; i < rows.length; i += 500) {
    await db.insert(table).values(rows.slice(i, i + 500) as never);
  }
}

export async function seed(url = requireEnv("MIGRATION_DATABASE_URL"), now = new Date()): Promise<Record<string, number>> {
  const pool = new pg.Pool({ connectionString: url, max: 4 });
  const db = drizzle(pool, { schema: s });
  const rng = new Rng(42);
  const counts: Record<string, number> = { tenants: 0, users: 0, customers: 0, tickets: 0, messages: 0, articles: 0 };

  try {
    await db.execute(sql`truncate tenants, users, teams, team_members, customers, products, sla_policies, tickets, messages, kb_articles cascade`);

    for (const t of TENANTS) {
      const tenantId = rng.uuid();
      const cal: BusinessCalendar = { utcOffsetMinutes: t.utcOffsetMinutes, workdays: t.workdays, startHour: t.workStartHour, endHour: t.workEndHour };
      await db.insert(s.tenants).values({
        id: tenantId, slug: t.slug, name: t.name, utcOffsetMinutes: t.utcOffsetMinutes, workdays: t.workdays,
        workStartHour: t.workStartHour, workEndHour: t.workEndHour,
        nextTicketNumber: t.firstTicketNumber + t.ticketCount, nextCustomerNumber: CUSTOMER_BASE[t.slug],
        createdAt: new Date(now.getTime() - 400 * DAY),
      });
      counts.tenants!++;

      // ---- people, teams, products, SLA policies
      const userId = new Map<string, string>();
      for (const u of t.users) {
        const id = rng.uuid();
        userId.set(u.email, id);
        await db.insert(s.users).values({ id, tenantId, email: u.email, name: u.name, role: u.role });
        counts.users!++;
      }
      const teamId = new Map<string, string>();
      for (const team of t.teams) {
        const id = rng.uuid();
        teamId.set(team.name, id);
        await db.insert(s.teams).values({ id, tenantId, name: team.name, description: team.description });
      }
      const members = new Map<string, string[]>();
      for (const u of t.users) {
        for (const teamName of u.teams) {
          await db.insert(s.teamMembers).values({ tenantId, teamId: teamId.get(teamName)!, userId: userId.get(u.email)! });
          members.set(teamName, [...(members.get(teamName) ?? []), u.email]);
        }
      }
      const productId = new Map<string, string>();
      for (const p of t.products) {
        const id = rng.uuid();
        productId.set(p, id);
        await db.insert(s.products).values({ id, tenantId, name: p });
      }
      const policy = new Map<Plan, { id: string; fr: number; res: number }>();
      for (const plan of ["standard", "priority", "enterprise"] as const) {
        const p = t.sla[plan];
        const id = rng.uuid();
        policy.set(plan, { id, fr: p.firstResponseMins, res: p.resolutionMins });
        await db.insert(s.slaPolicies).values({ id, tenantId, name: p.name, plan, firstResponseMins: p.firstResponseMins, resolutionMins: p.resolutionMins });
      }

      // ---- customers: anchors first, then generated around them
      type Cust = { id: string; code: string; name: string; email: string; language: "en" | "ar"; plan: Plan };
      const customers: Cust[] = [];
      const byCode = new Map<string, Cust>();
      for (const a of ANCHOR_CUSTOMERS.filter((x) => x.tenant === t.slug)) {
        const cust: Cust = { id: rng.uuid(), code: a.code, name: a.name, email: a.email, language: a.language, plan: a.plan };
        customers.push(cust);
        byCode.set(a.code, cust);
      }
      const anchorCodes = new Set(customers.map((x) => x.code));
      const emails = new Set(customers.map((x) => x.email));
      let n = CUSTOMER_BASE[t.slug];
      while (customers.length < t.customerCount) {
        const code = `CUS-${n++}`;
        if (anchorCodes.has(code)) continue;
        const first = rng.pick(FIRST_NAMES);
        const last = rng.pick(LAST_NAMES);
        let email = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "") + `@${rng.pick(EMAIL_DOMAINS)}`;
        if (emails.has(email)) email = email.replace("@", `${n}@`);
        emails.add(email);
        customers.push({
          id: rng.uuid(), code, name: `${first} ${last}`, email,
          language: rng.chance(t.arabicShare) ? "ar" : "en",
          plan: rng.weighted([["standard", 6], ["priority", 3], ["enterprise", 1]] as const),
        });
      }
      const maxCode = Math.max(...customers.map((x) => Number(x.code.slice(4))));
      await insertChunks(db, s.customers, customers.map((x) => ({
        id: x.id, tenantId, code: x.code, legacyNumber: Number(x.code.slice(4)), name: x.name, email: x.email,
        language: x.language, plan: x.plan, createdAt: new Date(now.getTime() - rng.int(100, 390) * DAY),
      })));
      await db.update(s.tenants).set({ nextCustomerNumber: maxCode + 1 }).where(sql`id = ${tenantId}`);
      counts.customers! += customers.length;

      // ---- knowledge base
      const core = CORE_ARTICLES.filter((a) => a.tenant === t.slug);
      const taken = new Set(core.map((a) => a.slug));
      const articles = [...core, ...generateArticles(t, t.articleCount - core.length, rng, taken)];
      await insertChunks(db, s.kbArticles, articles.map((a) => ({
        id: rng.uuid(), tenantId, slug: a.slug, productId: a.product ? productId.get(a.product)! : null,
        title: a.title, body: a.body, language: a.language, updatedAt: new Date(now.getTime() - rng.int(1, 200) * DAY),
      })));
      counts.articles! += articles.length;

      // ---- tickets
      const ticketRows: (typeof s.tickets.$inferInsert)[] = [];
      const messageRows: (typeof s.messages.$inferInsert)[] = [];
      const anchors = new Map(ANCHOR_TICKETS.filter((a) => a.tenant === t.slug).map((a) => [a.number, a]));
      const generatedNumbers: number[] = [];
      for (let num = t.firstTicketNumber; num < t.firstTicketNumber + t.ticketCount; num++) {
        if (!anchors.has(num)) generatedNumbers.push(num);
      }

      const ctx = { t, tenantId, cal, now, rng, teamId, members, userId, productId, policy, ticketRows, messageRows };
      for (const a of anchors.values()) addAnchor(ctx, a, byCode);
      generatedNumbers.forEach((num, i) => {
        // Generated tickets run from 90 days ago to 2 days ago in number order, so nothing
        // generated is "recent": the newest tickets are the anchors exercises rely on.
        const ageDays = 90 - (88 * i) / Math.max(1, generatedNumbers.length - 1);
        addGenerated(ctx, num, new Date(now.getTime() - ageDays * DAY - rng.int(0, 8) * HOUR), customers);
      });

      await insertChunks(db, s.tickets, ticketRows);
      await insertChunks(db, s.messages, messageRows);
      counts.tickets! += ticketRows.length;
      counts.messages! += messageRows.length;
    }
    return counts;
  } finally {
    await pool.end();
  }
}

// ------------------------------------------------------------------ helpers

interface Ctx {
  t: TenantSeed; tenantId: string; cal: BusinessCalendar; now: Date; rng: Rng;
  teamId: Map<string, string>; members: Map<string, string[]>; userId: Map<string, string>;
  productId: Map<string, string>; policy: Map<Plan, { id: string; fr: number; res: number }>;
  ticketRows: (typeof s.tickets.$inferInsert)[]; messageRows: (typeof s.messages.$inferInsert)[];
}

function addAnchor(ctx: Ctx, a: AnchorTicket, byCode: Map<string, { id: string; plan: Plan }>) {
  const cust = byCode.get(a.customer);
  if (!cust) throw new Error(`Anchor ticket ${a.number}: unknown customer ${a.customer}`);
  const pol = ctx.policy.get(cust.plan)!;
  const created = new Date(ctx.now.getTime() - a.createdHoursAgo * HOUR);
  const id = ctx.rng.uuid();
  const at = (m: number) => new Date(created.getTime() + m * 60_000);
  const firstAgent = a.messages.find((m) => m.from === "agent" && !m.internal);
  const solvedAt = a.solvedHoursAgo !== undefined ? new Date(ctx.now.getTime() - a.solvedHoursAgo * HOUR) : null;
  const last = a.messages[a.messages.length - 1]!;

  ctx.ticketRows.push({
    id, tenantId: ctx.tenantId, number: a.number, subject: a.subject, status: a.status, channel: a.channel,
    language: a.language, customerId: cust.id, teamId: a.team ? ctx.teamId.get(a.team)! : null,
    assigneeId: a.assignee ? ctx.userId.get(a.assignee)! : null,
    productId: a.product ? ctx.productId.get(a.product)! : null, slaPolicyId: pol.id,
    firstResponseDueAt: addBusinessMinutes(created, pol.fr, ctx.cal),
    resolutionDueAt: addBusinessMinutes(created, pol.res, ctx.cal),
    firstResponseAt: firstAgent ? at(firstAgent.minutesAfter) : null,
    pendingSince: a.status === "pending" ? at(last.minutesAfter) : null,
    solvedAt, createdAt: created, updatedAt: at(last.minutesAfter),
  });
  for (const m of a.messages) {
    ctx.messageRows.push({
      id: ctx.rng.uuid(), tenantId: ctx.tenantId, ticketId: id, authorType: m.from,
      authorId: m.from === "agent" ? ctx.userId.get(m.agent ?? "")! : null,
      body: m.body, internal: m.internal ?? false, createdAt: at(m.minutesAfter),
    });
  }
}

function addGenerated(ctx: Ctx, number: number, created: Date, customers: { id: string; name: string; language: "en" | "ar"; plan: Plan }[]) {
  const { rng, t, cal, now } = ctx;
  const scenario = rng.weighted(SCENARIOS[t.slug].map((sc) => [sc, sc.weight] as const));
  const cust = rng.pick(customers);
  const lang: "en" | "ar" = cust.language === "ar" && scenario.ar ? "ar" : "en";
  const text = lang === "ar" ? scenario.ar! : scenario.en;
  const vars = {
    invoice: `INV-2026-${String(rng.int(1, 999)).padStart(4, "0")}`, order: `SM-${rng.int(40000, 59999)}`,
    amount: lang === "ar" || t.slug !== "hq" ? String(rng.int(80, 2400)) : `USD ${rng.int(49, 1800)}`,
    feature: rng.pick(FEATURES), first: cust.name.split(" ")[0]!,
  };
  const pol = ctx.policy.get(cust.plan)!;
  const ageDays = (now.getTime() - created.getTime()) / DAY;

  let status: s.TicketStatus = ageDays > 14
    ? rng.weighted([["solved", 92], ["pending", 4], ["open", 4]] as const)
    : rng.weighted([["new", 8], ["open", 30], ["pending", 14], ["solved", 48]] as const);

  const team = scenario.team;
  const assigneeEmail = status === "new" ? null : rng.pick(ctx.members.get(team) ?? ctx.members.get(t.teams[0]!.name) ?? [t.users[0]!.email]);
  const assigneeId = assigneeEmail ? ctx.userId.get(assigneeEmail)! : null;
  const id = rng.uuid();
  const msgs: { from: "customer" | "agent"; internal?: boolean; body: string; at: Date }[] = [];
  msgs.push({ from: "customer", body: fill(rng.pick(text.bodies), vars), at: created });

  let firstResponseAt: Date | null = null;
  let solvedAt: Date | null = null;
  let pendingSince: Date | null = null;

  if (status !== "new") {
    // Some first responses miss the target: up to 1.4 times the policy's business minutes.
    firstResponseAt = addBusinessMinutes(created, Math.max(5, Math.round(pol.fr * (0.1 + rng.next() * 1.3))), cal);
    if (firstResponseAt > now) firstResponseAt = new Date(now.getTime() - HOUR);
    const replies = AGENT_REPLIES[t.slug][lang];
    let cursor = firstResponseAt;
    msgs.push({ from: "agent", body: fill(rng.pick(replies), vars), at: cursor });
    if (rng.chance(0.15)) msgs.push({ from: "agent", internal: true, body: rng.pick(INTERNAL_NOTES), at: new Date(cursor.getTime() + 5 * 60_000) });
    const rounds = rng.int(0, 2);
    for (let r = 0; r < rounds; r++) {
      cursor = new Date(cursor.getTime() + rng.int(1, 20) * HOUR);
      if (cursor > now) break;
      msgs.push({ from: "customer", body: rng.pick(CUSTOMER_FOLLOWUPS[lang]), at: cursor });
      cursor = new Date(cursor.getTime() + rng.int(1, 6) * HOUR);
      if (cursor > now) break;
      msgs.push({ from: "agent", body: fill(rng.pick(replies), vars), at: cursor });
    }
    if (status === "solved") {
      solvedAt = addBusinessMinutes(created, Math.round(pol.res * (0.2 + rng.next() * 1.1)), cal);
      if (solvedAt <= cursor) solvedAt = new Date(cursor.getTime() + HOUR);
      if (solvedAt > now) { status = "open"; solvedAt = null; }
    }
    if (status === "pending") pendingSince = msgs[msgs.length - 1]!.at;
    if (status === "solved" && solvedAt && now.getTime() - solvedAt.getTime() > 7 * DAY) status = "closed";
  } else if (rng.chance(0.3)) {
    const at = new Date(created.getTime() + rng.int(1, 12) * HOUR);
    if (at < now) msgs.push({ from: "customer", body: rng.pick(CUSTOMER_FOLLOWUPS[lang]), at });
  }

  const last = msgs[msgs.length - 1]!;
  ctx.ticketRows.push({
    id, tenantId: ctx.tenantId, number, subject: fill(rng.pick(text.subjects), vars), status,
    channel: rng.weighted([["email", 5], ["web", 3], ["chat", 2]] as const), language: lang,
    customerId: cust.id, teamId: status === "new" ? null : ctx.teamId.get(team)!, assigneeId,
    productId: ctx.productId.get(scenario.product)!, slaPolicyId: pol.id,
    firstResponseDueAt: addBusinessMinutes(created, pol.fr, cal),
    resolutionDueAt: addBusinessMinutes(created, pol.res, cal),
    firstResponseAt, pendingSince, solvedAt, createdAt: created,
    updatedAt: solvedAt && solvedAt > last.at ? solvedAt : last.at,
  });
  for (const m of msgs) {
    ctx.messageRows.push({
      id: rng.uuid(), tenantId: ctx.tenantId, ticketId: id, authorType: m.from,
      authorId: m.from === "agent" ? assigneeId : null, body: m.body, internal: m.internal ?? false, createdAt: m.at,
    });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed()
    .then((c) => console.log("Seeded:", Object.entries(c).map(([k, v]) => `${v} ${k}`).join(", ")))
    .catch((err) => { console.error(err); process.exit(1); });
}
