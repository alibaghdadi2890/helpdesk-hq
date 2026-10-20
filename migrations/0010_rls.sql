-- Row-level security. The app connects as helpdesk_app, which does not own the tables,
-- so these policies apply to every query it makes. Each request sets app.tenant_id
-- inside its transaction (src/db/tenant.ts). If it is not set, no rows match.
-- nullif(..., '') matters: once a connection has set app.tenant_id, PostgreSQL resets it to
-- an empty string (not NULL) when the transaction ends, and ''::uuid would raise an error.

DO $$
BEGIN
  CREATE ROLE helpdesk_app LOGIN PASSWORD 'helpdesk_app';
EXCEPTION WHEN duplicate_object THEN
  NULL;   -- roles are cluster-wide; the test database reuses it
END
$$;

GRANT USAGE ON SCHEMA public TO helpdesk_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO helpdesk_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO helpdesk_app;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users', 'teams', 'team_members', 'customers', 'products',
                           'sla_policies', 'tickets', 'messages', 'kb_articles']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (tenant_id = nullif(current_setting(''app.tenant_id'', true), '''')::uuid)',
      t);
  END LOOP;
END
$$;

-- Login happens before the tenant is known, so it needs one narrow way to find a user
-- by email. SECURITY DEFINER runs as the owner, which bypasses RLS, and returns only
-- what login needs.
CREATE FUNCTION auth_find_user(p_email text)
RETURNS TABLE (id uuid, tenant_id uuid, name text, role text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, tenant_id, name, role FROM users WHERE lower(email) = lower(p_email)
$$;
REVOKE ALL ON FUNCTION auth_find_user(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION auth_find_user(text) TO helpdesk_app;
