CREATE INDEX ix_tickets_queue ON tickets (tenant_id, status, created_at DESC);
CREATE INDEX ix_tickets_customer ON tickets (tenant_id, customer_id, created_at DESC);
CREATE INDEX ix_tickets_product_created ON tickets (tenant_id, product_id, created_at DESC);
CREATE INDEX ix_messages_ticket ON messages (ticket_id, created_at);
CREATE INDEX ix_kb_fts ON kb_articles
  USING gin (to_tsvector('simple', title || ' ' || body));
