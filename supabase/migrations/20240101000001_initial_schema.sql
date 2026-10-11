-- ====================================================================
-- PawConnect Database Schema: Migration 01 - Initial Schema & Types
-- Compatible with Supabase Postgres (Public Schema) & Flyway
-- ====================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Custom Types / Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('PET_PARENT', 'VET', 'NGO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE coin_tx_type AS ENUM ('EARN', 'REDEEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE donation_type AS ENUM ('COIN', 'CASH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('LOW', 'MODERATE', 'CONSULT_VET');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE rsvp_status AS ENUM ('GOING', 'INTERESTED', 'DECLINED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- 2. Identity & Roles
-- ====================================================================

-- Master Profile table mapped 1:1 to Supabase auth.users
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

-- Vet specific profile & credentials
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

-- NGO specific profile & credentials
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

-- Pet Parent profile details
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
-- 3. Dogs & Health
-- ====================================================================

-- Dogs owned by Pet Parents
CREATE TABLE IF NOT EXISTS public.dogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100),
    gender VARCHAR(10) CHECK (gender IN ('MALE', 'FEMALE', 'UNKNOWN')),
    dob DATE,
    weight NUMERIC(5, 2), -- weight in kg
    microchip_number VARCHAR(50),
    allergies TEXT,
    photo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consent Grants: grants a verified Vet temporary or ongoing view/edit rights to a Dog's records
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

-- Vaccination history and scheduled boosters
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

-- Medication records
CREATE TABLE IF NOT EXISTS public.medication_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    medication_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    schedule VARCHAR(100) NOT NULL, -- e.g., 'Twice daily after meals'
    start_date DATE NOT NULL,
    end_date DATE,
    is_ongoing BOOLEAN DEFAULT false,
    prescribed_by VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Symptom logs entered by Pet Parents
CREATE TABLE IF NOT EXISTS public.symptom_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    symptoms_text TEXT NOT NULL,
    appetite VARCHAR(50) NOT NULL, -- 'NORMAL', 'REDUCED', 'NONE'
    stool_consistency VARCHAR(50) NOT NULL, -- 'NORMAL', 'SOFT', 'WATERY', 'BLOODY'
    vomiting BOOLEAN NOT NULL DEFAULT false,
    lethargy BOOLEAN NOT NULL DEFAULT false,
    water_intake VARCHAR(50) DEFAULT 'NORMAL', -- 'NORMAL', 'INCREASED', 'DECREASED'
    logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Risk Assessments linked to symptom logs
CREATE TABLE IF NOT EXISTS public.ai_risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    source_symptom_log_id UUID REFERENCES public.symptom_logs(id) ON DELETE SET NULL,
    risk_level VARCHAR(32) NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'CONSULT_VET')),
    confidence_score NUMERIC(4, 3), -- 0.000 to 1.000
    explanation TEXT NOT NULL,
    recommendations TEXT,
    model_provider VARCHAR(50) NOT NULL DEFAULT 'groq',
    model_version VARCHAR(100) NOT NULL,
    input_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Uploaded clinical documents (blood tests, X-rays, discharge summaries)
CREATE TABLE IF NOT EXISTS public.health_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
    title VARCHAR(150) NOT NULL,
    file_url TEXT NOT NULL,
    doc_type VARCHAR(50) NOT NULL, -- 'LAB_REPORT', 'PRESCRIPTION', 'VACCINE_CERT', 'IMAGING', 'OTHER'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 4. Veterinary Connectivity
-- ====================================================================

-- Consultations / Appointments
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

-- Direct messaging between Vet and Pet Parent
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

-- Official digital prescriptions issued by Vets
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    vet_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    diagnosis TEXT,
    medication_details JSONB NOT NULL, -- array of {name, dosage, frequency, duration, instructions}
    general_advice TEXT,
    follow_up_date DATE,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 5. Notifications & Events
-- ====================================================================

