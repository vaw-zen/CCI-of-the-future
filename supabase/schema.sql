-- Create devis_requests table
-- This SQL should be executed in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS devis_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Personal Information
  type_personne TEXT NOT NULL CHECK (type_personne IN ('physique', 'morale')),
  matricule_fiscale TEXT,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  
  -- Address Information
  adresse TEXT NOT NULL,
  ville TEXT NOT NULL,
  code_postal TEXT,
  type_logement TEXT DEFAULT 'appartement' CHECK (type_logement IN ('appartement', 'maison', 'villa', 'bureau', 'commerce', 'bateau ou car ferry')),
  surface INTEGER,
  
  -- Service Information
  type_service TEXT NOT NULL CHECK (type_service IN ('salon', 'tapis', 'tapisserie', 'marbre', 'tfc')),
  nombre_places INTEGER,
  surface_service DECIMAL(10,2),
  
  -- Appointment Preferences
  date_preferee DATE,
  heure_preferee TEXT DEFAULT 'matin' CHECK (heure_preferee IN ('matin', 'apres_midi', 'soir', 'flexible')),
  
  -- Additional Information
  message TEXT,
  newsletter BOOLEAN DEFAULT FALSE,
  conditions BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Constraints
  CONSTRAINT valid_matricule_when_morale CHECK (
    (type_personne = 'physique') OR 
    (type_personne = 'morale' AND matricule_fiscale IS NOT NULL)
  ),
  CONSTRAINT valid_nombre_places_for_salon CHECK (
    (type_service != 'salon') OR 
    (type_service = 'salon' AND nombre_places IS NOT NULL AND nombre_places > 0)
  ),
  CONSTRAINT valid_surface_for_service CHECK (
    (type_service NOT IN ('tapis', 'marbre', 'tfc')) OR 
    (type_service IN ('tapis', 'marbre', 'tfc') AND surface_service IS NOT NULL AND surface_service > 0)
  )
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_devis_requests_created_at ON devis_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devis_requests_email ON devis_requests(email);
CREATE INDEX IF NOT EXISTS idx_devis_requests_type_service ON devis_requests(type_service);

-- Enable Row Level Security
ALTER TABLE devis_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from the application
-- This allows anyone to insert a devis request (since it's a public form)
CREATE POLICY "Allow public devis requests insertion" ON devis_requests
  FOR INSERT WITH CHECK (true);

-- Create policy to allow reading only by authenticated users (for admin access)
-- You can adjust this based on your authentication needs
CREATE POLICY "Allow authenticated users to read devis requests" ON devis_requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- Alternative: Allow service role to read all data (for API routes)
CREATE POLICY "Allow service role full access" ON devis_requests
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create a function to send email notifications
-- This will be called by a database trigger
CREATE OR REPLACE FUNCTION notify_new_devis_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into a notifications queue table or call an edge function
  -- For now, we'll use Supabase's built-in notification system
  PERFORM pg_notify('new_devis_request', json_build_object(
    'id', NEW.id,
    'email', NEW.email,
    'nom', NEW.nom,
    'prenom', NEW.prenom,
    'type_service', NEW.type_service,
    'created_at', NEW.created_at
  )::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the notification function
DROP TRIGGER IF EXISTS trigger_notify_new_devis_request ON devis_requests;
CREATE TRIGGER trigger_notify_new_devis_request
  AFTER INSERT ON devis_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_devis_request();

-- Comments for documentation
COMMENT ON TABLE devis_requests IS 'Stores all devis (quote) requests from the website form';
COMMENT ON COLUMN devis_requests.type_personne IS 'Type of person: physique (individual) or morale (company)';
COMMENT ON COLUMN devis_requests.matricule_fiscale IS 'Tax ID number, required for companies (morale)';
COMMENT ON COLUMN devis_requests.type_service IS 'Type of service requested: salon, tapis, tapisserie, marbre, or tfc';
COMMENT ON COLUMN devis_requests.nombre_places IS 'Number of seats/places, required for salon service';
COMMENT ON COLUMN devis_requests.surface_service IS 'Surface area to be treated, required for tapis/marbre/tfc services';