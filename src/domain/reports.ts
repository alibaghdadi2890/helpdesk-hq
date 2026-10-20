import { sql } from "drizzle-orm";
import type { Tx } from "@/db/client";

/** SLA report per team for tickets created in the last `days` days. */
export async function slaReport(tx: Tx, days = 30) {
  const result = await tx.execute<{
    team: string; open: string; total: string; first_response_breached: string;
    resolution_breached: string; avg_first_response_mins: string | null;
  }>(sql`
    select coalesce(tm.name, 'Unassigned') as team,
           count(*) filter (where t.status in ('new', 'open', 'pending'))                       as open,
           count(*)                                                                               as total,
           count(*) filter (where coalesce(t.first_response_at, now()) > t.first_response_due_at) as first_response_breached,
           count(*) filter (where (t.solved_at is not null and t.solved_at > t.resolution_due_at)
                               or (t.solved_at is null and t.pending_since is null and now() > t.resolution_due_at))
                                                                                                  as resolution_breached,
           round(avg(extract(epoch from (t.first_response_at - t.created_at)) / 60)
                 filter (where t.first_response_at is not null))                                  as avg_first_response_mins
    from tickets t
    left join teams tm on tm.id = t.team_id
    where t.created_at > now() - make_interval(days => ${days})
    group by 1
    order by 1`);

  return {
    days,
    teams: result.rows.map((r) => ({
      team: r.team,
      open: Number(r.open),
      total: Number(r.total),
      firstResponseBreached: Number(r.first_response_breached),
      resolutionBreached: Number(r.resolution_breached),
      avgFirstResponseMinutes: r.avg_first_response_mins === null ? null : Number(r.avg_first_response_mins),
    })),
  };
}
