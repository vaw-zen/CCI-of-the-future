ALTER TABLE IF EXISTS public.growth_channel_daily_metrics
  ADD COLUMN IF NOT EXISTS events INTEGER NOT NULL DEFAULT 0 CHECK (events >= 0);

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
  metric.updated_at,
  metric.events
FROM public.growth_channel_daily_metrics AS metric;
