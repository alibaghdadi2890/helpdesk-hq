-- Tenants: the companies that use Helpdesk HQ. The only table without tenant_id.
CREATE TABLE tenants (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  text UNIQUE NOT NULL,          -- hq, cedar-bank, souk-market
  name                  text NOT NULL,
  -- Business calendar used by the SLA calculator (src/domain/sla.ts).
  -- A fixed UTC offset: daylight saving time is not modelled.
  utc_offset_minutes    int  NOT NULL DEFAULT 0,
  workdays              int[] NOT NULL DEFAULT '{1,2,3,4,5}',   -- ISO weekdays, 1 = Monday
  work_start_hour       int  NOT NULL DEFAULT 9,
  work_end_hour         int  NOT NULL DEFAULT 17,
  next_ticket_number    int  NOT NULL DEFAULT 1001,
  next_customer_number  int  NOT NULL DEFAULT 10001,
  created_at            timestamptz NOT NULL DEFAULT now(),
  CHECK (work_start_hour >= 0 AND work_end_hour <= 24 AND work_start_hour < work_end_hour)
);
