-- ====================================================================
-- PawConnect: Complete Supabase Database Setup Script
-- Run this script directly in the Supabase Dashboard -> SQL Editor
-- Includes:
--   1. Extensions & Enums
--   2. 32 Tables (Profiles, Dogs, Health, VetConnect, Store, Rewards, NGO, Audit)
--   3. Automated Auth Triggers (handle_new_user, updated_at)
--   4. Supabase Storage Buckets & Policies
--   5. Full Row Level Security (RLS) & Consent-Gated Vet Access Policies
--   6. Seed Data (Categories, Initial Products, Coin Earning Rules)
-- ====================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Custom Types / Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('PET_PARENT', 'VET', 'NGO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE coin_tx_type AS ENUM ('EARN', 'REDEEM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE donation_type AS ENUM ('COIN', 'CASH');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('LOW', 'MODERATE', 'CONSULT_VET');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE rsvp_status AS ENUM ('GOING', 'INTERESTED', 'DECLINED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ====================================================================
-- 2. Identity & Roles Tables
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('PET_PARENT', 'VET', 'NGO')),
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vet_profiles (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL,
    council_registration_no TEXT NOT NULL,
    specialization TEXT,
    clinic_name TEXT,
    clinic_address TEXT,
    years_experience INTEGER DEFAULT 0,
    consultation_fee NUMERIC(10, 2) DEFAULT 0.00,
    bio TEXT,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    verification_doc_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ngo_profiles (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    org_name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    registration_cert_url TEXT,
    focus_area TEXT,
    address TEXT,
    city TEXT,
    pincode TEXT,
    contact_person TEXT,
    website_url TEXT,
    bio TEXT,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pet_parent_profiles (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    address TEXT,
    city TEXT,
    pincode TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 3. Dogs & Health Tables
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.dogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100),
    gender VARCHAR(10) CHECK (gender IN ('MALE', 'FEMALE', 'UNKNOWN')),
    dob DATE,
    weight NUMERIC(5, 2),
    microchip_number VARCHAR(50),
    allergies TEXT,
    photo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consent_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    pet_parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vet_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vaccination_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(150) NOT NULL,
    batch_number VARCHAR(100),
    administered_by VARCHAR(150),
    date_given DATE NOT NULL,
    next_due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.medication_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    medication_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    schedule VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_ongoing BOOLEAN DEFAULT false,
    prescribed_by VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.symptom_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    symptoms_text TEXT NOT NULL,
    appetite VARCHAR(50) NOT NULL,
    stool_consistency VARCHAR(50) NOT NULL,
    vomiting BOOLEAN NOT NULL DEFAULT false,
    lethargy BOOLEAN NOT NULL DEFAULT false,
    water_intake VARCHAR(50) DEFAULT 'NORMAL',
    logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    source_symptom_log_id UUID REFERENCES public.symptom_logs(id) ON DELETE SET NULL,
    risk_level VARCHAR(32) NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'CONSULT_VET')),
    confidence_score NUMERIC(4, 3),
    explanation TEXT NOT NULL,
    recommendations TEXT,
    model_provider VARCHAR(50) NOT NULL DEFAULT 'groq',
    model_version VARCHAR(100) NOT NULL,
    input_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.health_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
    title VARCHAR(150) NOT NULL,
    file_url TEXT NOT NULL,
    doc_type VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 4. Veterinary Connectivity Tables
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    vet_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pet_parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    reason TEXT,
    notes TEXT,
    meeting_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vet_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    vet_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    diagnosis TEXT,
    medication_details JSONB NOT NULL,
    general_advice TEXT,
    follow_up_date DATE,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 5. Notifications & Events Tables
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    pet_parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    is_sent BOOLEAN NOT NULL DEFAULT false,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    location TEXT NOT NULL,
    city VARCHAR(100),
    event_date TIMESTAMPTZ NOT NULL,
    posted_by_ngo_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    banner_url TEXT,
    max_participants INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rsvp_status VARCHAR(32) NOT NULL DEFAULT 'GOING' CHECK (rsvp_status IN ('GOING', 'INTERESTED', 'DECLINED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(event_id, profile_id)
);

-- ====================================================================
-- 6. E-Commerce (PawStore) Tables
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    coin_eligible BOOLEAN NOT NULL DEFAULT true,
    coins_reward INTEGER DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_parent_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    coins_used INTEGER DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'PLACED' CHECK (status IN ('PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    shipping_address TEXT NOT NULL,
    placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    gateway_ref VARCHAR(100),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    payment_method VARCHAR(50),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 7. Rewards (PawCoins) Tables
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL CHECK (type IN ('EARN', 'REDEEM')),
    source VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    balance_after INTEGER NOT NULL,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coin_earning_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type VARCHAR(100) NOT NULL UNIQUE,
    coins_awarded INTEGER NOT NULL CHECK (coins_awarded > 0),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 8. NGO & Street Dog Welfare Tables
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.ngo_welfare_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    target_amount NUMERIC(10, 2) NOT NULL CHECK (target_amount > 0),
    achieved_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    coins_collected INTEGER NOT NULL DEFAULT 0,
    cover_image_url TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'PAUSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ngo_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.ngo_welfare_campaigns(id) ON DELETE CASCADE,
    donation_type VARCHAR(32) NOT NULL CHECK (donation_type IN ('COIN', 'CASH')),
    coins_used INTEGER DEFAULT 0,
    cash_amount NUMERIC(10, 2) DEFAULT 0.00,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    donor_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.donation_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    coin_transaction_id UUID NOT NULL REFERENCES public.coin_transactions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.impact_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.ngo_welfare_campaigns(id) ON DELETE CASCADE,
    ngo_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    report_text TEXT NOT NULL,
    dogs_fed_count INTEGER DEFAULT 0,
    dogs_vaccinated_count INTEGER DEFAULT 0,
    dogs_treated_count INTEGER DEFAULT 0,
    photo_url TEXT,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 9. Audit Logging Table
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 10. Triggers & Helper Functions
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_vet_profiles_updated_at ON public.vet_profiles;
CREATE TRIGGER trigger_vet_profiles_updated_at BEFORE UPDATE ON public.vet_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_ngo_profiles_updated_at ON public.ngo_profiles;
CREATE TRIGGER trigger_ngo_profiles_updated_at BEFORE UPDATE ON public.ngo_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_pet_parent_profiles_updated_at ON public.pet_parent_profiles;
CREATE TRIGGER trigger_pet_parent_profiles_updated_at BEFORE UPDATE ON public.pet_parent_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_dogs_updated_at ON public.dogs;
CREATE TRIGGER trigger_dogs_updated_at BEFORE UPDATE ON public.dogs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON public.appointments;
CREATE TRIGGER trigger_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_events_updated_at ON public.events;
CREATE TRIGGER trigger_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_carts_updated_at ON public.carts;
CREATE TRIGGER trigger_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_ngo_campaigns_updated_at ON public.ngo_welfare_campaigns;
CREATE TRIGGER trigger_ngo_campaigns_updated_at BEFORE UPDATE ON public.ngo_welfare_campaigns FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auth trigger to populate profiles and role tables
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_full_name TEXT;
    v_phone TEXT;
    v_welcome_coins INTEGER := 50;
BEGIN
    v_role := UPPER(COALESCE(NEW.raw_user_meta_data->>'role', 'PET_PARENT'));
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    v_phone := NEW.raw_user_meta_data->>'phone';

    IF v_role NOT IN ('PET_PARENT', 'VET', 'NGO') THEN
        v_role := 'PET_PARENT';
    END IF;

    INSERT INTO public.profiles (
        id, full_name, role, email, phone, avatar_url, created_at, updated_at
    ) VALUES (
        NEW.id, v_full_name, v_role, NEW.email, v_phone,
        NEW.raw_user_meta_data->>'avatar_url', now(), now()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        email = EXCLUDED.email,
        updated_at = now();

    IF v_role = 'VET' THEN
        INSERT INTO public.vet_profiles (
            profile_id, license_number, council_registration_no,
            specialization, clinic_name, years_experience, verification_status,
            created_at, updated_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'license_number', 'PENDING_SUBMISSION'),
            COALESCE(NEW.raw_user_meta_data->>'council_registration_no', 'PENDING_SUBMISSION'),
            NEW.raw_user_meta_data->>'specialization',
            NEW.raw_user_meta_data->>'clinic_name',
            COALESCE((NEW.raw_user_meta_data->>'years_experience')::INTEGER, 0),
            'PENDING',
            now(), now()
        ) ON CONFLICT (profile_id) DO NOTHING;

    ELSIF v_role = 'NGO' THEN
        INSERT INTO public.ngo_profiles (
            profile_id, org_name, registration_number, focus_area, contact_person,
            verification_status, created_at, updated_at
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'org_name', v_full_name),
            COALESCE(NEW.raw_user_meta_data->>'registration_number', 'PENDING_SUBMISSION'),
            COALESCE(NEW.raw_user_meta_data->>'focus_area', 'Street Dog Welfare & Rescue'),
            v_full_name,
            'PENDING',
            now(), now()
        ) ON CONFLICT (profile_id) DO NOTHING;

    ELSE
        INSERT INTO public.pet_parent_profiles (
            profile_id, address, city, pincode, created_at, updated_at
        ) VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'address',
            NEW.raw_user_meta_data->>'city',
            NEW.raw_user_meta_data->>'pincode',
            now(), now()
        ) ON CONFLICT (profile_id) DO NOTHING;

        INSERT INTO public.carts (pet_parent_id, created_at, updated_at)
        VALUES (NEW.id, now(), now())
        ON CONFLICT (pet_parent_id) DO NOTHING;

        INSERT INTO public.coin_transactions (
            pet_parent_id, type, source, amount, balance_after, created_at
        ) VALUES (
            NEW.id, 'EARN', 'WELCOME_BONUS', v_welcome_coins, v_welcome_coins, now()
        );

        INSERT INTO public.notifications (
            profile_id, title, body, type, created_at
        ) VALUES (
            NEW.id,
            'Welcome to PawConnect! 🐾',
            'Your account is ready. 50 PawCoins have been added to your wallet to kickstart your pet parenting journey!',
            'SYSTEM',
            now()
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 11. Storage Buckets & Policies
-- ====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('verification-documents', 'verification-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    ('dog-photos', 'dog-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('health-documents', 'health-documents', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    ('campaign-photos', 'campaign-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('prescriptions', 'prescriptions', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
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

DROP POLICY IF EXISTS "Authenticated upload campaign photos" ON storage.objects;
CREATE POLICY "Authenticated upload campaign photos" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campaign-photos' AND auth.role() = 'authenticated');

-- ====================================================================
-- 12. Row Level Security (RLS) Helper Functions & Policies
-- ====================================================================

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

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles read policy" ON public.profiles;
CREATE POLICY "Profiles read policy" ON public.profiles FOR SELECT
USING (auth.uid() = id OR role IN ('VET', 'NGO') OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy" ON public.profiles FOR UPDATE
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Vet & NGO profile discovery
DROP POLICY IF EXISTS "Vet profiles read policy" ON public.vet_profiles;
CREATE POLICY "Vet profiles read policy" ON public.vet_profiles FOR SELECT
USING (verification_status = 'VERIFIED' OR auth.uid() = profile_id);

DROP POLICY IF EXISTS "Vet update own profile" ON public.vet_profiles;
CREATE POLICY "Vet update own profile" ON public.vet_profiles FOR UPDATE
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "NGO profiles read policy" ON public.ngo_profiles;
CREATE POLICY "NGO profiles read policy" ON public.ngo_profiles FOR SELECT
USING (verification_status = 'VERIFIED' OR auth.uid() = profile_id);

DROP POLICY IF EXISTS "NGO update own profile" ON public.ngo_profiles;
CREATE POLICY "NGO update own profile" ON public.ngo_profiles FOR UPDATE
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Pet parent profile manage" ON public.pet_parent_profiles;
CREATE POLICY "Pet parent profile manage" ON public.pet_parent_profiles FOR ALL
USING (auth.uid() = profile_id);

-- Dogs & Consent Grants
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

-- Health records consent-based policies
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

DROP POLICY IF EXISTS "AI risk assessments insert" ON public.ai_risk_assessments;
CREATE POLICY "AI risk assessments insert" ON public.ai_risk_assessments FOR INSERT
WITH CHECK (public.owns_dog(dog_id, auth.uid()) OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Health documents access" ON public.health_documents;
CREATE POLICY "Health documents access" ON public.health_documents FOR ALL
USING (public.owns_dog(dog_id, auth.uid()) OR public.has_active_consent(dog_id, auth.uid()));

-- VetConnect
DROP POLICY IF EXISTS "Appointments access" ON public.appointments;
CREATE POLICY "Appointments access" ON public.appointments FOR ALL
USING (auth.uid() = pet_parent_id OR auth.uid() = vet_id);

DROP POLICY IF EXISTS "Messages access" ON public.vet_messages;
CREATE POLICY "Messages access" ON public.vet_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Messages insert" ON public.vet_messages;
CREATE POLICY "Messages insert" ON public.vet_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Prescriptions view" ON public.prescriptions;
CREATE POLICY "Prescriptions view" ON public.prescriptions FOR SELECT
USING (auth.uid() = vet_id OR public.owns_dog(dog_id, auth.uid()));

DROP POLICY IF EXISTS "Prescriptions insert" ON public.prescriptions;
CREATE POLICY "Prescriptions insert" ON public.prescriptions FOR INSERT
WITH CHECK (auth.uid() = vet_id AND public.has_active_consent(dog_id, auth.uid()));

-- Reminders & Notifications
DROP POLICY IF EXISTS "Reminders manage" ON public.reminders;
CREATE POLICY "Reminders manage" ON public.reminders FOR ALL USING (auth.uid() = pet_parent_id);

DROP POLICY IF EXISTS "Notifications manage" ON public.notifications;
CREATE POLICY "Notifications manage" ON public.notifications FOR ALL USING (auth.uid() = profile_id);

-- Events & RSVPs
DROP POLICY IF EXISTS "Events read" ON public.events;
CREATE POLICY "Events read" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Events manage" ON public.events;
CREATE POLICY "Events manage" ON public.events FOR ALL USING (auth.uid() = posted_by_ngo_id);

DROP POLICY IF EXISTS "Event RSVPs view" ON public.event_rsvps;
CREATE POLICY "Event RSVPs view" ON public.event_rsvps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Event RSVPs manage" ON public.event_rsvps;
CREATE POLICY "Event RSVPs manage" ON public.event_rsvps FOR ALL USING (auth.uid() = profile_id);

-- Store
DROP POLICY IF EXISTS "Categories read" ON public.product_categories;
CREATE POLICY "Categories read" ON public.product_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products read" ON public.products;
CREATE POLICY "Products read" ON public.products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Carts manage" ON public.carts;
CREATE POLICY "Carts manage" ON public.carts FOR ALL USING (auth.uid() = pet_parent_id);

DROP POLICY IF EXISTS "Cart items manage" ON public.cart_items;
CREATE POLICY "Cart items manage" ON public.cart_items FOR ALL
USING (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.pet_parent_id = auth.uid()));

DROP POLICY IF EXISTS "Orders view" ON public.orders;
CREATE POLICY "Orders view" ON public.orders FOR SELECT USING (auth.uid() = pet_parent_id);

DROP POLICY IF EXISTS "Orders insert" ON public.orders;
CREATE POLICY "Orders insert" ON public.orders FOR INSERT WITH CHECK (auth.uid() = pet_parent_id);

DROP POLICY IF EXISTS "Order items access" ON public.order_items;
CREATE POLICY "Order items access" ON public.order_items FOR ALL
USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.pet_parent_id = auth.uid()));

DROP POLICY IF EXISTS "Payments access" ON public.payments;
CREATE POLICY "Payments access" ON public.payments FOR ALL USING (auth.uid() = profile_id);

-- Rewards & NGO Welfare
DROP POLICY IF EXISTS "Coin transactions read" ON public.coin_transactions;
CREATE POLICY "Coin transactions read" ON public.coin_transactions FOR SELECT USING (auth.uid() = pet_parent_id);

DROP POLICY IF EXISTS "Coin rules read" ON public.coin_earning_rules;
CREATE POLICY "Coin rules read" ON public.coin_earning_rules FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Campaigns read" ON public.ngo_welfare_campaigns;
CREATE POLICY "Campaigns read" ON public.ngo_welfare_campaigns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Campaigns manage" ON public.ngo_welfare_campaigns;
CREATE POLICY "Campaigns manage" ON public.ngo_welfare_campaigns FOR ALL USING (auth.uid() = ngo_id);

DROP POLICY IF EXISTS "Donations read" ON public.donations;
CREATE POLICY "Donations read" ON public.donations FOR SELECT USING (auth.uid() = pet_parent_id OR auth.uid() = ngo_id);

DROP POLICY IF EXISTS "Donations insert" ON public.donations;
CREATE POLICY "Donations insert" ON public.donations FOR INSERT WITH CHECK (auth.uid() = pet_parent_id);

DROP POLICY IF EXISTS "Impact reports read" ON public.impact_reports;
CREATE POLICY "Impact reports read" ON public.impact_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Impact reports manage" ON public.impact_reports;
CREATE POLICY "Impact reports manage" ON public.impact_reports FOR ALL USING (auth.uid() = ngo_id);

DROP POLICY IF EXISTS "Audit logs read" ON public.audit_logs;
CREATE POLICY "Audit logs read" ON public.audit_logs FOR SELECT USING (auth.uid() = profile_id);

-- ====================================================================
-- 13. Seed Data
-- ====================================================================

INSERT INTO public.coin_earning_rules (activity_type, coins_awarded, description, is_active)
VALUES
    ('VACCINATION_LOG', 50, 'Awarded when a verified vaccination record is added', true),
    ('SYMPTOM_LOG', 15, 'Awarded when logging a preliminary symptom check for your dog', true),
    ('HEALTH_CHECKUP', 40, 'Awarded upon completion of a vet consultation', true),
    ('STORE_PURCHASE', 20, 'Awarded per 500 INR spent on PawStore dog wellness products', true),
    ('EVENT_ATTENDANCE', 30, 'Awarded when attending an NGO adoption or feeding drive', true),
    ('PROFILE_COMPLETION', 25, 'Awarded for completing pet parent and dog details', true)
ON CONFLICT (activity_type) DO NOTHING;

INSERT INTO public.product_categories (name, slug, description, icon_name)
VALUES
    ('Food & Nutrition', 'food-nutrition', 'Premium dog food, nutritious treats, and vital supplements', 'Bone'),
    ('Healthcare & Meds', 'healthcare-meds', 'Dewormers, tick & flea treatments, and first-aid kits', 'HeartPulse'),
    ('Grooming & Hygiene', 'grooming-hygiene', 'Organic shampoos, dental chews, and paw balms', 'Sparkles'),
    ('Toys & Training', 'toys-training', 'Interactive puzzles, dental chew toys, and training leashes', 'Activity'),
    ('Accessories & Comfort', 'accessories-comfort', 'Orthopedic beds, ergonomic harnesses, and feeding bowls', 'ShieldCheck')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (category_id, name, slug, description, price, stock_qty, image_url, coin_eligible, coins_reward, is_active)
SELECT
    c.id,
    'Royal Canin Maxi Adult Canine Diet (4kg)',
    'royal-canin-maxi-adult-4kg',
    'High quality digestive security diet enriched with omega 3 fatty acids (EPA-DHA) for large breed adult dogs.',
    2850.00,
    45,
    'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80',
    true,
    50,
    true
FROM public.product_categories c WHERE c.slug = 'food-nutrition'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (category_id, name, slug, description, price, stock_qty, image_url, coin_eligible, coins_reward, is_active)
SELECT
    c.id,
    'Bravecto Chewable Tick & Flea Protection',
    'bravecto-chewable-tick-flea',
    'Single chew provides 12 weeks of comprehensive protection against ticks, fleas, and mites.',
    1950.00,
    60,
    'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80',
    true,
    35,
    true
FROM public.product_categories c WHERE c.slug = 'healthcare-meds'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (category_id, name, slug, description, price, stock_qty, image_url, coin_eligible, coins_reward, is_active)
SELECT
    c.id,
    'Organic Neem & Aloe Soothing Canine Shampoo (500ml)',
    'organic-neem-aloe-shampoo-500ml',
    'All-natural hypoallergenic shampoo soothing irritated skin and neutralizing odors naturally.',
    650.00,
    80,
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
    true,
    15,
    true
FROM public.product_categories c WHERE c.slug = 'grooming-hygiene'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (category_id, name, slug, description, price, stock_qty, image_url, coin_eligible, coins_reward, is_active)
SELECT
    c.id,
    'KONG Classic Durable Rubber Dental Chew Toy',
    'kong-classic-dental-chew-toy',
    'Ultra-durable natural rubber formula for dogs that love to chew and solve treat puzzles.',
    899.00,
    50,
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80',
    true,
    20,
    true
FROM public.product_categories c WHERE c.slug = 'toys-training'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (category_id, name, slug, description, price, stock_qty, image_url, coin_eligible, coins_reward, is_active)
SELECT
    c.id,
    'PawComfort Orthopedic Memory Foam Dog Bed',
    'pawcomfort-orthopedic-memory-foam-bed',
    'Therapeutic joint relief bed with waterproof washable liner and non-skid base.',
    3200.00,
    25,
    'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=600&q=80',
    true,
    60,
    true
FROM public.product_categories c WHERE c.slug = 'accessories-comfort'
ON CONFLICT (slug) DO NOTHING;
