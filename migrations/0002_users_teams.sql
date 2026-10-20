CREATE TABLE users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  email       text NOT NULL,
  name        text NOT NULL,
  role        text NOT NULL CHECK (role IN ('agent', 'lead', 'admin')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE teams (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  name         text NOT NULL,
  description  text NOT NULL DEFAULT '',   -- used by the Triage Agent in Chapter 3
  UNIQUE (tenant_id, name)
);

CREATE TABLE team_members (
  tenant_id  uuid NOT NULL REFERENCES tenants(id),
  team_id    uuid NOT NULL REFERENCES teams(id),
  user_id    uuid NOT NULL REFERENCES users(id),
  PRIMARY KEY (team_id, user_id)
);
