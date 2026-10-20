import { withTenant } from "@/db/tenant";
import { CreateTicketBody, createTicket, ListTicketsQuery, listTickets } from "@/domain/tickets";
import { requireUser } from "@/http/auth";
import { query, readJson, route } from "@/http/route";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const user = await requireUser(req);
  const filters = ListTicketsQuery.parse(Object.fromEntries(query(req)));
  return Response.json(await withTenant(user.tenantId, (tx) => listTickets(tx, filters)));
});

export const POST = route(async (req) => {
  const user = await requireUser(req);
  const body = await readJson(req, CreateTicketBody);
  const ticket = await withTenant(user.tenantId, (tx) => createTicket(tx, user.tenantId, body));
  return Response.json(ticket, { status: 201 });
});
