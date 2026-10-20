// Drops every table, then migrates and seeds again. Development only.
import { pathToFileURL } from "node:url";
import pg from "pg";
import { requireEnv } from "../env";
import { migrate } from "./migrate";
import { seed } from "./seed";

export async function reset(url = requireEnv("MIGRATION_DATABASE_URL")): Promise<void> {
  if (process.env.APP_ENV === "production") throw new Error("Refusing to reset a production database.");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("drop schema public cascade");
    await client.query("create schema public");
  } finally {
    await client.end();
  }
  await migrate(url);
  await seed(url);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  reset()
    .then(() => console.log("Database reset, migrated and seeded."))
    .catch((err) => { console.error(err); process.exit(1); });
}
