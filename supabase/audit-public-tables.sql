-- Audit public-schema tables for RLS exposure.
-- Run this in the Supabase SQL editor when Security Advisor flags public tables.

SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname = 'public'
ORDER BY c.relrowsecurity ASC, n.nspname, c.relname;

-- Focus view: only the risky tables in the exposed `public` schema.
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname = 'public'
  AND c.relrowsecurity = FALSE
ORDER BY n.nspname, c.relname;
