import pg from "pg";
import "../scripts/env";
import { migrate } from "../scripts/db/migrate";
import { seed } from "../scripts/db/seed";
import { adminUrl, ownerUrl, TEST_DB } from "./test-db";

/** Runs once before all tests: a fresh, migrated and seeded test database. */
export default async function setup(): Promise<void> {
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    await admin.query(`drop database if exists ${TEST_DB} with (force)`);
    await admin.query(`create database ${TEST_DB}`);
  } finally {
    await admin.end();
  }
  await migrate(ownerUrl);
  await seed(ownerUrl);
}
