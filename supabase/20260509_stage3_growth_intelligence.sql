CREATE OR REPLACE FUNCTION public.classify_growth_service_key(raw_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog, public
AS $$
DECLARE
  normalized_path TEXT := public.normalize_growth_path(raw_path, '/');
BEGIN
  IF normalized_path = '/salon'
     OR normalized_path LIKE '/salon/%'
     OR normalized_path LIKE '%salon%' THEN
    RETURN 'salon';
  END IF;

  IF normalized_path = '/tapisserie'
     OR normalized_path LIKE '/tapisserie/%'
     OR normalized_path LIKE '%tapisserie%' THEN
    RETURN 'tapisserie';
  END IF;

  IF normalized_path = '/tapis'
     OR normalized_path LIKE '/tapis/%'
     OR normalized_path LIKE '%tapis%' THEN
    RETURN 'tapis';
  END IF;

  IF normalized_path = '/marbre'
     OR normalized_path LIKE '/marbre/%'
     OR normalized_path LIKE '%marbre%' THEN
    RETURN 'marbre';
  END IF;

  IF normalized_path = '/tfc'
     OR normalized_path LIKE '/tfc/%'
     OR normalized_path LIKE '%tfc%' THEN
    RETURN 'tfc';
  END IF;

  IF normalized_path LIKE '%hotel%' THEN
    RETURN 'hotel';
  END IF;

  IF normalized_path LIKE '%banque%' THEN
    RETURN 'banque';
  END IF;

  IF normalized_path LIKE '%assurance%' THEN
    RETURN 'assurance';
  END IF;

  IF normalized_path LIKE '%clinique%' THEN
    RETURN 'clinique';
  END IF;

  IF normalized_path LIKE '%bureau%' THEN
    RETURN 'bureau';
  END IF;

  IF normalized_path LIKE '%commerce%' THEN
    RETURN 'commerce';
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.classify_growth_business_line(raw_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog, public
AS $$
DECLARE
  normalized_path TEXT := public.normalize_growth_path(raw_path, '/');
  service_key TEXT := public.classify_growth_service_key(raw_path);
BEGIN
  IF normalized_path = '/entreprises'
     OR normalized_path LIKE '/entreprises/%' THEN
    RETURN 'b2b';
  END IF;

  IF service_key IN ('hotel', 'banque', 'assurance', 'clinique', 'bureau', 'commerce') THEN
    RETURN 'b2b';
  END IF;

  IF service_key IN ('salon', 'tapis', 'tapisserie', 'marbre', 'tfc') THEN
    RETURN 'b2c';
  END IF;

  RETURN 'unknown';
END;
$$;

CREATE TABLE IF NOT EXISTS public.growth_query_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  query TEXT NOT NULL,
  normalized_query TEXT NOT NULL,
  landing_page TEXT NOT NULL DEFAULT '/',
  normalized_landing_page TEXT NOT NULL DEFAULT '/',
  keyword_catalog_id UUID REFERENCES public.growth_keyword_catalog(id) ON DELETE SET NULL,
  cluster_key TEXT,
  cluster_label TEXT,
  business_line TEXT NOT NULL DEFAULT 'unknown',
  service_key TEXT,
  page_type TEXT NOT NULL DEFAULT 'other',
  clicks INTEGER NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  impressions INTEGER NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  ctr NUMERIC(8, 2),
  position NUMERIC(8, 2),
  is_branded BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (metric_date, normalized_query, normalized_landing_page)
);

CREATE INDEX IF NOT EXISTS idx_growth_query_daily_metrics_metric_date
  ON public.growth_query_daily_metrics(metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_growth_query_daily_metrics_query
  ON public.growth_query_daily_metrics(normalized_query, metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_growth_query_daily_metrics_landing_page
  ON public.growth_query_daily_metrics(normalized_landing_page, metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_growth_query_daily_metrics_keyword_catalog
  ON public.growth_query_daily_metrics(keyword_catalog_id, metric_date DESC);

ALTER TABLE public.growth_query_daily_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin users to read growth query metrics" ON public.growth_query_daily_metrics;
CREATE POLICY "Allow admin users to read growth query metrics" ON public.growth_query_daily_metrics
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

DROP TRIGGER IF EXISTS trigger_touch_growth_query_daily_metrics_updated_at ON public.growth_query_daily_metrics;
CREATE TRIGGER trigger_touch_growth_query_daily_metrics_updated_at
  BEFORE UPDATE ON public.growth_query_daily_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_growth_reporting_updated_at();

CREATE OR REPLACE VIEW public.growth_keyword_clusters AS
SELECT
  catalog.id AS keyword_catalog_id,
  catalog.normalized_keyword,
  catalog.display_keyword,
  catalog.canonical_target_url,
  catalog.canonical_target_path,
  catalog.target_domain,
  COALESCE(
    NULLIF(LOWER(BTRIM(COALESCE(catalog.category_tags[1], ''))), ''),
    COALESCE(public.classify_growth_service_key(catalog.canonical_target_path), public.classify_growth_page_type(catalog.canonical_target_path), 'other')
  ) AS cluster_key,
  COALESCE(
    NULLIF(BTRIM(COALESCE(catalog.category_tags[1], '')), ''),
    COALESCE(INITCAP(REPLACE(public.classify_growth_service_key(catalog.canonical_target_path), '_', ' ')), INITCAP(REPLACE(public.classify_growth_page_type(catalog.canonical_target_path), '_', ' ')), 'Other')
  ) AS cluster_label,
  public.classify_growth_business_line(catalog.canonical_target_path) AS business_line,
  public.classify_growth_service_key(catalog.canonical_target_path) AS service_key,
  public.classify_growth_page_type(catalog.canonical_target_path) AS page_type,
  catalog.category_tags,
  catalog.search_intent_tags,
  catalog.content_type_tags,
  catalog.priority_tags,
  catalog.reference_clicks,
  catalog.reference_impressions,
  catalog.reference_current_position,
  catalog.reference_ctr,
  catalog.reference_search_volume,
  catalog.reference_last_updated
FROM public.growth_keyword_catalog AS catalog
WHERE catalog.active = TRUE;

CREATE OR REPLACE VIEW public.growth_funnel_daily_metrics AS
SELECT
  DATE(lead.created_at) AS metric_date,
  lead.business_line,
  lead.primary_service AS service_key,
  lead.source_class,
  lead.page_type,
  COUNT(*) AS created_leads,
  COUNT(*) FILTER (
    WHERE lead.lead_status IN ('qualified', 'closed_won', 'closed_lost')
       OR lead.qualified_at IS NOT NULL
  ) AS qualified_leads,
  COUNT(*) FILTER (WHERE lead.lead_status = 'closed_won') AS won_leads,
  COUNT(*) FILTER (WHERE lead.lead_status = 'closed_lost') AS lost_leads,
  COALESCE(ROUND(((COUNT(*) FILTER (
    WHERE lead.lead_status IN ('qualified', 'closed_won', 'closed_lost')
       OR lead.qualified_at IS NOT NULL
  ))::NUMERIC * 100.0) / NULLIF(COUNT(*), 0), 1), 0) AS qualified_rate,
  COALESCE(ROUND(((COUNT(*) FILTER (WHERE lead.lead_status = 'closed_won'))::NUMERIC * 100.0) / NULLIF(COUNT(*), 0), 1), 0) AS win_rate
FROM public.growth_lead_reporting_dimensions AS lead
GROUP BY
  DATE(lead.created_at),
  lead.business_line,
  lead.primary_service,
  lead.source_class,
  lead.page_type;

CREATE OR REPLACE VIEW public.growth_landing_page_scores_daily AS
WITH metric_base AS (
  SELECT
    metric.metric_date,
    metric.normalized_landing_page AS landing_page,
    metric.source_class,
    metric.page_type,
    public.classify_growth_business_line(metric.normalized_landing_page) AS business_line,
    public.classify_growth_service_key(metric.normalized_landing_page) AS service_key,
    SUM(metric.sessions) AS sessions,
    SUM(metric.users) AS users,
    SUM(metric.clicks) AS clicks,
    SUM(metric.impressions) AS impressions,
    SUM(metric.spend) AS spend
  FROM public.growth_channel_daily_metrics_normalized AS metric
  GROUP BY
    metric.metric_date,
    metric.normalized_landing_page,
    metric.source_class,
    metric.page_type,
    public.classify_growth_business_line(metric.normalized_landing_page),
    public.classify_growth_service_key(metric.normalized_landing_page)
),
lead_base AS (
  SELECT
    DATE(lead.created_at) AS metric_date,
    lead.normalized_landing_page AS landing_page,
    lead.source_class,
    lead.page_type,
    lead.business_line,
    lead.primary_service AS service_key,
    COUNT(*) AS leads,
    COUNT(*) FILTER (
      WHERE lead.lead_status IN ('qualified', 'closed_won', 'closed_lost')
         OR lead.qualified_at IS NOT NULL
    ) AS qualified_leads,
    COUNT(*) FILTER (WHERE lead.lead_status = 'closed_won') AS won_leads,
    SUM(COALESCE(lead.calculator_estimate, 0)) AS revenue_proxy
  FROM public.growth_lead_reporting_dimensions AS lead
  GROUP BY
    DATE(lead.created_at),
    lead.normalized_landing_page,
    lead.source_class,
    lead.page_type,
    lead.business_line,
    lead.primary_service
)
SELECT
  COALESCE(metric_base.metric_date, lead_base.metric_date) AS metric_date,
  COALESCE(metric_base.landing_page, lead_base.landing_page) AS landing_page,
  COALESCE(metric_base.source_class, lead_base.source_class, 'other') AS source_class,
  COALESCE(metric_base.page_type, lead_base.page_type, public.classify_growth_page_type(COALESCE(metric_base.landing_page, lead_base.landing_page))) AS page_type,
  COALESCE(metric_base.business_line, lead_base.business_line, public.classify_growth_business_line(COALESCE(metric_base.landing_page, lead_base.landing_page))) AS business_line,
  COALESCE(metric_base.service_key, lead_base.service_key, public.classify_growth_service_key(COALESCE(metric_base.landing_page, lead_base.landing_page))) AS service_key,
  COALESCE(metric_base.sessions, 0) AS sessions,
  COALESCE(metric_base.users, 0) AS users,
  COALESCE(metric_base.clicks, 0) AS clicks,
  COALESCE(metric_base.impressions, 0) AS impressions,
  COALESCE(metric_base.spend, 0) AS spend,
  COALESCE(lead_base.leads, 0) AS leads,
  COALESCE(lead_base.qualified_leads, 0) AS qualified_leads,
  COALESCE(lead_base.won_leads, 0) AS won_leads,
  COALESCE(lead_base.revenue_proxy, 0) AS revenue_proxy,
  COALESCE(ROUND((COALESCE(metric_base.clicks, 0)::NUMERIC * 100.0) / NULLIF(COALESCE(metric_base.impressions, 0), 0), 1), 0) AS ctr,
  COALESCE(ROUND((COALESCE(lead_base.leads, 0)::NUMERIC * 100.0) / NULLIF(COALESCE(metric_base.sessions, 0), 0), 1), 0) AS lead_rate,
  COALESCE(ROUND((COALESCE(lead_base.qualified_leads, 0)::NUMERIC * 100.0) / NULLIF(COALESCE(lead_base.leads, 0), 0), 1), 0) AS qualified_rate,
  COALESCE(ROUND((COALESCE(lead_base.won_leads, 0)::NUMERIC * 100.0) / NULLIF(COALESCE(lead_base.leads, 0), 0), 1), 0) AS win_rate,
  ROUND(
    (COALESCE(lead_base.qualified_leads, 0) * 25)
    + (COALESCE(lead_base.won_leads, 0) * 50)
    + (LEAST(COALESCE(metric_base.clicks, 0), 500) / 10.0)
    + (LEAST(COALESCE(lead_base.revenue_proxy, 0), 5000) / 250.0)
    + COALESCE((COALESCE(lead_base.leads, 0)::NUMERIC * 100.0) / NULLIF(COALESCE(metric_base.sessions, 0), 0), 0),
    1
  ) AS opportunity_score
FROM metric_base
FULL OUTER JOIN lead_base
  ON metric_base.metric_date = lead_base.metric_date
 AND metric_base.landing_page = lead_base.landing_page
 AND metric_base.source_class = lead_base.source_class
 AND metric_base.page_type = lead_base.page_type
 AND metric_base.business_line = lead_base.business_line
 AND (
   metric_base.service_key IS NOT DISTINCT FROM lead_base.service_key
 );
