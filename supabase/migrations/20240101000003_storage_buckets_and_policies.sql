-- ====================================================================
-- PawConnect Database Schema: Migration 03 - Storage Buckets & Policies
-- Configures Supabase Storage for verification documents, dog photos, etc.
-- ====================================================================

-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('verification-documents', 'verification-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    ('dog-photos', 'dog-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('health-documents', 'health-documents', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    ('campaign-photos', 'campaign-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('prescriptions', 'prescriptions', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies on storage.objects

-- A. Dog Photos: Public Read, Authenticated Pet Parent Upload/Update
DROP POLICY IF EXISTS "Public can view dog photos" ON storage.objects;
CREATE POLICY "Public can view dog photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'dog-photos');

DROP POLICY IF EXISTS "Authenticated users can upload dog photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload dog photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'dog-photos'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Pet Parents can update/delete their dog photos" ON storage.objects;
CREATE POLICY "Pet Parents can update/delete their dog photos"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'dog-photos'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- B. Verification Documents: Private
-- Only the owner (VET or NGO) can upload or read their document; platform admins can read.
DROP POLICY IF EXISTS "Users can read own verification documents" ON storage.objects;
CREATE POLICY "Users can read own verification documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'verification-documents'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Vets and NGOs can upload verification documents" ON storage.objects;
CREATE POLICY "Vets and NGOs can upload verification documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'verification-documents'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- C. Health Documents: Private
-- Pet parent can read and upload.
-- Consent-granted vets can read.
DROP POLICY IF EXISTS "Pet parents and consented vets can view health docs" ON storage.objects;
CREATE POLICY "Pet parents and consented vets can view health docs"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'health-documents'
        AND auth.role() = 'authenticated'
        AND (
            -- Owner pet parent folder structure: <pet_parent_id>/<dog_id>/<file>
            (storage.foldername(name))[1] = auth.uid()::text
            OR
            -- Consent granted vet
            EXISTS (
                SELECT 1 FROM public.consent_grants cg
                WHERE cg.vet_id = auth.uid()
                  AND cg.dog_id::text = (storage.foldername(name))[2]
                  AND cg.revoked_at IS NULL
                  AND (cg.expires_at IS NULL OR cg.expires_at > now())
            )
        )
    );

DROP POLICY IF EXISTS "Pet parents can upload health documents" ON storage.objects;
CREATE POLICY "Pet parents can upload health documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'health-documents'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- D. Campaign Photos & Impact Reports: Public Read, NGO Upload
DROP POLICY IF EXISTS "Public can view campaign photos" ON storage.objects;
CREATE POLICY "Public can view campaign photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'campaign-photos');

DROP POLICY IF EXISTS "NGOs can upload campaign photos" ON storage.objects;
CREATE POLICY "NGOs can upload campaign photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'campaign-photos'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- E. Avatars: Public Read, Owner Manage
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can manage their own avatar" ON storage.objects;
CREATE POLICY "Users can manage their own avatar"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
