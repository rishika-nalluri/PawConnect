# PawConnect — Supabase Database & Auth Setup (Steps 1 & 2)

This directory contains the database migration scripts, auth triggers, storage bucket setup, and Row Level Security (RLS) policies for **PawConnect**.

---

## Quick Setup (via Supabase Web Dashboard)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and navigate to your project.
2. Go to **SQL Editor**.
3. Copy the contents of [`setup_complete.sql`](./setup_complete.sql) and paste it into the query editor.
4. Click **Run**.
5. Go to **Authentication -> Settings -> Providers**:
   - Ensure **Email** auth is enabled.
   - (Optional) Disable "Confirm email" during local development if you want immediate logins.
6. Go to **Storage**:
   - Verify that the following 6 buckets are present:
     - `verification-documents` (private)
     - `dog-photos` (public)
     - `health-documents` (private)
     - `campaign-photos` (public)
     - `prescriptions` (private)
     - `avatars` (public)

---

## Individual Migration Files (for Flyway or Supabase CLI)

If you use the Supabase CLI (`supabase db push`) or Flyway migrations:

- `20240101000001_initial_schema.sql` — Extensions, enums, 32 core tables, and indexes.
- `20240101000002_handle_new_user_trigger.sql` — Automatic profile generation trigger on `auth.users` insert with role mapping (`PET_PARENT`, `VET`, `NGO`) and welcome bonus coins.
- `20240101000003_storage_buckets_and_policies.sql` — Storage bucket configuration and object-level permissions.
- `20240101000004_row_level_security.sql` — Defense-in-depth RLS policies on all 32 public tables, including consent-based vet record access.
- `20240101000005_seed_data.sql` — E-commerce categories, initial wellness catalog, and coin earning rules.

---

## Role-Based Auth Flow Verification

1. When a user registers via `supabase.auth.signUp`:
   ```javascript
   await supabase.auth.signUp({
     email: 'dr.sharma@example.com',
     password: 'SecurePassword123!',
     options: {
       data: {
         full_name: 'Dr. Aarav Sharma',
         role: 'VET',
         license_number: 'VET-IN-2024-8841',
         council_registration_no: 'VCI/2018/4910',
         specialization: 'Canine Gastroenterology & Internal Medicine',
         clinic_name: 'Apex Canine Care'
       }
     }
   });
   ```
2. The trigger `public.handle_new_user` immediately creates:
   - A row in `public.profiles` with `role = 'VET'`.
   - A row in `public.vet_profiles` with `verification_status = 'PENDING'`.
3. Vets/NGOs upload their license/registration documents to the `verification-documents` storage bucket.
4. Admins change `verification_status` to `'VERIFIED'` to enable public discovery and active appointment scheduling.