-- Scheduled health reminders
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    pet_parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'VACCINATION', 'MEDICATION', 'APPOINTMENT', 'DEWORMING', 'GENERAL'
    due_date TIMESTAMPTZ NOT NULL,
    is_sent BOOLEAN NOT NULL DEFAULT false,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- In-app user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'HEALTH', 'REMINDER', 'ORDER', 'DONATION', 'APPOINTMENT', 'SYSTEM'
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Welfare, adoption, and vaccination drives posted by NGOs
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'ADOPTION_DRIVE', 'VACCINATION_CAMP', 'FEEDING_DRIVE', 'AWARENESS'
    location TEXT NOT NULL,
    city VARCHAR(100),
    event_date TIMESTAMPTZ NOT NULL,
    posted_by_ngo_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    banner_url TEXT,
    max_participants INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RSVPs to events
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rsvp_status VARCHAR(32) NOT NULL DEFAULT 'GOING' CHECK (rsvp_status IN ('GOING', 'INTERESTED', 'DECLINED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(event_id, profile_id)
);

-- ====================================================================
-- 6. E-commerce (PawStore)
-- ====================================================================

-- Product Categories
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products in store
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

-- Shopping carts
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_parent_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shopping cart items
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(cart_id, product_id)
);

-- Orders placed
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

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL
);

-- Payment transactions
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    gateway_ref VARCHAR(100), -- Razorpay payment_id / order_id
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    payment_method VARCHAR(50),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 7. Rewards (PawCoins)
-- ====================================================================

-- Ledger of coin transactions
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL CHECK (type IN ('EARN', 'REDEEM')),
    source VARCHAR(100) NOT NULL, -- 'VACCINATION_LOG', 'STORE_PURCHASE', 'NGO_DONATION', 'STREAK_BONUS'
    amount INTEGER NOT NULL CHECK (amount > 0),
    balance_after INTEGER NOT NULL,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configurable reward rules
CREATE TABLE IF NOT EXISTS public.coin_earning_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type VARCHAR(100) NOT NULL UNIQUE,
    coins_awarded INTEGER NOT NULL CHECK (coins_awarded > 0),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 8. NGO & Street Dog Welfare
-- ====================================================================

-- Welfare fundraising campaigns created by verified NGOs
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

-- Donations made to campaigns (either PawCoins or direct INR/Cash)
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

-- Links coin donations to the specific coin transaction record
CREATE TABLE IF NOT EXISTS public.donation_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    coin_transaction_id UUID NOT NULL REFERENCES public.coin_transactions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transparent impact reports posted by NGOs
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
-- 9. Audit Logging
-- ====================================================================

-- Security audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g. 'RECORD_VIEW', 'CONSENT_GRANTED', 'DONATION_MADE'
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 10. Performance Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_vet_profiles_status ON public.vet_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_ngo_profiles_status ON public.ngo_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_dogs_pet_parent ON public.dogs(pet_parent_id);
CREATE INDEX IF NOT EXISTS idx_consent_grants_dog ON public.consent_grants(dog_id, vet_id);
CREATE INDEX IF NOT EXISTS idx_consent_active ON public.consent_grants(dog_id, vet_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vaccinations_dog ON public.vaccination_records(dog_id);
CREATE INDEX IF NOT EXISTS idx_medications_dog ON public.medication_records(dog_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_dog ON public.symptom_logs(dog_id);
CREATE INDEX IF NOT EXISTS idx_ai_risk_dog ON public.ai_risk_assessments(dog_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vet ON public.appointments(vet_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_pet_parent ON public.appointments(pet_parent_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_vet_messages_appointment ON public.vet_messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due ON public.reminders(due_date) WHERE is_sent = false;
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON public.notifications(profile_id, is_read);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_coin_tx_parent ON public.coin_transactions(pet_parent_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON public.donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_ngo ON public.donations(ngo_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_profile ON public.audit_logs(profile_id);
