CREATE TABLE IF NOT EXISTS public.growth_channel_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  metric_source TEXT NOT NULL CHECK (metric_source IN ('ga4', 'gsc', 'paid_manual', 'social_manual')),
  source TEXT NOT NULL DEFAULT 'unknown',
  medium TEXT NOT NULL DEFAULT '(none)',
  campaign TEXT NOT NULL DEFAULT '(not set)',
  landing_page TEXT NOT NULL DEFAULT '/',
  sessions INTEGER NOT NULL DEFAULT 0 CHECK (sessions >= 0),
  users INTEGER NOT NULL DEFAULT 0 CHECK (users >= 0),
  events INTEGER NOT NULL DEFAULT 0 CHECK (events >= 0),
  clicks INTEGER NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  impressions INTEGER NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  spend NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (spend >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (metric_date, metric_source, source, medium, campaign, landing_page)
);

CREATE INDEX IF NOT EXISTS idx_growth_channel_daily_metrics_metric_date
  ON public.growth_channel_daily_metrics(metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_growth_channel_daily_metrics_source_medium_campaign
  ON public.growth_channel_daily_metrics(source, medium, campaign, metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_growth_channel_daily_metrics_landing_page
  ON public.growth_channel_daily_metrics(landing_page, metric_date DESC);

CREATE TABLE IF NOT EXISTS public.growth_reporting_source_health (
  source_key TEXT PRIMARY KEY,
  source_label TEXT NOT NULL,
  connector_type TEXT NOT NULL DEFAULT 'manual' CHECK (connector_type IN ('api', 'manual', 'database')),
  status TEXT NOT NULL DEFAULT 'missing' CHECK (status IN ('fresh', 'stale', 'missing', 'error')),
  last_attempt_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  freshest_metric_date DATE,
  message TEXT,
  last_error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.growth_channel_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_reporting_source_health ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin users to read growth metrics" ON public.growth_channel_daily_metrics;
CREATE POLICY "Allow admin users to read growth metrics" ON public.growth_channel_daily_metrics
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Allow admin users to read growth source health" ON public.growth_reporting_source_health;
CREATE POLICY "Allow admin users to read growth source health" ON public.growth_reporting_source_health
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

CREATE OR REPLACE FUNCTION public.touch_growth_reporting_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_touch_growth_channel_daily_metrics_updated_at ON public.growth_channel_daily_metrics;
CREATE TRIGGER trigger_touch_growth_channel_daily_metrics_updated_at
  BEFORE UPDATE ON public.growth_channel_daily_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_growth_reporting_updated_at();

DROP TRIGGER IF EXISTS trigger_touch_growth_reporting_source_health_updated_at ON public.growth_reporting_source_health;
CREATE TRIGGER trigger_touch_growth_reporting_source_health_updated_at
  BEFORE UPDATE ON public.growth_reporting_source_health
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_growth_reporting_updated_at();
