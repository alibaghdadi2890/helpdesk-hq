import { withTenant } from "@/db/tenant";
import { getCustomer } from "@/domain/customers";
import { requireUser } from "@/http/auth";
import { route, type Params } from "@/http/route";

export const dynamic = "force-dynamic";

export const GET = route(async (req, { params }: Params<"id">) => {
  const user = await requireUser(req);
  const { id } = await params;
  return Response.json(await withTenant(user.tenantId, (tx) => getCustomer(tx, id)));
});
