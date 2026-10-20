// Applies every new file in migrations/ in name order, once, each in its own transaction.
// Applied files are recorded in schema_migrations. Never edit a file that has been applied:
// add a new one instead.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import pg from "pg";
import { requireEnv } from "../env";

export async function migrate(url = requireEnv("MIGRATION_DATABASE_URL"), dir = "migrations"): Promise<string[]> {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  const applied: string[] = [];
  try {
    await client.query(`create table if not exists schema_migrations (
      name text primary key, applied_at timestamptz not null default now())`);
    const done = new Set((await client.query<{ name: string }>("select name from schema_migrations")).rows.map((r) => r.name));
    const files = readdirSync(dir).filter((f) => /^\d{4}_[\w-]+\.sql$/.test(f)).sort();

    for (const file of files) {
      if (done.has(file)) continue;
      await client.query("begin");
      try {
        await client.query(readFileSync(join(dir, file), "utf8"));
        await client.query("insert into schema_migrations (name) values ($1)", [file]);
        await client.query("commit");
        applied.push(file);
      } catch (err) {
        await client.query("rollback");
        throw new Error(`Migration ${file} failed: ${(err as Error).message}`);
      }
    }
    return applied;
  } finally {
    await client.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  migrate()
    .then((files) => console.log(files.length ? `Applied ${files.length}: ${files.join(", ")}` : "Nothing to apply."))
    .catch((err) => { console.error(err.message); process.exit(1); });
}
