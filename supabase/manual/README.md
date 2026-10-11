# Supabase-only SQL (not run by the backend)

These files depend on Supabase's `auth` and `storage` schemas and on `auth.uid()`:

- `V2__handle_new_user_trigger.sql`: creates a profile when a Supabase account is created.
- `V3__storage_and_rls.sql`: storage buckets and row-level security policies.

The backend's database is Aiven PostgreSQL, which has neither schema. The backend therefore does this work:

- Profiles are created on first sign-in by `ProfileProvisioningService`.
- Access rules live in the service layer, not in RLS.

Run these files only in a Supabase-hosted database, and only if you need its RLS policies for direct client access.
