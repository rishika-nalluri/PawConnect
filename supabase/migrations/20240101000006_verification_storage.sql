-- Run in the Supabase SQL Editor (this is the Supabase project, not Aiven).
-- Private bucket for vet and NGO verification documents. Users may upload and read only inside
-- their own folder, which is named after their user id. The backend reads files for admins with
-- the service role key, which bypasses these policies.

insert into storage.buckets (id, name, public)
values ('verification-docs', 'verification-docs', false)
on conflict (id) do nothing;

drop policy if exists "users upload own verification docs" on storage.objects;
create policy "users upload own verification docs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'verification-docs'
              and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "users read own verification docs" on storage.objects;
create policy "users read own verification docs" on storage.objects
  for select to authenticated
  using (bucket_id = 'verification-docs'
         and (storage.foldername(name))[1] = auth.uid()::text);
