import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ownerUrl } from "./test-db";

// The owner role bypasses RLS, so these checks see all tenants.
let db: pg.Client;
beforeAll(async () => { db = new pg.Client({ connectionString: ownerUrl }); await db.connect(); });
afterAll(async () => db.end());

const one = async <T>(sql: string, args: unknown[] = []) => (await db.query(sql, args)).rows[0] as T;

describe("seed data", () => {
  it("has the documented totals", async () => {
    const r = await one<{ tenants: number; customers: number; articles: number; users: number }>(`
      select (select count(*)::int from tenants) as tenants, (select count(*)::int from customers where email not like '%@api-test.test') as customers,
             (select count(*)::int from kb_articles) as articles, (select count(*)::int from users) as users`);
    expect(r).toEqual({ tenants: 3, customers: 600, articles: 300, users: 18 });
  });

  it("has 1,200 / 700 / 500 tickets per tenant before tests add more", async () => {
    // Tickets created by other tests get numbers above each tenant's seeded range.
    const { rows } = await db.query(`select tn.slug, count(*)::int as n from tickets t join tenants tn on tn.id = t.tenant_id
      where (tn.slug = 'hq' and t.number <= 2208) or (tn.slug = 'cedar-bank' and t.number <= 1700)
         or (tn.slug = 'souk-market' and t.number <= 1500) group by 1 order by 1`);
    expect(Object.fromEntries(rows.map((r) => [r.slug, r.n]))).toMatchObject({ "cedar-bank": 700, hq: 1200, "souk-market": 500 });
  });

  it("contains the anchor tickets the exercises rely on", async () => {
    const t = await one<{ subject: string; messages: number; internal: number }>(`
      select t.subject, count(m.*)::int as messages, count(m.*) filter (where m.internal)::int as internal
      from tickets t join tenants tn on tn.id = t.tenant_id join messages m on m.ticket_id = t.id
      where tn.slug = 'hq' and t.number = 1042 group by t.subject`);
    expect(t).toEqual({ subject: "Charged twice for invoice INV-2026-0041", messages: 6, internal: 1 });
    const counts = await db.query(`select t.number, count(m.*)::int as n from tickets t join tenants tn on tn.id = t.tenant_id
      join messages m on m.ticket_id = t.id where tn.slug = 'hq' and t.number in (1105, 1188, 1311, 2207) group by 1 order by 1`);
    expect(counts.rows).toEqual([{ number: 1105, n: 2 }, { number: 1188, n: 12 }, { number: 1311, n: 1 }, { number: 2207, n: 4 }]);
  });

  it("puts the Reports outage cluster in the last six hours", async () => {
    const { rows } = await db.query(`select t.number from tickets t join tenants tn on tn.id = t.tenant_id
      join products p on p.id = t.product_id where tn.slug = 'hq' and p.name = 'Reports'
      and t.created_at > now() - interval '24 hours' order by t.number`);
    expect(rows.map((r) => r.number)).toEqual([1105, 2196, 2198, 2201, 2203]);
  });
});
