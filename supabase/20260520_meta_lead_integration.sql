ALTER TABLE IF EXISTS public.devis_requests
  ADD COLUMN IF NOT EXISTS fbclid TEXT,
  ADD COLUMN IF NOT EXISTS meta_fbc TEXT,
  ADD COLUMN IF NOT EXISTS meta_fbp TEXT,
  ADD COLUMN IF NOT EXISTS meta_platform TEXT
    CHECK (meta_platform IN ('facebook', 'instagram')),
  ADD COLUMN IF NOT EXISTS meta_lead_source TEXT
    CHECK (meta_lead_source IN ('website', 'lead_ad')),
  ADD COLUMN IF NOT EXISTS meta_campaign_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_adset_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_ad_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_leadgen_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_form_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_page_id TEXT;

ALTER TABLE IF EXISTS public.convention_requests
  ADD COLUMN IF NOT EXISTS fbclid TEXT,
  ADD COLUMN IF NOT EXISTS meta_fbc TEXT,
  ADD COLUMN IF NOT EXISTS meta_fbp TEXT,
  ADD COLUMN IF NOT EXISTS meta_platform TEXT
    CHECK (meta_platform IN ('facebook', 'instagram')),
  ADD COLUMN IF NOT EXISTS meta_lead_source TEXT
    CHECK (meta_lead_source IN ('website', 'lead_ad')),
  ADD COLUMN IF NOT EXISTS meta_campaign_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_adset_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_ad_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_leadgen_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_form_id TEXT,
  ADD COLUMN IF NOT EXISTS meta_page_id TEXT;

CREATE INDEX IF NOT EXISTS idx_devis_requests_meta_platform
  ON public.devis_requests(meta_platform)
  WHERE meta_platform IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_devis_requests_meta_lead_source
  ON public.devis_requests(meta_lead_source)
  WHERE meta_lead_source IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_devis_requests_meta_leadgen_id
  ON public.devis_requests(meta_leadgen_id)
  WHERE meta_leadgen_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_convention_requests_meta_platform
  ON public.convention_requests(meta_platform)
  WHERE meta_platform IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_convention_requests_meta_lead_source
  ON public.convention_requests(meta_lead_source)
  WHERE meta_lead_source IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_convention_requests_meta_leadgen_id
  ON public.convention_requests(meta_leadgen_id)
  WHERE meta_leadgen_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.meta_lead_form_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta_form_id TEXT NOT NULL UNIQUE,
  form_label TEXT,
  target_kind TEXT NOT NULL DEFAULT 'standalone'
    CHECK (target_kind IN ('devis', 'convention', 'standalone')),
  business_line TEXT
    CHECK (business_line IN ('b2c', 'b2b')),
  default_service_type TEXT,
  auto_create_enabled BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.meta_lead_ad_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lead_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta_leadgen_id TEXT NOT NULL UNIQUE,
  meta_form_id TEXT,
  meta_page_id TEXT,
  meta_platform TEXT NOT NULL DEFAULT 'facebook'
    CHECK (meta_platform IN ('facebook', 'instagram')),
  meta_campaign_id TEXT,
  meta_adset_id TEXT,
  meta_ad_id TEXT,
  campaign_name TEXT,
  adset_name TEXT,
  ad_name TEXT,
  contact_name TEXT,
  company_name TEXT,
  email TEXT,
  telephone TEXT,
  field_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  mapping_status TEXT NOT NULL DEFAULT 'unmapped'
    CHECK (mapping_status IN ('unmapped', 'mapped_pending', 'mapped_ready', 'mapped_created', 'partial', 'fetch_pending', 'error')),
  mapped_lead_kind TEXT
    CHECK (mapped_lead_kind IN ('devis', 'convention', 'standalone')),
  mapped_lead_id UUID,
  auto_created_at TIMESTAMPTZ,
  last_error TEXT,
  session_source TEXT NOT NULL DEFAULT 'facebook',
  session_medium TEXT NOT NULL DEFAULT 'paid_social',
  session_campaign TEXT NOT NULL DEFAULT '(not set)'
);

CREATE TABLE IF NOT EXISTS public.meta_conversion_event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  lead_kind TEXT,
  lead_id UUID,
  meta_fbc TEXT,
  meta_fbp TEXT,
  send_status TEXT NOT NULL,
  response_summary JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_meta_conversion_event_log_event
  ON public.meta_conversion_event_log(event_id, event_name);

CREATE INDEX IF NOT EXISTS idx_meta_lead_ad_submissions_synced_at
  ON public.meta_lead_ad_submissions(synced_at DESC);

CREATE INDEX IF NOT EXISTS idx_meta_lead_ad_submissions_mapping_status
  ON public.meta_lead_ad_submissions(mapping_status);

CREATE INDEX IF NOT EXISTS idx_meta_lead_ad_submissions_meta_form_id
  ON public.meta_lead_ad_submissions(meta_form_id)
  WHERE meta_form_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_meta_lead_ad_submissions_meta_platform
  ON public.meta_lead_ad_submissions(meta_platform);

CREATE INDEX IF NOT EXISTS idx_meta_conversion_event_log_created_at
  ON public.meta_conversion_event_log(created_at DESC);

