import { sql } from "drizzle-orm";
import { getDb, type Tx } from "./client";

/**
 * Run `work` in a transaction scoped to one tenant.
 *
 * Row-level security (migrations/0010_rls.sql) compares every row's tenant_id with
 * app.tenant_id. The third argument of set_config, true, makes the setting local to this
 * transaction, so it can never leak into the next request that reuses the connection.
 * Every query that touches tenant data must go through this function.
 */
export function withTenant<T>(tenantId: string, work: (tx: Tx) => Promise<T>): Promise<T> {
  return getDb().transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`);
    return work(tx);
  });
}
