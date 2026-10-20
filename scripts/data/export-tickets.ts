// Export tickets as "fat" JSON, the way a typical helpdesk API returns them: the ticket,
// every message with its author, the nested customer, metadata and an audit trail.
// Chapter 2 uses these files to practise trimming context before it reaches the model.
//
//   npm run data:export                      # the 50 HQ tickets the course uses
//   npm run data:export -- 1042 1188         # only these numbers
//   npm run data:export -- --tenant cedar-bank 1601
//
// Runs as the table owner (MIGRATION_DATABASE_URL), so it reads across row-level security.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";
import { requireEnv } from "../env";

const ANCHORS = [1042, 1105, 1188, 1311, 2207, 1500, 1720, 2196, 2198, 2201, 2203];
const NEW_QUEUE = Array.from({ length: 20 }, (_, i) => 2150 + i);
const GENERATED = Array.from({ length: 19 }, (_, i) => 1013 + i * 61); // spread across 90 days
export const DEFAULT_TICKETS = [...ANCHORS, ...NEW_QUEUE, ...GENERATED];

function parseArgs(argv: string[]) {
  let tenant = "hq";
  const numbers: number[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? "";
    if (arg === "--tenant") tenant = argv[++i] ?? tenant;
    else if (/^\d+$/.test(arg)) numbers.push(Number(arg));
  }
  return { tenant, numbers: numbers.length ? numbers : DEFAULT_TICKETS };
}

async function main() {
  const { tenant, numbers } = parseArgs(process.argv.slice(2));
  const pool = new pg.Pool({ connectionString: requireEnv("MIGRATION_DATABASE_URL") });
  const outDir = join("data", "tickets");
  mkdirSync(outDir, { recursive: true });
  let written = 0;

  try {
    const { rows: [t] } = await pool.query("select id, slug, name from tenants where slug = $1", [tenant]);
    if (!t) throw new Error(`No tenant "${tenant}". Run npm run db:seed first.`);

    for (const number of numbers) {
      const { rows: [ticket] } = await pool.query(
        `select k.*, p.name as product_name, tm.name as team_name, u.name as assignee_name, u.email as assignee_email,
                sp.name as sla_name, sp.first_response_mins, sp.resolution_mins
           from tickets k
           left join products p on p.id = k.product_id
           left join teams tm on tm.id = k.team_id
           left join users u on u.id = k.assignee_id
           join sla_policies sp on sp.id = k.sla_policy_id
          where k.tenant_id = $1 and k.number = $2`, [t.id, number]);
      if (!ticket) { console.warn(`skip #${number}: not found`); continue; }

      const { rows: [customer] } = await pool.query("select * from customers where id = $1", [ticket.customer_id]);
      const { rows: messages } = await pool.query(
        `select m.*, u.name as agent_name, u.email as agent_email, u.role as agent_role
           from messages m left join users u on u.id = m.author_id
          where m.ticket_id = $1 order by m.created_at, m.id`, [ticket.id]);
      const { rows: [{ n: customerTickets }] } = await pool.query(
        "select count(*)::int as n from tickets where customer_id = $1", [ticket.customer_id]);

      const doc = {
        object: "ticket",
        api_version: "2026-09-01",
        id: ticket.id,
        url: `https://api.helpdesk-hq.test/v1/tickets/${ticket.id}`,
        html_url: `https://${t.slug}.helpdesk-hq.test/agent/tickets/${ticket.number}`,
        tenant: { id: t.id, slug: t.slug, name: t.name },
        number: ticket.number,
        subject: ticket.subject,
        status: ticket.status,
        channel: ticket.channel,
        language: ticket.language,
        priority: null,
        tags: [],
        product: ticket.product_name ? { id: ticket.product_id, name: ticket.product_name } : null,
        team: ticket.team_name ? { id: ticket.team_id, name: ticket.team_name } : null,
        assignee: ticket.assignee_name
          ? { id: ticket.assignee_id, name: ticket.assignee_name, email: ticket.assignee_email, avatar_url: `https://cdn.helpdesk-hq.test/avatars/${ticket.assignee_id}.png` }
          : null,
        customer: {
          object: "customer",
          id: customer.id,
          code: customer.code,
          legacy_number: customer.legacy_number,
          name: customer.name,
          email: customer.email,
          language: customer.language,
          plan: customer.plan,
          created_at: customer.created_at,
          avatar_url: `https://cdn.helpdesk-hq.test/avatars/${customer.id}.png`,
          ticket_count: customerTickets,
          custom_fields: { crm_id: `crm_${customer.id.slice(0, 8)}`, marketing_opt_in: false, timezone: null },
        },
        sla: {
          policy: ticket.sla_name,
          first_response_mins: ticket.first_response_mins,
          resolution_mins: ticket.resolution_mins,
          first_response_due_at: ticket.first_response_due_at,
          resolution_due_at: ticket.resolution_due_at,
          first_response_at: ticket.first_response_at,
          pending_since: ticket.pending_since,
        },
        messages: messages.map((m) => ({
          object: "message",
          id: m.id,
          created_at: m.created_at,
          author: m.author_type === "customer"
            ? { type: "customer", id: customer.id, name: customer.name, email: customer.email }
            : m.author_type === "agent"
              ? { type: "agent", id: m.author_id, name: m.agent_name, email: m.agent_email, role: m.agent_role }
              : { type: "system", id: null, name: "Helpdesk HQ" },
          internal: m.internal,
          body: m.body,
          body_html: `<div dir="${ticket.language === "ar" ? "rtl" : "ltr"}"><p>${escapeHtml(m.body).replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p></div>`,
          attachments: [],
          via: { channel: m.author_type === "agent" ? "web" : ticket.channel, source: { ip: null, user_agent: null } },
        })),
        metadata: { message_count: messages.length, created_at: ticket.created_at, updated_at: ticket.updated_at ?? ticket.created_at, solved_at: ticket.solved_at, exported_at: new Date().toISOString() },
        audit: [
          { event: "ticket.created", at: ticket.created_at, actor: "customer" },
          ...(ticket.team_name ? [{ event: "ticket.team_changed", at: ticket.created_at, actor: "system", to: ticket.team_name }] : []),
          ...(ticket.assignee_name ? [{ event: "ticket.assigned", at: ticket.created_at, actor: "system", to: ticket.assignee_name }] : []),
          ...(ticket.first_response_at ? [{ event: "ticket.first_response", at: ticket.first_response_at, actor: "agent" }] : []),
          ...(ticket.solved_at ? [{ event: "ticket.solved", at: ticket.solved_at, actor: "agent" }] : []),
        ],
      };
      writeFileSync(join(outDir, `ticket-${ticket.number}.json`), JSON.stringify(doc, null, 2) + "\n");
      written++;
    }
  } finally {
    await pool.end();
  }
  console.log(`wrote ${written} file(s) to data/tickets/`);
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

main().catch((err) => { console.error(err); process.exit(1); });
