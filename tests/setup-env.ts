import "../scripts/env";
import { afterAll } from "vitest";
import { closeDb } from "../src/db/client";
import { appUrl } from "./test-db";

// Every test talks to the test database as the app role, so row-level security applies.
process.env.DATABASE_URL = appUrl;
process.env.APP_ENV = "development";
process.env.JWT_SECRET ??= "test-secret-test-secret-test-secret-123";
if (process.env.JWT_SECRET.length < 32) process.env.JWT_SECRET = "test-secret-test-secret-test-secret-123";

afterAll(async () => {
  await closeDb();
});
