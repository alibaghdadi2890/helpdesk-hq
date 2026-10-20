import { withTenant } from "@/db/tenant";
import { ListArticlesQuery, listArticles } from "@/domain/kb";
import { requireUser } from "@/http/auth";
import { query, route } from "@/http/route";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const user = await requireUser(req);
  const filters = ListArticlesQuery.parse(Object.fromEntries(query(req)));
  return Response.json(await withTenant(user.tenantId, (tx) => listArticles(tx, filters)));
});
