-- Simplified admin setup without auth schema functions
-- Run this in your Supabase SQL editor

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for admin_users table
-- Allow service role to manage admin users
CREATE POLICY "Allow service role full access to admin users" ON admin_users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow authenticated users to read their own admin record
CREATE POLICY "Allow users to read own admin record" ON admin_users
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- 4. Create a simple function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = user_email 
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update devis_requests policies to allow service role access
DROP POLICY IF EXISTS "Allow authenticated users to read devis requests" ON devis_requests;
DROP POLICY IF EXISTS "Allow admin users to read devis requests" ON devis_requests;

-- Simple policy: service role can read all
CREATE POLICY "Allow service role to read devis requests" ON devis_requests
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- 6. Insert your admin user
INSERT INTO admin_users (email, full_name, role) 
VALUES ('cci.services.tn@gmail.com', 'CCI Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- 8. Verification queries
SELECT 'Admin users table created successfully' as status;
SELECT * FROM admin_users WHERE email = 'cci.services.tn@gmail.com';
SELECT is_admin('cci.services.tn@gmail.com') as admin_check;