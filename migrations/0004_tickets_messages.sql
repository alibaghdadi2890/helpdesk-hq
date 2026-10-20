CREATE TABLE tickets (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              uuid NOT NULL REFERENCES tenants(id),
  number                 int NOT NULL,   -- shown to people: #1042
  subject                text NOT NULL,
  status                 text NOT NULL DEFAULT 'new'
                           CHECK (status IN ('new', 'open', 'pending', 'solved', 'closed')),
  channel                text NOT NULL CHECK (channel IN ('email', 'web', 'chat')),
  language               text NOT NULL DEFAULT 'en',
  customer_id            uuid NOT NULL REFERENCES customers(id),
  team_id                uuid REFERENCES teams(id),
  assignee_id            uuid REFERENCES users(id),
  product_id             uuid REFERENCES products(id),
  sla_policy_id          uuid NOT NULL REFERENCES sla_policies(id),
  first_response_due_at  timestamptz NOT NULL,
  resolution_due_at      timestamptz NOT NULL,
  first_response_at      timestamptz,
  pending_since          timestamptz,   -- the resolution clock pauses while pending
  solved_at              timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, number)
);

CREATE TABLE messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  ticket_id    uuid NOT NULL REFERENCES tickets(id),
  author_type  text NOT NULL CHECK (author_type IN ('customer', 'agent', 'system')),
  author_id    uuid,
  body         text NOT NULL,
  internal     boolean NOT NULL DEFAULT false,   -- internal notes are never sent to customers
  created_at   timestamptz NOT NULL DEFAULT now()
);
