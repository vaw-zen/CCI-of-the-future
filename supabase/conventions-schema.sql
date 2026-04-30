-- ============================================================
-- Convention Requests Table — B2B Annual Cleaning Contracts
-- ============================================================

CREATE TABLE IF NOT EXISTS convention_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Company Information
  raison_sociale TEXT NOT NULL,
  matricule_fiscale TEXT NOT NULL,
  secteur_activite TEXT NOT NULL CHECK (secteur_activite IN ('banque', 'assurance', 'clinique', 'hotel', 'bureau', 'commerce', 'autre')),
  
  -- Contact Person
  contact_nom TEXT NOT NULL,
  contact_prenom TEXT NOT NULL,
  contact_fonction TEXT,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  
  -- Site Details
  nombre_sites INTEGER DEFAULT 1,
  surface_totale DECIMAL,
  
  -- Convention Details
  services_souhaites TEXT[] NOT NULL,
  frequence TEXT NOT NULL CHECK (frequence IN ('quotidien', '3x_semaine', 'hebdomadaire', 'bi_mensuel', 'mensuel')),
  duree_contrat TEXT NOT NULL CHECK (duree_contrat IN ('6_mois', '1_an', '2_ans', '3_ans')),
  date_debut_souhaitee DATE,
  message TEXT,
  
  -- Admin Tracking
  statut TEXT DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'contacte', 'audit_planifie', 'devis_envoye', 'signe', 'refuse')),
  notes_admin TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Lead Lifecycle
  lead_status TEXT NOT NULL DEFAULT 'submitted' CHECK (lead_status IN ('submitted', 'qualified', 'closed_won', 'closed_lost')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  qualified_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,

  -- Attribution
  ga_client_id TEXT,
  landing_page TEXT,
  session_source TEXT,
  session_medium TEXT,
  session_campaign TEXT,
  referrer_host TEXT,
  entry_path TEXT,
  calculator_estimate DECIMAL,
  selected_services TEXT[]
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_convention_requests_statut ON convention_requests(statut);
CREATE INDEX IF NOT EXISTS idx_convention_requests_statut_created_at ON convention_requests(statut, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_convention_requests_created ON convention_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_convention_requests_secteur ON convention_requests(secteur_activite);
CREATE INDEX IF NOT EXISTS idx_convention_requests_lead_status ON convention_requests(lead_status);
CREATE INDEX IF NOT EXISTS idx_convention_requests_lead_status_created_at ON convention_requests(lead_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_convention_requests_session_source ON convention_requests(session_source);
CREATE INDEX IF NOT EXISTS idx_convention_requests_session_medium ON convention_requests(session_medium);

-- Enable RLS
ALTER TABLE convention_requests ENABLE ROW LEVEL SECURITY;

-- Public inserts should go through the server route using the service role.
DROP POLICY IF EXISTS "Allow public insert on convention_requests" ON convention_requests;
DROP POLICY IF EXISTS "Allow authenticated read on convention_requests" ON convention_requests;
DROP POLICY IF EXISTS "Allow authenticated update on convention_requests" ON convention_requests;
DROP POLICY IF EXISTS "Allow admin users to read convention requests" ON convention_requests;
DROP POLICY IF EXISTS "Allow admin users to update convention requests" ON convention_requests;

-- Allow authenticated admin users to review convention requests.
-- Status mutations go through /api/admin/leads/[kind]/[id]/status using the
-- server-side service role so all changes can be validated and audited.
CREATE POLICY "Allow admin users to read convention requests"
  ON convention_requests
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_convention_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER convention_requests_updated_at
  BEFORE UPDATE ON convention_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_convention_updated_at();
