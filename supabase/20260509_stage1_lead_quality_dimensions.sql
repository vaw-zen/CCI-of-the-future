ALTER TABLE IF EXISTS public.devis_requests
  ADD COLUMN IF NOT EXISTS lead_quality_outcome TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (lead_quality_outcome IN ('unreviewed', 'sales_accepted', 'sales_rejected', 'won', 'lost')),
  ADD COLUMN IF NOT EXISTS lead_owner TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_sla_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_worked_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.convention_requests
  ADD COLUMN IF NOT EXISTS lead_quality_outcome TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (lead_quality_outcome IN ('unreviewed', 'sales_accepted', 'sales_rejected', 'won', 'lost')),
  ADD COLUMN IF NOT EXISTS lead_owner TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_sla_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_worked_at TIMESTAMPTZ;

UPDATE public.devis_requests
SET
  lead_quality_outcome = CASE
    WHEN lead_status = 'qualified' THEN 'sales_accepted'
    WHEN lead_status = 'closed_won' THEN 'won'
    WHEN lead_status = 'closed_lost' THEN 'lost'
    ELSE 'unreviewed'
  END,
  follow_up_sla_at = COALESCE(follow_up_sla_at, COALESCE(submitted_at, created_at) + INTERVAL '24 hours'),
  last_worked_at = COALESCE(last_worked_at, closed_at, qualified_at, submitted_at, created_at)
WHERE lead_quality_outcome IS NULL
   OR follow_up_sla_at IS NULL
   OR last_worked_at IS NULL;

UPDATE public.convention_requests
SET
  lead_quality_outcome = CASE
    WHEN lead_status = 'qualified' THEN 'sales_accepted'
    WHEN lead_status = 'closed_won' THEN 'won'
    WHEN lead_status = 'closed_lost' THEN 'lost'
    ELSE 'unreviewed'
  END,
  follow_up_sla_at = COALESCE(follow_up_sla_at, COALESCE(submitted_at, created_at) + INTERVAL '24 hours'),
  last_worked_at = COALESCE(last_worked_at, updated_at, closed_at, qualified_at, submitted_at, created_at)
WHERE lead_quality_outcome IS NULL
   OR follow_up_sla_at IS NULL
   OR last_worked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_devis_requests_lead_quality_outcome
  ON public.devis_requests(lead_quality_outcome);

CREATE INDEX IF NOT EXISTS idx_devis_requests_lead_owner
  ON public.devis_requests(lead_owner)
  WHERE lead_owner IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_devis_requests_follow_up_sla_at
  ON public.devis_requests(follow_up_sla_at DESC);

CREATE INDEX IF NOT EXISTS idx_devis_requests_last_worked_at
  ON public.devis_requests(last_worked_at DESC);

CREATE INDEX IF NOT EXISTS idx_convention_requests_lead_quality_outcome
  ON public.convention_requests(lead_quality_outcome);

CREATE INDEX IF NOT EXISTS idx_convention_requests_lead_owner
  ON public.convention_requests(lead_owner)
  WHERE lead_owner IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_convention_requests_follow_up_sla_at
  ON public.convention_requests(follow_up_sla_at DESC);

CREATE INDEX IF NOT EXISTS idx_convention_requests_last_worked_at
  ON public.convention_requests(last_worked_at DESC);

CREATE OR REPLACE FUNCTION public.normalize_growth_dimension_text(raw_value TEXT, fallback TEXT DEFAULT '')
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog, public
AS $$
DECLARE
  cleaned_value TEXT;
BEGIN
  cleaned_value := LOWER(BTRIM(COALESCE(raw_value, '')));
  IF cleaned_value = '' THEN
    RETURN LOWER(BTRIM(COALESCE(fallback, '')));
  END IF;

  RETURN cleaned_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_growth_path(raw_value TEXT, fallback TEXT DEFAULT '/')
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog, public
AS $$
DECLARE
  cleaned_value TEXT;
  extracted_path TEXT;
