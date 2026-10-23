ALTER TABLE tickets
  ADD COLUMN priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

CREATE INDEX ix_tickets_priority ON tickets (tenant_id, priority, created_at DESC);
