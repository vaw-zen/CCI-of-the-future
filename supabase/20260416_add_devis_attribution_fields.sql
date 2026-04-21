ALTER TABLE devis_requests
  ADD COLUMN IF NOT EXISTS lead_source TEXT CHECK (lead_source IN ('service_page', 'article', 'calculator')),
  ADD COLUMN IF NOT EXISTS source_article TEXT,
  ADD COLUMN IF NOT EXISTS calculator_estimate INTEGER,
  ADD COLUMN IF NOT EXISTS selected_services TEXT[],
  ADD COLUMN IF NOT EXISTS entry_path TEXT;

CREATE INDEX IF NOT EXISTS idx_devis_requests_lead_source ON devis_requests(lead_source);

COMMENT ON COLUMN devis_requests.lead_source IS 'How the lead reached the contact form: service_page, article, or calculator';
COMMENT ON COLUMN devis_requests.source_article IS 'Article slug used in the contact handoff when the lead came from content';
COMMENT ON COLUMN devis_requests.calculator_estimate IS 'Estimate shown in the quote calculator before the lead submitted the contact form';
COMMENT ON COLUMN devis_requests.selected_services IS 'List of services selected in the quote calculator before the contact handoff';
COMMENT ON COLUMN devis_requests.entry_path IS 'Original contact page path and query string used when the lead opened the form';