ALTER TABLE public.meta_lead_form_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_lead_ad_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_conversion_event_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin users to read meta lead form mappings" ON public.meta_lead_form_mappings;
CREATE POLICY "Allow admin users to read meta lead form mappings" ON public.meta_lead_form_mappings
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Allow admin users to read meta lead ad submissions" ON public.meta_lead_ad_submissions;
CREATE POLICY "Allow admin users to read meta lead ad submissions" ON public.meta_lead_ad_submissions
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Allow admin users to read meta conversion event log" ON public.meta_conversion_event_log;
CREATE POLICY "Allow admin users to read meta conversion event log" ON public.meta_conversion_event_log
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

DROP TRIGGER IF EXISTS trigger_touch_meta_lead_form_mappings_updated_at ON public.meta_lead_form_mappings;
CREATE TRIGGER trigger_touch_meta_lead_form_mappings_updated_at
  BEFORE UPDATE ON public.meta_lead_form_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_growth_reporting_updated_at();

DROP TRIGGER IF EXISTS trigger_touch_meta_lead_ad_submissions_updated_at ON public.meta_lead_ad_submissions;
CREATE TRIGGER trigger_touch_meta_lead_ad_submissions_updated_at
  BEFORE UPDATE ON public.meta_lead_ad_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_growth_reporting_updated_at();

CREATE OR REPLACE VIEW public.growth_lead_reporting_dimensions AS
SELECT
  'devis'::TEXT AS lead_kind,
  lead.id,
  lead.created_at,
  lead.submitted_at,
  lead.qualified_at,
  lead.closed_at,
  lead.lead_status,
  lead.lead_quality_outcome,
  lead.lead_owner,
  lead.follow_up_sla_at,
  lead.last_worked_at,
  'b2c'::TEXT AS business_line,
  lead.type_service AS primary_service,
  COALESCE(lead.selected_services, ARRAY[lead.type_service]) AS service_keys,
  lead.ga_client_id,
  lead.landing_page,
  lead.entry_path,
  lead.referrer_host,
  lead.session_source,
  lead.session_medium,
  lead.session_campaign,
  public.normalize_growth_dimension_text(lead.session_source, 'direct') AS normalized_source,
  public.normalize_growth_dimension_text(lead.session_medium, '(none)') AS normalized_medium,
  public.normalize_growth_dimension_text(lead.session_campaign, '(not set)') AS normalized_campaign,
  public.normalize_growth_path(COALESCE(lead.landing_page, lead.entry_path), '/') AS normalized_landing_page,
  public.classify_growth_source_class(lead.session_source, lead.session_medium) AS source_class,
  public.classify_growth_page_type(COALESCE(lead.landing_page, lead.entry_path)) AS page_type,
  lead.calculator_estimate,
  lead.whatsapp_click_id,
  lead.whatsapp_clicked_at,
  lead.whatsapp_click_label,
  lead.whatsapp_click_page,
  lead.whatsapp_manual_tag,
  lead.whatsapp_manual_tagged_at,
  NULL::TEXT AS operational_status,
  lead.fbclid,
  lead.meta_fbc,
  lead.meta_fbp,
  lead.meta_platform,
  lead.meta_lead_source,
  lead.meta_campaign_id,
  lead.meta_adset_id,
  lead.meta_ad_id,
  lead.meta_leadgen_id,
  lead.meta_form_id,
  lead.meta_page_id
FROM public.devis_requests AS lead

UNION ALL

SELECT
  'convention'::TEXT AS lead_kind,
  lead.id,
  lead.created_at,
  lead.submitted_at,
  lead.qualified_at,
  lead.closed_at,
  lead.lead_status,
  lead.lead_quality_outcome,
  lead.lead_owner,
  lead.follow_up_sla_at,
  lead.last_worked_at,
  'b2b'::TEXT AS business_line,
  COALESCE(lead.selected_services[1], lead.services_souhaites[1], lead.secteur_activite) AS primary_service,
  COALESCE(lead.selected_services, lead.services_souhaites, ARRAY[lead.secteur_activite]) AS service_keys,
  lead.ga_client_id,
  lead.landing_page,
  lead.entry_path,
  lead.referrer_host,
  lead.session_source,
  lead.session_medium,
  lead.session_campaign,
  public.normalize_growth_dimension_text(lead.session_source, 'direct') AS normalized_source,
  public.normalize_growth_dimension_text(lead.session_medium, '(none)') AS normalized_medium,
  public.normalize_growth_dimension_text(lead.session_campaign, '(not set)') AS normalized_campaign,
  public.normalize_growth_path(COALESCE(lead.landing_page, lead.entry_path), '/') AS normalized_landing_page,
  public.classify_growth_source_class(lead.session_source, lead.session_medium) AS source_class,
  public.classify_growth_page_type(COALESCE(lead.landing_page, lead.entry_path)) AS page_type,
  lead.calculator_estimate,
  lead.whatsapp_click_id,
  lead.whatsapp_clicked_at,
  lead.whatsapp_click_label,
  lead.whatsapp_click_page,
  lead.whatsapp_manual_tag,
  lead.whatsapp_manual_tagged_at,
  lead.statut AS operational_status,
  lead.fbclid,
  lead.meta_fbc,
  lead.meta_fbp,
  lead.meta_platform,
  lead.meta_lead_source,
  lead.meta_campaign_id,
  lead.meta_adset_id,
  lead.meta_ad_id,
  lead.meta_leadgen_id,
  lead.meta_form_id,
  lead.meta_page_id
FROM public.convention_requests AS lead;
