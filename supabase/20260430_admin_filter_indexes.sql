CREATE INDEX IF NOT EXISTS idx_devis_requests_lead_status_created_at
  ON public.devis_requests(lead_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_devis_requests_session_medium
  ON public.devis_requests(session_medium);

CREATE INDEX IF NOT EXISTS idx_convention_requests_lead_status_created_at
  ON public.convention_requests(lead_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_convention_requests_statut_created_at
  ON public.convention_requests(statut, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_convention_requests_session_medium
  ON public.convention_requests(session_medium);
