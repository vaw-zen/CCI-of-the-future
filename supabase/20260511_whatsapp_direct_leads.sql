CREATE TABLE IF NOT EXISTS public.whatsapp_direct_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lead_captured_at TIMESTAMPTZ NOT NULL,
  business_line TEXT NOT NULL CHECK (business_line IN ('b2c', 'b2b')),
  contact_name TEXT NOT NULL,
  company_name TEXT,
  telephone TEXT NOT NULL,
  email TEXT,
  service_key TEXT,
  notes TEXT,
  scheduled_type TEXT,
  scheduled_at TIMESTAMPTZ,
  lead_status TEXT NOT NULL DEFAULT 'submitted' CHECK (lead_status IN ('submitted', 'qualified', 'closed_won', 'closed_lost')),
  lead_quality_outcome TEXT NOT NULL DEFAULT 'unreviewed' CHECK (lead_quality_outcome IN ('unreviewed', 'sales_accepted', 'sales_rejected', 'won', 'lost')),
  lead_owner TEXT,
  submitted_at TIMESTAMPTZ NOT NULL,
  qualified_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  follow_up_sla_at TIMESTAMPTZ,
  last_worked_at TIMESTAMPTZ,
  session_source TEXT NOT NULL DEFAULT 'whatsapp',
  session_medium TEXT NOT NULL DEFAULT 'messaging',
  session_campaign TEXT NOT NULL DEFAULT 'direct_chat',
  referrer_host TEXT,
  landing_page TEXT,
  entry_path TEXT,
  whatsapp_manual_tag BOOLEAN NOT NULL DEFAULT TRUE,
  whatsapp_manual_tagged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT whatsapp_direct_leads_company_required
    CHECK (business_line <> 'b2b' OR company_name IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_direct_leads_captured_at
  ON public.whatsapp_direct_leads(lead_captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_direct_leads_status
  ON public.whatsapp_direct_leads(lead_status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_direct_leads_business_line
  ON public.whatsapp_direct_leads(business_line);

CREATE INDEX IF NOT EXISTS idx_whatsapp_direct_leads_telephone
  ON public.whatsapp_direct_leads(telephone);

ALTER TABLE public.whatsapp_direct_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin users to read whatsapp direct leads" ON public.whatsapp_direct_leads;
CREATE POLICY "Allow admin users to read whatsapp direct leads" ON public.whatsapp_direct_leads
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

CREATE OR REPLACE FUNCTION public.touch_whatsapp_direct_leads_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_touch_whatsapp_direct_leads_updated_at ON public.whatsapp_direct_leads;
CREATE TRIGGER trigger_touch_whatsapp_direct_leads_updated_at
  BEFORE UPDATE ON public.whatsapp_direct_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_whatsapp_direct_leads_updated_at();

ALTER TABLE public.admin_lead_status_events
  DROP CONSTRAINT IF EXISTS admin_lead_status_events_lead_kind_check;

ALTER TABLE public.admin_lead_status_events
  ADD CONSTRAINT admin_lead_status_events_lead_kind_check
  CHECK (lead_kind IN ('devis', 'convention', 'whatsapp', 'unknown'));
