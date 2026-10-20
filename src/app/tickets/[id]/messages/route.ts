import { withTenant } from "@/db/tenant";
import { badRequest } from "@/domain/errors";
import { AddMessageBody, addMessage, listMessages } from "@/domain/tickets";
import { requireUser } from "@/http/auth";
import { readJson, route, type Params } from "@/http/route";

export const dynamic = "force-dynamic";

export const GET = route(async (req, { params }: Params<"id">) => {
  const user = await requireUser(req);
  const { id } = await params;
  // Every signed-in user is staff, so internal notes are included.
  return Response.json(await withTenant(user.tenantId, (tx) => listMessages(tx, id, { includeInternal: true })));
});

export const POST = route(async (req, { params }: Params<"id">) => {
  const user = await requireUser(req);
  const { id } = await params;
  const body = await readJson(req, AddMessageBody);
  if (body.authorType === "customer" && process.env.APP_ENV === "production") {
    throw badRequest("authorType customer is only for simulating inbound email in development.");
  }
  const message = await withTenant(user.tenantId, (tx) => addMessage(tx, user.tenantId, id, body, user.userId));
  return Response.json(message, { status: 201 });
});
