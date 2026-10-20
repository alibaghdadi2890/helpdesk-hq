CREATE TABLE kb_articles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  slug        text NOT NULL,                -- stable reference used by evals, e.g. kb-billing-duplicate-charges
  product_id  uuid REFERENCES products(id),
  title       text NOT NULL,
  body        text NOT NULL,
  language    text NOT NULL DEFAULT 'en',
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);
