CREATE TABLE IF NOT EXISTS public.growth_keyword_reference_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_filename TEXT NOT NULL,
  source_path TEXT,
  source_hash TEXT NOT NULL,
  raw_row_count INTEGER NOT NULL DEFAULT 0 CHECK (raw_row_count >= 0),
  cleaned_row_count INTEGER NOT NULL DEFAULT 0 CHECK (cleaned_row_count >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_growth_keyword_reference_imports_imported_at
  ON public.growth_keyword_reference_imports(imported_at DESC);

CREATE TABLE IF NOT EXISTS public.growth_keyword_reference_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES public.growth_keyword_reference_imports(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL CHECK (row_number > 0),
  row_hash TEXT NOT NULL,
  catalog_key TEXT NOT NULL,
  normalized_keyword TEXT NOT NULL,
  display_keyword TEXT NOT NULL,
  original_target_url TEXT NOT NULL,
  canonical_target_url TEXT NOT NULL,
  canonical_target_path TEXT NOT NULL,
  csv_category TEXT NOT NULL DEFAULT '',
  csv_keyword TEXT NOT NULL DEFAULT '',
  csv_search_intent TEXT NOT NULL DEFAULT '',
  csv_competition TEXT NOT NULL DEFAULT '',
  csv_target_url TEXT NOT NULL DEFAULT '',
  csv_optimization_status TEXT NOT NULL DEFAULT '',
  csv_content_type TEXT NOT NULL DEFAULT '',
  csv_priority TEXT NOT NULL DEFAULT '',
  csv_clicks TEXT NOT NULL DEFAULT '',
  csv_impressions TEXT NOT NULL DEFAULT '',
  csv_current_position TEXT NOT NULL DEFAULT '',
  csv_ctr TEXT NOT NULL DEFAULT '',
  csv_search_volume TEXT NOT NULL DEFAULT '',
  csv_trend TEXT NOT NULL DEFAULT '',
  csv_last_updated TEXT NOT NULL DEFAULT '',
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (import_id, row_number)
);

CREATE INDEX IF NOT EXISTS idx_growth_keyword_reference_rows_import
  ON public.growth_keyword_reference_rows(import_id, row_number ASC);

CREATE INDEX IF NOT EXISTS idx_growth_keyword_reference_rows_catalog
  ON public.growth_keyword_reference_rows(catalog_key);

CREATE TABLE IF NOT EXISTS public.growth_keyword_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  normalized_keyword TEXT NOT NULL,
  display_keyword TEXT NOT NULL,
  canonical_target_url TEXT NOT NULL,
  canonical_target_path TEXT NOT NULL,
  target_domain TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  category_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  search_intent_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  competition_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  optimization_status_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  content_type_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  priority_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  trend_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  raw_row_count INTEGER NOT NULL DEFAULT 0 CHECK (raw_row_count >= 0),
  reference_row_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
  latest_import_id UUID REFERENCES public.growth_keyword_reference_imports(id) ON DELETE SET NULL,
  reference_clicks INTEGER,
  reference_impressions INTEGER,
  reference_current_position NUMERIC(8, 2),
  reference_ctr NUMERIC(8, 2),
  reference_search_volume INTEGER,
  reference_last_updated DATE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  deactivated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (normalized_keyword, canonical_target_url)
);

CREATE INDEX IF NOT EXISTS idx_growth_keyword_catalog_active
  ON public.growth_keyword_catalog(active, canonical_target_path, display_keyword);

CREATE INDEX IF NOT EXISTS idx_growth_keyword_catalog_target
  ON public.growth_keyword_catalog(target_domain, canonical_target_path);

ALTER TABLE IF EXISTS public.growth_keyword_rankings_daily
  ADD COLUMN IF NOT EXISTS keyword_catalog_id UUID REFERENCES public.growth_keyword_catalog(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_growth_keyword_rankings_daily_catalog_date
  ON public.growth_keyword_rankings_daily(keyword_catalog_id, metric_date DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'growth_keyword_rankings_daily_device_check'
  ) THEN
    ALTER TABLE public.growth_keyword_rankings_daily
      ADD CONSTRAINT growth_keyword_rankings_daily_device_check
      CHECK (device IN ('desktop', 'mobile'));
  END IF;
END
$$;

ALTER TABLE public.growth_keyword_reference_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_keyword_reference_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_keyword_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin users to read keyword reference imports" ON public.growth_keyword_reference_imports;
CREATE POLICY "Allow admin users to read keyword reference imports" ON public.growth_keyword_reference_imports
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Allow admin users to read keyword reference rows" ON public.growth_keyword_reference_rows;
CREATE POLICY "Allow admin users to read keyword reference rows" ON public.growth_keyword_reference_rows
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Allow admin users to read keyword catalog" ON public.growth_keyword_catalog;
CREATE POLICY "Allow admin users to read keyword catalog" ON public.growth_keyword_catalog
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

DROP TRIGGER IF EXISTS trigger_touch_growth_keyword_reference_imports_updated_at ON public.growth_keyword_reference_imports;
CREATE TRIGGER trigger_touch_growth_keyword_reference_imports_updated_at
  BEFORE UPDATE ON public.growth_keyword_reference_imports
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_growth_reporting_updated_at();

DROP TRIGGER IF EXISTS trigger_touch_growth_keyword_reference_rows_updated_at ON public.growth_keyword_reference_rows;
CREATE TRIGGER trigger_touch_growth_keyword_reference_rows_updated_at
  BEFORE UPDATE ON public.growth_keyword_reference_rows
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_growth_reporting_updated_at();

DROP TRIGGER IF EXISTS trigger_touch_growth_keyword_catalog_updated_at ON public.growth_keyword_catalog;
CREATE TRIGGER trigger_touch_growth_keyword_catalog_updated_at
  BEFORE UPDATE ON public.growth_keyword_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_growth_reporting_updated_at();
