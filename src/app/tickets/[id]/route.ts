import { withTenant } from "@/db/tenant";
import { getTicket, UpdateTicketBody, updateTicket } from "@/domain/tickets";
import { requireUser } from "@/http/auth";
import { readJson, route, type Params } from "@/http/route";

export const dynamic = "force-dynamic";

export const GET = route(async (req, { params }: Params<"id">) => {
  const user = await requireUser(req);
  const { id } = await params;
  return Response.json(await withTenant(user.tenantId, (tx) => getTicket(tx, id)));
});

export const PATCH = route(async (req, { params }: Params<"id">) => {
  const user = await requireUser(req);
  const { id } = await params;
  const body = await readJson(req, UpdateTicketBody);
  return Response.json(await withTenant(user.tenantId, (tx) => updateTicket(tx, user.tenantId, id, body)));
});
