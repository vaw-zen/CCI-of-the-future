-- Simple SQL script to add admin user
-- Run this in your Supabase SQL editor AFTER running admin-auth-setup.sql

-- 1. First, create the user in Supabase Auth Dashboard manually:
--    - Go to Authentication > Users in your Supabase dashboard
--    - Click "Add user" or "Create new user"
--    - Email: cci.services.tn@gmail.com
--    - Password: [choose a secure password]
--    - Email confirmed: Yes (check this box)

-- 2. Then run this SQL to add the user to admin_users table:
INSERT INTO admin_users (email, full_name, role) 
VALUES ('cci.services.tn@gmail.com', 'CCI Admin', 'super_admin')
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = TRUE;

-- 3. Verify the admin user was created:
SELECT * FROM admin_users WHERE email = 'cci.services.tn@gmail.com';

-- 4. Test the admin check function:
SELECT is_admin('cci.services.tn@gmail.com') as is_admin_result;