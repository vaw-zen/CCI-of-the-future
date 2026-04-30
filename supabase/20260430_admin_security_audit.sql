CREATE TABLE IF NOT EXISTS public.admin_lead_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lead_kind TEXT NOT NULL CHECK (lead_kind IN ('devis', 'convention', 'unknown')),
  lead_table TEXT,
  lead_id UUID,
  previous_status TEXT,
  next_status TEXT,
  previous_operational_status TEXT,
  next_operational_status TEXT,
  admin_email TEXT,
  admin_user_id UUID,
  action_result TEXT NOT NULL CHECK (action_result IN ('success', 'rejected')),
  rejection_reason TEXT,
  request_ip TEXT,
  user_agent_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_lead_status_events_created_at
  ON public.admin_lead_status_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_lead_status_events_lead
  ON public.admin_lead_status_events(lead_kind, lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_lead_status_events_admin_email
  ON public.admin_lead_status_events(admin_email, created_at DESC);

ALTER TABLE public.admin_lead_status_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin users to read lead status audit events"
  ON public.admin_lead_status_events;

CREATE POLICY "Allow admin users to read lead status audit events"
  ON public.admin_lead_status_events
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

-- Convention mutations now go through /api/admin/leads/[kind]/[id]/status.
-- Browser Supabase access remains read-only for authenticated admin dashboards.
DROP POLICY IF EXISTS "Allow admin users to update convention requests"
  ON public.convention_requests;
