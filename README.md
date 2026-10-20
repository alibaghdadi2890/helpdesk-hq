# Helpdesk HQ

The course project for **AI Agent Engineer**. Helpdesk HQ is a small multi-tenant
customer-support desk: tickets, messages, customers, teams, SLAs and a knowledge base for
three companies. Over the course you add AI features to it: classification, reply drafts,
a triage agent, retrieval, workflows, evals, tracing and guardrails.

Everything is Node.js and TypeScript: Next.js route handlers, Drizzle ORM, PostgreSQL 16
with row-level security, zod and Vitest.

## Quick start

You need Node.js 22 or newer, Docker, and Git.

```bash
git clone https://github.com/alibaghdadi2890/helpdesk-hq.git
cd helpdesk-hq
npm install
cp .env.example .env
make up            # PostgreSQL (with pgvector) and Phoenix, waits until ready
make db-reset      # migrate and load the seed
make test          # 49 tests against a separate helpdesk_test database
make dev           # http://localhost:3000
```

Then sign in and call the API:

```bash
TOKEN=$(curl -s -X POST localhost:3000/auth/dev-login \
  -H 'content-type: application/json' -d '{"email":"lina@hq.test"}' | jq -r .token)
curl -s localhost:3000/tickets/1042 -H "authorization: Bearer $TOKEN" | jq
```

No Docker? Any PostgreSQL 16 works. Create a `helpdesk` user that owns a `helpdesk`
database, point both URLs in `.env` at it and run `npm run db:reset`. The first migration
creates the `helpdesk_app` role the app connects as. Chapter 4 also needs the pgvector
extension.

## The seed

`npm run db:seed` loads the same data for every learner (random seed 42). Timestamps are
relative to the moment you seed, so some open tickets are always about to breach their SLA.

| Tenant | Slug | Hours (UTC offset) | Tickets | Customers | Articles |
|---|---|---|---:|---:|---:|
| Helpdesk HQ | `hq` | Mon–Fri 9–17 (+3) | 1,200 | 300 | 150 |
| Cedar Bank | `cedar-bank` | Mon–Fri 8–16 (+4) | 700 | 180 | 90 |
| Souk Market | `souk-market` | Sun–Thu 9–18 (+3) | 500 | 120 | 60 |

About 9,700 messages; about one ticket in eight is in Arabic. Dev logins (no password; development
only): `lina@hq.test` (agent), `omar@hq.test` (lead), `admin@hq.test`
(admin), plus agents and leads for each tenant in `scripts/seed/tenants.ts`.

Exercises refer to **anchor tickets** by number. Do not change them: the eval files depend
on their facts.

| Ticket | What it is |
|---|---|
| 1042 | Sara Haddad charged twice for INV-2026-0041. 6 messages, one internal note that must never reach the customer |
| 1105 | Empty CSV export. Part of a Reports outage with 2196, 2198, 2201, 2203 |
| 1188 | Login problem after a password reset; the customer typed their own email wrong. 12 messages |
| 1311 | One long message about API 429s and disabled webhooks |
| 2207 | Mobile notifications, in Arabic |
| 2150–2169 | The new-ticket queue the reply and triage evals use |
| Cedar 1601–1609, Souk 1401–1407 | The same for the other two tenants |

## Repository layout

```
migrations/            plain SQL, applied in order by npm run db:migrate
src/
  app/<endpoint>/route.ts   Next.js route handlers (the HTTP API)
  db/                       Drizzle schema, pool, withTenant()
  domain/                   tickets, customers, KB, SLA and status rules
  http/                     auth (JWT), problem details, the route() wrapper
  ai/                       empty: you build this from Chapter 1
scripts/
  db/                       migrate, seed, reset
  seed/                     tenants, anchors, KB articles, generated content
  data/export-tickets.ts    regenerates data/tickets/*.json
  jobs/close-solved.ts      closes tickets solved more than 7 days ago
  ch00/                     Exercise 0.3 and 0.4 starters
data/
  tickets/                  50 full ticket exports and 200 filler messages
  labels/                   labelled and ambiguous tickets for classification
  evals/                    reply, triage and tool-use eval cases
prompts/                    versioned prompts (Chapter 2)
evals/                      eval runners and baselines (Chapter 2)
docs/                       your learning log and the Chapter 0 baseline
tests/                      Vitest: SLA, status, RLS, seed and API tests
```

## API

All routes except `/health` and `/auth/dev-login` need `Authorization: Bearer <token>`.
Errors are problem details (RFC 9457).

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | |
| POST | `/auth/dev-login` | `{ "email" }`. Off when `APP_ENV=production` |
| GET, POST | `/tickets` | Filters: `status` (comma list), `team`, `assignee`, `customer`, `q`, `page`, `pageSize` |
| GET, PATCH | `/tickets/{number or id}` | Status changes follow `src/domain/status.ts` |
| GET, POST | `/tickets/{id}/messages` | An agent's first public reply sets `first_response_at` |
| GET | `/customers/{CUS-code or id}` | Includes the 5 most recent tickets |
| GET | `/kb/articles?q=` | Full-text search |
| GET | `/kb/articles/{slug or id}` | |
| GET | `/reports/sla?days=30` | Leads and admins only |

## Tenancy and row-level security

The app connects as `helpdesk_app`. Every tenant table has a policy that compares
`tenant_id` with `app.tenant_id`, which `withTenant()` sets for one transaction at a time.
A query that forgets the tenant returns nothing rather than another company's tickets.
Migrations, the seed and `export-tickets` run as the table owner and see every tenant.

## Commands

| Command | What it does |
|---|---|
| `make up` / `make down` | Start or stop PostgreSQL and Phoenix |
| `make db-reset` | Drop, migrate and seed |
| `make test` | All tests (creates `helpdesk_test`) |
| `make typecheck`, `make build` | |
| `make hello` | Run Exercise 0.4 with `.env` loaded |
| `make export-tickets` | Regenerate `data/tickets/` |
| `make close-solved` | Run the close-solved job |
| `make psql` | psql as the table owner |

## Secrets

`.env` is ignored by Git. Install the pre-commit hook (`pipx install pre-commit &&
pre-commit install`) so gitleaks blocks a key before it reaches a commit; Exercise 0.3
shows you how to test it with `scripts/ch00/make-fake-key.sh`.
