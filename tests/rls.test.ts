import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { appUrl } from "./test-db";

// Talks to the database directly as the app role, without the app's helpers,
// to prove the database itself enforces tenant isolation.
let client: pg.Client;
let hq: string;
let cedar: string;

beforeAll(async () => {
  client = new pg.Client({ connectionString: appUrl });
  await client.connect();
  const { rows } = await client.query<{ slug: string; id: string }>("select slug, id from tenants");
  hq = rows.find((r) => r.slug === "hq")!.id;
  cedar = rows.find((r) => r.slug === "cedar-bank")!.id;
});
afterAll(async () => client.end());

describe("row-level security", () => {
  it("shows no rows when no tenant is set", async () => {
    const { rows } = await client.query("select count(*)::int as n from tickets");
    expect(rows[0].n).toBe(0);
  });

  it("shows only the current tenant's rows", async () => {
    await client.query("begin");
    await client.query("select set_config('app.tenant_id', $1, true)", [hq]);
    const own = await client.query("select count(*)::int as n from tickets");
    const other = await client.query("select count(*)::int as n from tickets where tenant_id = $1", [cedar]);
    await client.query("commit");
    expect(own.rows[0].n).toBeGreaterThanOrEqual(1200);
    expect(other.rows[0].n).toBe(0);
  });

  it("does not leak the setting into the next transaction on the same connection", async () => {
    await client.query("begin");
    await client.query("select set_config('app.tenant_id', $1, true)", [hq]);
    await client.query("commit");
    const { rows } = await client.query("select count(*)::int as n from messages");
    expect(rows[0].n).toBe(0);
  });

  it("cannot insert a row for another tenant", async () => {
    await client.query("begin");
    await client.query("select set_config('app.tenant_id', $1, true)", [hq]);
    await expect(
      client.query("insert into products (tenant_id, name) values ($1, 'Smuggled')", [cedar]),
    ).rejects.toThrow(/row-level security/);
    await client.query("rollback");
  });
});
