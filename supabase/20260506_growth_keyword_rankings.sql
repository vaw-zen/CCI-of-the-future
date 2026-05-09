CREATE TABLE IF NOT EXISTS public.growth_keyword_rankings_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  keyword TEXT NOT NULL,
  keyword_label TEXT NOT NULL,
  target_domain TEXT NOT NULL,
  target_path TEXT NOT NULL DEFAULT '/',
  matched_domain TEXT,
  matched_path TEXT,
  matched_url TEXT,
  result_title TEXT,
  result_snippet TEXT,
  position INTEGER CHECK (position IS NULL OR position > 0),
  is_ranked BOOLEAN NOT NULL DEFAULT FALSE,
  device TEXT NOT NULL DEFAULT 'desktop',
  google_domain TEXT NOT NULL DEFAULT 'google.com',
  gl TEXT NOT NULL DEFAULT '',
  hl TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  results_count INTEGER NOT NULL DEFAULT 0 CHECK (results_count >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (metric_date, keyword, target_domain, target_path, device, google_domain, gl, hl, location)
);

CREATE INDEX IF NOT EXISTS idx_growth_keyword_rankings_daily_metric_date
  ON public.growth_keyword_rankings_daily(metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_growth_keyword_rankings_daily_keyword
  ON public.growth_keyword_rankings_daily(keyword, metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_growth_keyword_rankings_daily_target
  ON public.growth_keyword_rankings_daily(target_domain, target_path, metric_date DESC);

ALTER TABLE public.growth_keyword_rankings_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin users to read growth keyword rankings" ON public.growth_keyword_rankings_daily;
CREATE POLICY "Allow admin users to read growth keyword rankings" ON public.growth_keyword_rankings_daily
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

DROP TRIGGER IF EXISTS trigger_touch_growth_keyword_rankings_daily_updated_at ON public.growth_keyword_rankings_daily;
CREATE TRIGGER trigger_touch_growth_keyword_rankings_daily_updated_at
  BEFORE UPDATE ON public.growth_keyword_rankings_daily
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_growth_reporting_updated_at();
