CREATE TABLE IF NOT EXISTS public.whatsapp_click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ga_client_id TEXT,
  event_label TEXT NOT NULL DEFAULT 'unknown',
  page_path TEXT NOT NULL DEFAULT '/',
  landing_page TEXT NOT NULL DEFAULT '/',
  session_source TEXT,
  session_medium TEXT,
  session_campaign TEXT,
  referrer_host TEXT
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_click_events_clicked_at
  ON public.whatsapp_click_events(clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_click_events_ga_client_id_clicked_at
  ON public.whatsapp_click_events(ga_client_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_click_events_event_label
  ON public.whatsapp_click_events(event_label);

ALTER TABLE public.whatsapp_click_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin users to read whatsapp click events" ON public.whatsapp_click_events;
CREATE POLICY "Allow admin users to read whatsapp click events" ON public.whatsapp_click_events
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

ALTER TABLE IF EXISTS public.devis_requests
  ADD COLUMN IF NOT EXISTS whatsapp_click_id UUID REFERENCES public.whatsapp_click_events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS whatsapp_clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_click_label TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_click_page TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_manual_tag BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS whatsapp_manual_tagged_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.convention_requests
  ADD COLUMN IF NOT EXISTS whatsapp_click_id UUID REFERENCES public.whatsapp_click_events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS whatsapp_clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_click_label TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_click_page TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_manual_tag BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS whatsapp_manual_tagged_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_devis_requests_whatsapp_click_id
  ON public.devis_requests(whatsapp_click_id);

CREATE INDEX IF NOT EXISTS idx_devis_requests_whatsapp_manual_tag
  ON public.devis_requests(whatsapp_manual_tag);

CREATE INDEX IF NOT EXISTS idx_convention_requests_whatsapp_click_id
  ON public.convention_requests(whatsapp_click_id);

CREATE INDEX IF NOT EXISTS idx_convention_requests_whatsapp_manual_tag
  ON public.convention_requests(whatsapp_manual_tag);
