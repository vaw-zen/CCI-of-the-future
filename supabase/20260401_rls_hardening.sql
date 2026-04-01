-- Tighten RLS for public tables and remove stale permissive policies.
-- Public form submissions now go through server routes using the service role.

-- Enable RLS on all exposed tables flagged by the advisor.
ALTER TABLE IF EXISTS public.devis_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.convention_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_events ENABLE ROW LEVEL SECURITY;

-- Recreate admin helper with a fixed search_path so policies can safely call it.
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email = user_email
      AND is_active = TRUE
  );
END;
$$;

-- Drop stale permissive devis policies that accumulated over time.
DROP POLICY IF EXISTS "Allow public devis requests insertion" ON public.devis_requests;
DROP POLICY IF EXISTS "Allow authenticated users to read devis requests" ON public.devis_requests;
DROP POLICY IF EXISTS "Allow admin users to read devis requests" ON public.devis_requests;
DROP POLICY IF EXISTS "Allow service role full access" ON public.devis_requests;
DROP POLICY IF EXISTS "Allow service role full access to devis requests" ON public.devis_requests;
DROP POLICY IF EXISTS "Allow service role to read devis requests" ON public.devis_requests;
DROP POLICY IF EXISTS "Enable all for service role" ON public.devis_requests;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.devis_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.devis_requests;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.devis_requests;
DROP POLICY IF EXISTS "allow_insert_for_all" ON public.devis_requests;
DROP POLICY IF EXISTS "allow_select_for_service_role" ON public.devis_requests;

CREATE POLICY "Allow admin users to read devis requests" ON public.devis_requests
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

-- Public inserts are handled by Next.js API routes with the service role.
DROP POLICY IF EXISTS "Allow public insert on convention_requests" ON public.convention_requests;
DROP POLICY IF EXISTS "Allow authenticated read on convention_requests" ON public.convention_requests;
DROP POLICY IF EXISTS "Allow authenticated update on convention_requests" ON public.convention_requests;
DROP POLICY IF EXISTS "Allow admin users to read convention requests" ON public.convention_requests;
DROP POLICY IF EXISTS "Allow admin users to update convention requests" ON public.convention_requests;

CREATE POLICY "Allow admin users to read convention requests" ON public.convention_requests
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')));

CREATE POLICY "Allow admin users to update convention requests" ON public.convention_requests
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin(auth.jwt() ->> 'email')))
  WITH CHECK ((SELECT public.is_admin(auth.jwt() ->> 'email')));

-- Fix mutable search_path warnings on existing functions.
CREATE OR REPLACE FUNCTION public.notify_new_devis_request()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
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

CREATE OR REPLACE FUNCTION public.update_convention_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
