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

  -- Lead Lifecycle
  lead_status TEXT NOT NULL DEFAULT 'submitted' CHECK (lead_status IN ('submitted', 'qualified', 'closed_won', 'closed_lost')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  qualified_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,

  -- Attribution
  ga_client_id TEXT,
  landing_page TEXT,
  session_source TEXT,
  session_medium TEXT,
  session_campaign TEXT,
  referrer_host TEXT,
  entry_path TEXT,
  calculator_estimate DECIMAL,
  selected_services TEXT[],
  
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
CREATE INDEX IF NOT EXISTS idx_devis_requests_lead_status ON devis_requests(lead_status);
CREATE INDEX IF NOT EXISTS idx_devis_requests_lead_status_created_at ON devis_requests(lead_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devis_requests_session_source ON devis_requests(session_source);
CREATE INDEX IF NOT EXISTS idx_devis_requests_session_medium ON devis_requests(session_medium);

-- Enable Row Level Security
ALTER TABLE devis_requests ENABLE ROW LEVEL SECURITY;

-- Public inserts should go through the server route using the service role.
DROP POLICY IF EXISTS "Allow public devis requests insertion" ON devis_requests;
DROP POLICY IF EXISTS "Allow service role full access" ON devis_requests;
DROP POLICY IF EXISTS "Allow service role full access to devis requests" ON devis_requests;
DROP POLICY IF EXISTS "Allow service role to read devis requests" ON devis_requests;
DROP POLICY IF EXISTS "Enable all for service role" ON devis_requests;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON devis_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON devis_requests;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON devis_requests;
DROP POLICY IF EXISTS "allow_insert_for_all" ON devis_requests;
DROP POLICY IF EXISTS "allow_select_for_service_role" ON devis_requests;

-- Only authenticated admin users can read devis requests from the dashboard.
DROP POLICY IF EXISTS "Allow authenticated users to read devis requests" ON devis_requests;
DROP POLICY IF EXISTS "Allow admin users to read devis requests" ON devis_requests;
CREATE POLICY "Allow admin users to read devis requests" ON devis_requests
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

-- Create a function to send email notifications
-- This will be called by a database trigger
CREATE OR REPLACE FUNCTION notify_new_devis_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
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
$$;

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

-- Admin lead status audit log
CREATE TABLE IF NOT EXISTS admin_lead_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  lead_kind TEXT NOT NULL CHECK (lead_kind IN ('devis', 'convention', 'unknown')),
  lead_table TEXT,
  lead_id UUID,
  previous_status TEXT,
  next_status TEXT,
  previous_operational_status TEXT,
  next_operational_status TEXT,
  admin_email TEXT,
  admin_user_id UUID,
  action_result TEXT NOT NULL CHECK (action_result IN ('success', 'rejected')),
  rejection_reason TEXT,
  request_ip TEXT,
  user_agent_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_lead_status_events_created_at ON admin_lead_status_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_lead_status_events_lead ON admin_lead_status_events(lead_kind, lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_lead_status_events_admin_email ON admin_lead_status_events(admin_email, created_at DESC);

ALTER TABLE admin_lead_status_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin users to read lead status audit events" ON admin_lead_status_events;
CREATE POLICY "Allow admin users to read lead status audit events" ON admin_lead_status_events
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

-- Growth reporting snapshots
CREATE TABLE IF NOT EXISTS growth_channel_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  metric_source TEXT NOT NULL CHECK (metric_source IN ('ga4', 'gsc', 'paid_manual', 'social_manual')),
  source TEXT NOT NULL DEFAULT 'unknown',
  medium TEXT NOT NULL DEFAULT '(none)',
  campaign TEXT NOT NULL DEFAULT '(not set)',
  landing_page TEXT NOT NULL DEFAULT '/',
  sessions INTEGER NOT NULL DEFAULT 0 CHECK (sessions >= 0),
  users INTEGER NOT NULL DEFAULT 0 CHECK (users >= 0),
  clicks INTEGER NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  impressions INTEGER NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  spend NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (spend >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (metric_date, metric_source, source, medium, campaign, landing_page)
);

CREATE INDEX IF NOT EXISTS idx_growth_channel_daily_metrics_metric_date
  ON growth_channel_daily_metrics(metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_growth_channel_daily_metrics_source_medium_campaign
  ON growth_channel_daily_metrics(source, medium, campaign, metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_growth_channel_daily_metrics_landing_page
  ON growth_channel_daily_metrics(landing_page, metric_date DESC);

CREATE TABLE IF NOT EXISTS growth_reporting_source_health (
  source_key TEXT PRIMARY KEY,
  source_label TEXT NOT NULL,
  connector_type TEXT NOT NULL DEFAULT 'manual' CHECK (connector_type IN ('api', 'manual', 'database')),
  status TEXT NOT NULL DEFAULT 'missing' CHECK (status IN ('fresh', 'stale', 'missing', 'error')),
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  freshest_metric_date DATE,
  message TEXT,
  last_error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE growth_channel_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_reporting_source_health ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin users to read growth metrics" ON growth_channel_daily_metrics;
CREATE POLICY "Allow admin users to read growth metrics" ON growth_channel_daily_metrics
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Allow admin users to read growth source health" ON growth_reporting_source_health;
CREATE POLICY "Allow admin users to read growth source health" ON growth_reporting_source_health
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

CREATE OR REPLACE FUNCTION touch_growth_reporting_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_touch_growth_channel_daily_metrics_updated_at ON growth_channel_daily_metrics;
CREATE TRIGGER trigger_touch_growth_channel_daily_metrics_updated_at
  BEFORE UPDATE ON growth_channel_daily_metrics
  FOR EACH ROW
  EXECUTE FUNCTION touch_growth_reporting_updated_at();

DROP TRIGGER IF EXISTS trigger_touch_growth_reporting_source_health_updated_at ON growth_reporting_source_health;
CREATE TRIGGER trigger_touch_growth_reporting_source_health_updated_at
  BEFORE UPDATE ON growth_reporting_source_health
  FOR EACH ROW
  EXECUTE FUNCTION touch_growth_reporting_updated_at();
