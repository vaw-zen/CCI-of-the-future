-- Update constraints for devis_requests table
-- Run this in your Supabase SQL editor

-- 1. Update type_logement constraint to include 'bateau ou car ferry'
ALTER TABLE devis_requests DROP CONSTRAINT IF EXISTS devis_requests_type_logement_check;
ALTER TABLE devis_requests ADD CONSTRAINT devis_requests_type_logement_check 
CHECK (type_logement IN ('appartement', 'maison', 'villa', 'bureau', 'commerce', 'bateau ou car ferry'));

-- 2. Make surface column optional (NULL allowed) since we don't collect it in the form
ALTER TABLE devis_requests ALTER COLUMN surface DROP NOT NULL;

-- 3. Update surface column to allow NULL explicitly
COMMENT ON COLUMN devis_requests.surface IS 'Surface totale du logement (optionnel, non collecté dans le formulaire)';

-- 4. Verify all constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'devis_requests'::regclass 
AND contype = 'c'  -- Check constraints only
ORDER BY conname;

-- 5. Verify table structure
\d devis_requests;