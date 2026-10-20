import { z } from "zod";
import { withTenant } from "@/db/tenant";
import { slaReport } from "@/domain/reports";
import { requireRole, requireUser } from "@/http/auth";
import { query, route } from "@/http/route";

export const dynamic = "force-dynamic";

const Query = z.object({ days: z.coerce.number().int().min(1).max(365).default(30) });

export const GET = route(async (req) => {
  const user = await requireUser(req);
  requireRole(user, "lead", "admin");
  const { days } = Query.parse(Object.fromEntries(query(req)));
  return Response.json(await withTenant(user.tenantId, (tx) => slaReport(tx, days)));
});
