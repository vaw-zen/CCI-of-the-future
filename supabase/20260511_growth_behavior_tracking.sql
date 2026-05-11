CREATE TABLE IF NOT EXISTS public.growth_behavior_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  transport_event_name TEXT NOT NULL DEFAULT 'unknown',
  event_name TEXT NOT NULL,
  page_type TEXT NOT NULL DEFAULT 'other',
  business_line TEXT NOT NULL DEFAULT 'brand',
  service_type TEXT,
  lead_type TEXT,
  form_name TEXT,
  form_placement TEXT,
  funnel_name TEXT,
  step_name TEXT,
  step_number INTEGER,
  cta_id TEXT,
  cta_location TEXT,
  cta_type TEXT,
  contact_method TEXT,
  content_type TEXT,
  content_cluster TEXT,
  landing_page TEXT NOT NULL DEFAULT '/',
  entry_path TEXT NOT NULL DEFAULT '/',
  session_source TEXT NOT NULL DEFAULT 'direct',
  session_medium TEXT NOT NULL DEFAULT '(none)',
  session_campaign TEXT NOT NULL DEFAULT '(not set)',
  ga_client_id TEXT,
  value NUMERIC(12, 2),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_growth_behavior_events_occurred_at
  ON public.growth_behavior_events(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_growth_behavior_events_event_name_occurred_at
  ON public.growth_behavior_events(event_name, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_growth_behavior_events_form_name_occurred_at
  ON public.growth_behavior_events(form_name, occurred_at DESC)
  WHERE form_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_growth_behavior_events_cta_id_occurred_at
  ON public.growth_behavior_events(cta_id, occurred_at DESC)
  WHERE cta_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_growth_behavior_events_ga_client_id_occurred_at
  ON public.growth_behavior_events(ga_client_id, occurred_at DESC)
  WHERE ga_client_id IS NOT NULL;

ALTER TABLE public.growth_behavior_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin users to read growth behavior events" ON public.growth_behavior_events;
CREATE POLICY "Allow admin users to read growth behavior events" ON public.growth_behavior_events
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

DROP TRIGGER IF EXISTS trigger_touch_growth_behavior_events_updated_at ON public.growth_behavior_events;
CREATE TRIGGER trigger_touch_growth_behavior_events_updated_at
  BEFORE UPDATE ON public.growth_behavior_events
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_growth_reporting_updated_at();

CREATE OR REPLACE VIEW public.growth_behavior_daily_metrics AS
SELECT
  DATE(event.occurred_at) AS event_date,
  event.event_name,
  event.page_type,
  CASE
    WHEN event.page_type = 'home' THEN 'home'
    WHEN event.page_type IN ('service_page', 'b2b_page') THEN 'service'
    WHEN event.page_type = 'article_page' THEN 'article'
    WHEN event.page_type = 'quote_page' THEN 'quote'
    WHEN event.page_type = 'contact_page' THEN 'contact'
    WHEN event.page_type = 'faq_page' THEN 'faq'
    WHEN event.page_type IN ('about_page', 'team_page') THEN 'about'
    ELSE 'other'
  END AS dashboard_page_type,
  public.normalize_growth_path(event.landing_page, '/') AS landing_page,
  event.business_line,
  event.service_type,
  event.form_name,
  event.form_placement,
  event.funnel_name,
  event.step_name,
  event.step_number,
  event.cta_id,
  event.cta_location,
  event.cta_type,
  event.contact_method,
  event.content_type,
  event.content_cluster,
  public.normalize_growth_dimension_text(event.session_source, 'direct') AS session_source,
  public.normalize_growth_dimension_text(event.session_medium, '(none)') AS session_medium,
  public.normalize_growth_dimension_text(event.session_campaign, '(not set)') AS session_campaign,
  public.classify_growth_source_class(event.session_source, event.session_medium) AS source_class,
  COUNT(*) AS event_count,
  COUNT(DISTINCT event.ga_client_id) FILTER (
    WHERE event.ga_client_id IS NOT NULL
      AND BTRIM(event.ga_client_id) <> ''
  ) AS unique_client_count
FROM public.growth_behavior_events AS event
GROUP BY
  DATE(event.occurred_at),
  event.event_name,
  event.page_type,
  CASE
    WHEN event.page_type = 'home' THEN 'home'
    WHEN event.page_type IN ('service_page', 'b2b_page') THEN 'service'
    WHEN event.page_type = 'article_page' THEN 'article'
    WHEN event.page_type = 'quote_page' THEN 'quote'
    WHEN event.page_type = 'contact_page' THEN 'contact'
    WHEN event.page_type = 'faq_page' THEN 'faq'
    WHEN event.page_type IN ('about_page', 'team_page') THEN 'about'
    ELSE 'other'
  END,
  public.normalize_growth_path(event.landing_page, '/'),
  event.business_line,
  event.service_type,
  event.form_name,
  event.form_placement,
  event.funnel_name,
  event.step_name,
  event.step_number,
  event.cta_id,
  event.cta_location,
  event.cta_type,
  event.contact_method,
  event.content_type,
  event.content_cluster,
  public.normalize_growth_dimension_text(event.session_source, 'direct'),
  public.normalize_growth_dimension_text(event.session_medium, '(none)'),
  public.normalize_growth_dimension_text(event.session_campaign, '(not set)'),
  public.classify_growth_source_class(event.session_source, event.session_medium);

CREATE OR REPLACE VIEW public.growth_funnel_daily_metrics AS
WITH behavior_base AS (
  SELECT
    behavior.event_date AS metric_date,
    CASE
      WHEN behavior.business_line IN ('b2b', 'b2c') THEN behavior.business_line
      ELSE 'unknown'
    END AS business_line,
    CASE
      WHEN behavior.service_type IS NULL OR behavior.service_type = 'unknown' THEN NULL
      ELSE behavior.service_type
    END AS service_key,
    behavior.source_class,
    behavior.dashboard_page_type AS page_type,
    SUM(behavior.event_count) FILTER (WHERE behavior.event_name = 'cta_impression') AS cta_impressions,
    SUM(behavior.event_count) FILTER (WHERE behavior.event_name = 'cta_click') AS cta_clicks,
    SUM(behavior.event_count) FILTER (
      WHERE behavior.event_name = 'funnel_step'
        AND behavior.step_name = 'form_start'
    ) AS form_starts,
    SUM(behavior.event_count) FILTER (WHERE behavior.event_name = 'form_validation_failed') AS validation_failures,
    SUM(behavior.event_count) FILTER (WHERE behavior.event_name = 'form_abandonment') AS form_abandonments,
    SUM(behavior.event_count) FILTER (
      WHERE behavior.event_name = 'funnel_step'
        AND behavior.step_name = 'submit_success'
    ) AS submit_successes,
    SUM(behavior.event_count) FILTER (WHERE behavior.event_name = 'submit_failed') AS submit_failures
  FROM public.growth_behavior_daily_metrics AS behavior
  GROUP BY
    behavior.event_date,
    CASE
      WHEN behavior.business_line IN ('b2b', 'b2c') THEN behavior.business_line
      ELSE 'unknown'
    END,
    CASE
      WHEN behavior.service_type IS NULL OR behavior.service_type = 'unknown' THEN NULL
      ELSE behavior.service_type
    END,
    behavior.source_class,
    behavior.dashboard_page_type
),
lead_base AS (
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
    lead.page_type
)
SELECT
  COALESCE(lead_base.metric_date, behavior_base.metric_date) AS metric_date,
  COALESCE(lead_base.business_line, behavior_base.business_line, 'unknown') AS business_line,
  COALESCE(lead_base.service_key, behavior_base.service_key) AS service_key,
  COALESCE(lead_base.source_class, behavior_base.source_class, 'other') AS source_class,
  COALESCE(lead_base.page_type, behavior_base.page_type, 'other') AS page_type,
  COALESCE(lead_base.created_leads, 0) AS created_leads,
  COALESCE(lead_base.qualified_leads, 0) AS qualified_leads,
  COALESCE(lead_base.won_leads, 0) AS won_leads,
  COALESCE(lead_base.lost_leads, 0) AS lost_leads,
  COALESCE(lead_base.qualified_rate, 0) AS qualified_rate,
  COALESCE(lead_base.win_rate, 0) AS win_rate,
  COALESCE(behavior_base.cta_impressions, 0) AS cta_impressions,
  COALESCE(behavior_base.cta_clicks, 0) AS cta_clicks,
  COALESCE(behavior_base.form_starts, 0) AS form_starts,
  COALESCE(behavior_base.validation_failures, 0) AS validation_failures,
  COALESCE(behavior_base.form_abandonments, 0) AS form_abandonments,
  COALESCE(behavior_base.submit_successes, 0) AS submit_successes,
  COALESCE(behavior_base.submit_failures, 0) AS submit_failures
FROM lead_base
FULL OUTER JOIN behavior_base
  ON lead_base.metric_date = behavior_base.metric_date
  AND lead_base.business_line = behavior_base.business_line
  AND COALESCE(lead_base.service_key, '__none__') = COALESCE(behavior_base.service_key, '__none__')
  AND lead_base.source_class = behavior_base.source_class
  AND lead_base.page_type = behavior_base.page_type;
