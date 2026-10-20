import { z } from "zod";
import { getPool } from "@/db/client";
import { AppError, unauthorized } from "@/domain/errors";
import { signToken, type Role } from "@/http/auth";
import { readJson, route } from "@/http/route";

export const dynamic = "force-dynamic";

const Body = z.object({ email: z.email() });

/** Development only: a token for any seeded user, no password. Disabled in production. */
export const POST = route(async (req) => {
  if (process.env.APP_ENV === "production") throw new AppError(404, "Not found");
  const { email } = await readJson(req, Body);

  // auth_find_user is the one narrow way to find a user before the tenant is known.
  const { rows } = await getPool().query<{ id: string; tenant_id: string; name: string; role: Role }>(
    "select id, tenant_id, name, role from auth_find_user($1)", [email]);
  if (rows.length !== 1) throw unauthorized("No user with that email. Seeded users include lina@hq.test.");

  const u = rows[0]!;
  const token = await signToken({ userId: u.id, tenantId: u.tenant_id, role: u.role, name: u.name });
  return Response.json({ token, user: { id: u.id, name: u.name, role: u.role, tenantId: u.tenant_id } });
});
