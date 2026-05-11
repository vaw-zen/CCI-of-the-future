ALTER TABLE public.whatsapp_direct_leads
  ADD COLUMN IF NOT EXISTS whatsapp_click_id UUID REFERENCES public.whatsapp_click_events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS whatsapp_clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_click_label TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_click_page TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_direct_leads_whatsapp_click_id
  ON public.whatsapp_direct_leads(whatsapp_click_id)
  WHERE whatsapp_click_id IS NOT NULL;
