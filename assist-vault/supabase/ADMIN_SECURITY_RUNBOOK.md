# Admin Security Runbook

## Admin Access

- Keep Supabase email confirmation enabled for admin users.
- Enable Supabase MFA for every account listed in `admin_users`.
- Use `admin_users.is_active = false` as the first-line admin access kill switch.

## Emergency Revocation

Disable a compromised or departing admin:

```sql
UPDATE public.admin_users
SET is_active = false
WHERE email = 'admin@example.com';
```

Then revoke active Supabase sessions for that user from the Supabase dashboard.

## Service Role Exposure

If `SUPABASE_SERVICE_ROLE_KEY` is suspected to be exposed:

1. Rotate the service role key in Supabase.
2. Update the deployment environment variable immediately.
3. Redeploy the app.
4. Review `admin_lead_status_events` for suspicious status changes.

## Audit Review

Successful and rejected admin lead status attempts are recorded in:

```sql
SELECT *
FROM public.admin_lead_status_events
ORDER BY created_at DESC
LIMIT 100;
```

Investigate repeated `rejected` rows, especially `invalid_token`, `forbidden`,
`invalid_payload`, and `transition_not_allowed`.
