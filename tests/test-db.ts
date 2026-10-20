// The tests use their own database, helpdesk_test, next to your development database.
// Override with TEST_MIGRATION_DATABASE_URL and TEST_DATABASE_URL if you need to.
function withDb(url: string, name: string): string {
  const u = new URL(url);
  u.pathname = `/${name}`;
  return u.toString();
}

const ownerBase = process.env.MIGRATION_DATABASE_URL ?? "postgres://helpdesk:helpdesk@localhost:5432/helpdesk";
const appBase = process.env.DATABASE_URL ?? "postgres://helpdesk_app:helpdesk_app@localhost:5432/helpdesk";

export const TEST_DB = "helpdesk_test";
export const ownerUrl = process.env.TEST_MIGRATION_DATABASE_URL ?? withDb(ownerBase, TEST_DB);
export const appUrl = process.env.TEST_DATABASE_URL ?? withDb(appBase, TEST_DB);
export const adminUrl = withDb(ownerBase, "postgres"); // to create and drop the test database
