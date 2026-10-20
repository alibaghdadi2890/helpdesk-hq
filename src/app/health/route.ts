import { getPool } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    await getPool().query("select 1");
    return Response.json({ status: "ok", db: "ok" });
  } catch {
    return Response.json({ status: "degraded", db: "unreachable" }, { status: 503 });
  }
}
