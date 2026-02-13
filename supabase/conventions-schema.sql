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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_convention_requests_statut ON convention_requests(statut);
CREATE INDEX IF NOT EXISTS idx_convention_requests_created ON convention_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_convention_requests_secteur ON convention_requests(secteur_activite);

-- Enable RLS
ALTER TABLE convention_requests ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for form submissions)
CREATE POLICY "Allow public insert on convention_requests"
  ON convention_requests
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to read (admin access)
CREATE POLICY "Allow authenticated read on convention_requests"
  ON convention_requests
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to update (admin status tracking)
CREATE POLICY "Allow authenticated update on convention_requests"
  ON convention_requests
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_convention_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER convention_requests_updated_at
  BEFORE UPDATE ON convention_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_convention_updated_at();
