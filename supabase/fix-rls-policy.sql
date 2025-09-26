-- Fix for RLS Policy Issue
-- Execute this SQL in your Supabase SQL Editor to fix the row-level security error

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public devis requests insertion" ON devis_requests;
DROP POLICY IF EXISTS "Allow authenticated users to read devis requests" ON devis_requests;
DROP POLICY IF EXISTS "Allow service role full access" ON devis_requests;

-- Create new, more permissive policies that will work with anonymous users
CREATE POLICY "Enable insert for anonymous users" ON devis_requests
  FOR INSERT 
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users" ON devis_requests
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow service role to do everything (for API routes and admin functions)  
CREATE POLICY "Enable all for service role" ON devis_requests
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read (for potential admin dashboard)
CREATE POLICY "Enable read for authenticated users" ON devis_requests
  FOR SELECT 
  TO authenticated
  USING (true);