BEGIN
  cleaned_value := BTRIM(COALESCE(raw_value, ''));

  IF cleaned_value = '' THEN
    RETURN COALESCE(NULLIF(BTRIM(fallback), ''), '/');
  END IF;

  IF cleaned_value ~* '^https?://' THEN
    extracted_path := SUBSTRING(cleaned_value FROM 'https?://[^/]+(/[^?#]*)');
    cleaned_value := COALESCE(NULLIF(extracted_path, ''), '/');
  END IF;

  IF LEFT(cleaned_value, 1) <> '/' THEN
    cleaned_value := '/' || cleaned_value;
  END IF;

  RETURN cleaned_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.classify_growth_source_class(raw_source TEXT, raw_medium TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog, public
AS $$
DECLARE
  normalized_source TEXT := public.normalize_growth_dimension_text(raw_source, 'unknown');
  normalized_medium TEXT := public.normalize_growth_dimension_text(raw_medium, '(none)');
BEGIN
  IF normalized_medium = 'paid_social' THEN
    RETURN 'paid_social';
  END IF;

  IF normalized_medium = 'organic'
     OR normalized_source IN ('google', 'bing') THEN
    RETURN 'organic_search';
  END IF;

  IF normalized_medium IN ('cpc', 'ppc', 'paid', 'display', 'affiliate')
     OR normalized_source LIKE 'google_ads%'
     OR normalized_source LIKE 'meta_ads%'
     OR normalized_source LIKE 'facebook_ads%' THEN
    RETURN 'paid_media';
  END IF;

  IF normalized_medium = 'social'
     OR normalized_source IN ('facebook', 'instagram', 'linkedin', 'tiktok') THEN
    RETURN 'organic_social';
  END IF;

  IF normalized_medium = 'referral' THEN
    RETURN 'referral';
  END IF;

  IF normalized_medium = 'messaging'
     OR normalized_source = 'whatsapp' THEN
    RETURN 'messaging';
  END IF;

  IF normalized_medium = 'email'
     OR normalized_source IN ('email', 'newsletter') THEN
    RETURN 'email';
  END IF;

  IF normalized_source IN ('', 'direct', '(direct)', 'unknown')
     AND normalized_medium IN ('', '(none)', 'none', '(not set)', 'unknown') THEN
    RETURN 'direct';
  END IF;

  RETURN 'other';
END;
$$;

CREATE OR REPLACE FUNCTION public.classify_growth_page_type(raw_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog, public
AS $$
DECLARE
  normalized_path TEXT := public.normalize_growth_path(raw_path, '/');
BEGIN
  IF normalized_path = '/' THEN
    RETURN 'home';
  END IF;

  IF normalized_path = '/services'
     OR normalized_path = '/entreprises'
     OR normalized_path = '/salon'
     OR normalized_path = '/tapis'
     OR normalized_path = '/tapisserie'
     OR normalized_path = '/marbre'
     OR normalized_path = '/tfc' THEN
    RETURN 'service';
  END IF;

  IF normalized_path = '/contact' THEN
    RETURN 'contact';
  END IF;

  IF normalized_path = '/devis' THEN
    RETURN 'quote';
  END IF;

  IF normalized_path LIKE '/faq%' THEN
    RETURN 'faq';
  END IF;

  IF normalized_path LIKE '/about%' THEN
    RETURN 'about';
  END IF;

  IF normalized_path LIKE '/newsletter%' THEN
    RETURN 'newsletter';
  END IF;

  IF normalized_path LIKE '/admin%' THEN
    RETURN 'admin';
  END IF;

  IF normalized_path LIKE '/conseils/%' THEN
    RETURN 'article';
  END IF;

  RETURN 'other';
END;
$$;

CREATE OR REPLACE VIEW public.growth_channel_daily_metrics_normalized AS
SELECT
  metric.id,
  metric.metric_date,
  metric.metric_source,
  metric.source,
  metric.medium,
  metric.campaign,
  metric.landing_page,
  public.normalize_growth_dimension_text(metric.source, 'unknown') AS normalized_source,
  public.normalize_growth_dimension_text(metric.medium, '(none)') AS normalized_medium,
  public.normalize_growth_dimension_text(metric.campaign, '(not set)') AS normalized_campaign,
  public.normalize_growth_path(metric.landing_page, '/') AS normalized_landing_page,
  public.classify_growth_source_class(metric.source, metric.medium) AS source_class,
  public.classify_growth_page_type(metric.landing_page) AS page_type,
  metric.sessions,
  metric.users,
  metric.clicks,
  metric.impressions,
  metric.spend,
  metric.metadata,
  metric.created_at,
  metric.updated_at
FROM public.growth_channel_daily_metrics AS metric;

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
  NULL::TEXT AS operational_status
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
  lead.statut AS operational_status
FROM public.convention_requests AS lead;
