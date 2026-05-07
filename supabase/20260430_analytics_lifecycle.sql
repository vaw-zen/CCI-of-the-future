ALTER TABLE IF EXISTS public.devis_requests
  ADD COLUMN IF NOT EXISTS lead_status TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ga_client_id TEXT,
  ADD COLUMN IF NOT EXISTS landing_page TEXT,
  ADD COLUMN IF NOT EXISTS session_source TEXT,
  ADD COLUMN IF NOT EXISTS session_medium TEXT,
  ADD COLUMN IF NOT EXISTS session_campaign TEXT,
  ADD COLUMN IF NOT EXISTS referrer_host TEXT,
  ADD COLUMN IF NOT EXISTS entry_path TEXT,
  ADD COLUMN IF NOT EXISTS calculator_estimate NUMERIC,
  ADD COLUMN IF NOT EXISTS selected_services TEXT[],
  ADD COLUMN IF NOT EXISTS whatsapp_click_id UUID,
  ADD COLUMN IF NOT EXISTS whatsapp_clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_click_label TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_click_page TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_manual_tag BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS whatsapp_manual_tagged_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.convention_requests
  ADD COLUMN IF NOT EXISTS lead_status TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ga_client_id TEXT,
  ADD COLUMN IF NOT EXISTS landing_page TEXT,
  ADD COLUMN IF NOT EXISTS session_source TEXT,
  ADD COLUMN IF NOT EXISTS session_medium TEXT,
  ADD COLUMN IF NOT EXISTS session_campaign TEXT,
  ADD COLUMN IF NOT EXISTS referrer_host TEXT,
  ADD COLUMN IF NOT EXISTS entry_path TEXT,
  ADD COLUMN IF NOT EXISTS calculator_estimate NUMERIC,
  ADD COLUMN IF NOT EXISTS selected_services TEXT[],
  ADD COLUMN IF NOT EXISTS whatsapp_click_id UUID,
  ADD COLUMN IF NOT EXISTS whatsapp_clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_click_label TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_click_page TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_manual_tag BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS whatsapp_manual_tagged_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS ga_client_id TEXT,
  ADD COLUMN IF NOT EXISTS landing_page TEXT,
  ADD COLUMN IF NOT EXISTS session_source TEXT,
  ADD COLUMN IF NOT EXISTS session_medium TEXT,
  ADD COLUMN IF NOT EXISTS session_campaign TEXT,
  ADD COLUMN IF NOT EXISTS referrer_host TEXT,
  ADD COLUMN IF NOT EXISTS entry_path TEXT;

UPDATE public.devis_requests
SET
  lead_status = COALESCE(lead_status, 'submitted'),
  submitted_at = COALESCE(submitted_at, created_at)
WHERE lead_status IS NULL
   OR submitted_at IS NULL;

UPDATE public.convention_requests
SET
  lead_status = COALESCE(
    lead_status,
    CASE
      WHEN statut IN ('contacte', 'audit_planifie', 'devis_envoye') THEN 'qualified'
      WHEN statut = 'signe' THEN 'closed_won'
      WHEN statut = 'refuse' THEN 'closed_lost'
      ELSE 'submitted'
    END
  ),
  submitted_at = COALESCE(submitted_at, created_at),
  qualified_at = COALESCE(
    qualified_at,
    CASE
      WHEN statut IN ('contacte', 'audit_planifie', 'devis_envoye', 'signe', 'refuse') THEN COALESCE(updated_at, created_at)
      ELSE NULL
    END
  ),
  closed_at = COALESCE(
    closed_at,
    CASE
      WHEN statut IN ('signe', 'refuse') THEN COALESCE(updated_at, created_at)
      ELSE NULL
    END
  )
WHERE lead_status IS NULL
   OR submitted_at IS NULL
   OR (statut IN ('contacte', 'audit_planifie', 'devis_envoye', 'signe', 'refuse') AND qualified_at IS NULL)
   OR (statut IN ('signe', 'refuse') AND closed_at IS NULL);

ALTER TABLE public.devis_requests
  ALTER COLUMN lead_status SET DEFAULT 'submitted';

ALTER TABLE public.convention_requests
  ALTER COLUMN lead_status SET DEFAULT 'submitted';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'devis_requests_lead_status_check'
  ) THEN
    ALTER TABLE public.devis_requests
      ADD CONSTRAINT devis_requests_lead_status_check
      CHECK (lead_status IN ('submitted', 'qualified', 'closed_won', 'closed_lost'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'convention_requests_lead_status_check'
  ) THEN
    ALTER TABLE public.convention_requests
      ADD CONSTRAINT convention_requests_lead_status_check
      CHECK (lead_status IN ('submitted', 'qualified', 'closed_won', 'closed_lost'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_devis_requests_lead_status ON public.devis_requests(lead_status);
CREATE INDEX IF NOT EXISTS idx_devis_requests_session_source ON public.devis_requests(session_source);
CREATE INDEX IF NOT EXISTS idx_devis_requests_whatsapp_click_id ON public.devis_requests(whatsapp_click_id);
CREATE INDEX IF NOT EXISTS idx_devis_requests_whatsapp_manual_tag ON public.devis_requests(whatsapp_manual_tag);
CREATE INDEX IF NOT EXISTS idx_convention_requests_lead_status ON public.convention_requests(lead_status);
CREATE INDEX IF NOT EXISTS idx_convention_requests_session_source ON public.convention_requests(session_source);
CREATE INDEX IF NOT EXISTS idx_convention_requests_whatsapp_click_id ON public.convention_requests(whatsapp_click_id);
CREATE INDEX IF NOT EXISTS idx_convention_requests_whatsapp_manual_tag ON public.convention_requests(whatsapp_manual_tag);
