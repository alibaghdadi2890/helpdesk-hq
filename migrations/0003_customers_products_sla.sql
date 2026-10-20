CREATE TABLE customers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id),
  code           text NOT NULL,                 -- shown to people: CUS-10442
  legacy_number  int,                           -- older tickets mention 10442 without the prefix
  name           text NOT NULL,
  email          text NOT NULL,
  language       text NOT NULL DEFAULT 'en',
  plan           text NOT NULL DEFAULT 'standard' CHECK (plan IN ('standard', 'priority', 'enterprise')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code),
  UNIQUE (tenant_id, email)
);

CREATE TABLE products (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES tenants(id),
  name       text NOT NULL,
  UNIQUE (tenant_id, name)
);

CREATE TABLE sla_policies (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id),
  name                 text NOT NULL,
  plan                 text NOT NULL CHECK (plan IN ('standard', 'priority', 'enterprise')),
  first_response_mins  int NOT NULL CHECK (first_response_mins > 0),   -- business minutes
  resolution_mins      int NOT NULL CHECK (resolution_mins > 0),       -- business minutes
  UNIQUE (tenant_id, plan)
);
