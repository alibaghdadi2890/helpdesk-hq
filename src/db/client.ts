import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

// One pool per process. In development Next.js reloads modules, so keep it on globalThis.
const cache = globalThis as unknown as { helpdeskPool?: Pool; helpdeskDb?: Db };

export function getPool(): Pool {
  if (!cache.helpdeskPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
    cache.helpdeskPool = new Pool({ connectionString: url, max: 10 });
  }
  return cache.helpdeskPool;
}

export function getDb(): Db {
  cache.helpdeskDb ??= drizzle(getPool(), { schema });
  return cache.helpdeskDb;
}

export async function closeDb(): Promise<void> {
  await cache.helpdeskPool?.end();
  cache.helpdeskPool = undefined;
  cache.helpdeskDb = undefined;
}
