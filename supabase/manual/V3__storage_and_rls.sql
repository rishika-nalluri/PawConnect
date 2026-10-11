-- V3__storage_and_rls.sql
-- Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('verification-documents', 'verification-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    ('dog-photos', 'dog-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('health-documents', 'health-documents', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    ('campaign-photos', 'campaign-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('prescriptions', 'prescriptions', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage object policies
DROP POLICY IF EXISTS "Public can view dog photos" ON storage.objects;
CREATE POLICY "Public can view dog photos" ON storage.objects FOR SELECT USING (bucket_id = 'dog-photos');

DROP POLICY IF EXISTS "Authenticated users upload dog photos" ON storage.objects;
CREATE POLICY "Authenticated users upload dog photos" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dog-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Owners manage verification docs" ON storage.objects;
CREATE POLICY "Owners manage verification docs" ON storage.objects FOR ALL
USING (bucket_id = 'verification-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view campaign photos" ON storage.objects;
CREATE POLICY "Public can view campaign photos" ON storage.objects FOR SELECT USING (bucket_id = 'campaign-photos');

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.has_active_consent(p_dog_id UUID, p_vet_id UUID)
RETURNS BOOLEAN STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.consent_grants cg
        WHERE cg.dog_id = p_dog_id AND cg.vet_id = p_vet_id AND cg.revoked_at IS NULL
          AND (cg.expires_at IS NULL OR cg.expires_at > now())
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.owns_dog(p_dog_id UUID, p_user_id UUID)
RETURNS BOOLEAN STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.dogs d WHERE d.id = p_dog_id AND d.pet_parent_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vet_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_earning_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_welfare_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Baseline Policies
DROP POLICY IF EXISTS "Profiles read policy" ON public.profiles;
CREATE POLICY "Profiles read policy" ON public.profiles FOR SELECT
USING (auth.uid() = id OR role IN ('VET', 'NGO') OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy" ON public.profiles FOR UPDATE
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Vet profiles read policy" ON public.vet_profiles;
CREATE POLICY "Vet profiles read policy" ON public.vet_profiles FOR SELECT
USING (verification_status = 'VERIFIED' OR auth.uid() = profile_id);

DROP POLICY IF EXISTS "NGO profiles read policy" ON public.ngo_profiles;
CREATE POLICY "NGO profiles read policy" ON public.ngo_profiles FOR SELECT
USING (verification_status = 'VERIFIED' OR auth.uid() = profile_id);

DROP POLICY IF EXISTS "Pet parent profile manage" ON public.pet_parent_profiles;
CREATE POLICY "Pet parent profile manage" ON public.pet_parent_profiles FOR ALL
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Dogs view policy" ON public.dogs;
CREATE POLICY "Dogs view policy" ON public.dogs FOR SELECT
USING (auth.uid() = pet_parent_id OR public.has_active_consent(id, auth.uid()));

DROP POLICY IF EXISTS "Dogs manage policy" ON public.dogs;
CREATE POLICY "Dogs manage policy" ON public.dogs FOR ALL
USING (auth.uid() = pet_parent_id);

DROP POLICY IF EXISTS "Consent grants view" ON public.consent_grants;
CREATE POLICY "Consent grants view" ON public.consent_grants FOR SELECT
USING (auth.uid() = pet_parent_id OR auth.uid() = vet_id);

DROP POLICY IF EXISTS "Consent grants manage" ON public.consent_grants;
CREATE POLICY "Consent grants manage" ON public.consent_grants FOR ALL
USING (auth.uid() = pet_parent_id);

DROP POLICY IF EXISTS "Vaccinations access" ON public.vaccination_records;
CREATE POLICY "Vaccinations access" ON public.vaccination_records FOR ALL
USING (public.owns_dog(dog_id, auth.uid()) OR public.has_active_consent(dog_id, auth.uid()));

DROP POLICY IF EXISTS "Medications access" ON public.medication_records;
CREATE POLICY "Medications access" ON public.medication_records FOR ALL
USING (public.owns_dog(dog_id, auth.uid()) OR public.has_active_consent(dog_id, auth.uid()));

DROP POLICY IF EXISTS "Symptom logs access" ON public.symptom_logs;
CREATE POLICY "Symptom logs access" ON public.symptom_logs FOR SELECT
USING (public.owns_dog(dog_id, auth.uid()) OR public.has_active_consent(dog_id, auth.uid()));

DROP POLICY IF EXISTS "Symptom logs insert" ON public.symptom_logs;
CREATE POLICY "Symptom logs insert" ON public.symptom_logs FOR INSERT
WITH CHECK (public.owns_dog(dog_id, auth.uid()));

DROP POLICY IF EXISTS "AI risk assessments access" ON public.ai_risk_assessments;
CREATE POLICY "AI risk assessments access" ON public.ai_risk_assessments FOR SELECT
USING (public.owns_dog(dog_id, auth.uid()) OR public.has_active_consent(dog_id, auth.uid()));

DROP POLICY IF EXISTS "Health documents access" ON public.health_documents;
CREATE POLICY "Health documents access" ON public.health_documents FOR ALL
USING (public.owns_dog(dog_id, auth.uid()) OR public.has_active_consent(dog_id, auth.uid()));
