-- ====================================================================
-- PawConnect Database Schema: Migration 02 - Auth Triggers & Helper Functions
-- Handles automatic profile creation upon Supabase auth sign-up
-- ====================================================================

-- 1. Helper function for automatically updating updated_at columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_vet_profiles_updated_at ON public.vet_profiles;
CREATE TRIGGER trigger_vet_profiles_updated_at
    BEFORE UPDATE ON public.vet_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_ngo_profiles_updated_at ON public.ngo_profiles;
CREATE TRIGGER trigger_ngo_profiles_updated_at
    BEFORE UPDATE ON public.ngo_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_pet_parent_profiles_updated_at ON public.pet_parent_profiles;
CREATE TRIGGER trigger_pet_parent_profiles_updated_at
    BEFORE UPDATE ON public.pet_parent_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_dogs_updated_at ON public.dogs;
CREATE TRIGGER trigger_dogs_updated_at
    BEFORE UPDATE ON public.dogs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON public.appointments;
CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_events_updated_at ON public.events;
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_carts_updated_at ON public.carts;
CREATE TRIGGER trigger_carts_updated_at
    BEFORE UPDATE ON public.carts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_ngo_campaigns_updated_at ON public.ngo_welfare_campaigns;
CREATE TRIGGER trigger_ngo_campaigns_updated_at
    BEFORE UPDATE ON public.ngo_welfare_campaigns
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 2. Auth Trigger: handle_new_user
-- Automatically copies Supabase auth.users row to public.profiles
-- and creates matching role sub-profile rows
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_full_name TEXT;
    v_phone TEXT;
    v_license_no TEXT;
    v_council_no TEXT;
    v_org_name TEXT;
    v_reg_no TEXT;
    v_welcome_coins INTEGER := 50;
BEGIN
    -- Extract metadata supplied during supabase.auth.signUp()
    v_role := UPPER(COALESCE(NEW.raw_user_meta_data->>'role', 'PET_PARENT'));
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    v_phone := NEW.raw_user_meta_data->>'phone';

    -- Validate role
    IF v_role NOT IN ('PET_PARENT', 'VET', 'NGO') THEN
        v_role := 'PET_PARENT';
    END IF;

    -- 1. Insert into public.profiles
    INSERT INTO public.profiles (
        id,
        full_name,
        role,
        email,
        phone,
        avatar_url,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        v_full_name,
        v_role,
        NEW.email,
        v_phone,
        NEW.raw_user_meta_data->>'avatar_url',
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        email = EXCLUDED.email,
        updated_at = now();

    -- 2. Create role-specific profile row
    IF v_role = 'VET' THEN
        v_license_no := COALESCE(NEW.raw_user_meta_data->>'license_number', 'PENDING_SUBMISSION');
        v_council_no := COALESCE(NEW.raw_user_meta_data->>'council_registration_no', 'PENDING_SUBMISSION');

        INSERT INTO public.vet_profiles (
            profile_id,
            license_number,
            council_registration_no,
            specialization,
            clinic_name,
            years_experience,
            verification_status,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            v_license_no,
            v_council_no,
            NEW.raw_user_meta_data->>'specialization',
            NEW.raw_user_meta_data->>'clinic_name',
            COALESCE((NEW.raw_user_meta_data->>'years_experience')::INTEGER, 0),
            'PENDING',
            now(),
            now()
        ) ON CONFLICT (profile_id) DO NOTHING;

    ELSIF v_role = 'NGO' THEN
        v_org_name := COALESCE(NEW.raw_user_meta_data->>'org_name', v_full_name);
        v_reg_no := COALESCE(NEW.raw_user_meta_data->>'registration_number', 'PENDING_SUBMISSION');

        INSERT INTO public.ngo_profiles (
            profile_id,
            org_name,
            registration_number,
            focus_area,
            contact_person,
            verification_status,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            v_org_name,
            v_reg_no,
            COALESCE(NEW.raw_user_meta_data->>'focus_area', 'Street Dog Welfare & Rescue'),
            v_full_name,
            'PENDING',
            now(),
            now()
        ) ON CONFLICT (profile_id) DO NOTHING;

    ELSE -- 'PET_PARENT'
        INSERT INTO public.pet_parent_profiles (
            profile_id,
            address,
            city,
            pincode,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'address',
            NEW.raw_user_meta_data->>'city',
            NEW.raw_user_meta_data->>'pincode',
            now(),
            now()
        ) ON CONFLICT (profile_id) DO NOTHING;

        -- Automatically initialize shopping cart
        INSERT INTO public.carts (pet_parent_id, created_at, updated_at)
        VALUES (NEW.id, now(), now())
        ON CONFLICT (pet_parent_id) DO NOTHING;

        -- Award 50 Welcome PawCoins
        INSERT INTO public.coin_transactions (
            pet_parent_id,
            type,
            source,
            amount,
            balance_after,
            created_at
        ) VALUES (
            NEW.id,
            'EARN',
            'WELCOME_BONUS',
            v_welcome_coins,
            v_welcome_coins,
            now()
        );

        -- Create Welcome Notification
        INSERT INTO public.notifications (
            profile_id,
            title,
            body,
            type,
            created_at
        ) VALUES (
            NEW.id,
            'Welcome to PawConnect! 🐾',
            'Your account is ready. We have credited 50 PawCoins to your wallet to kickstart your pet parenting journey!',
            'SYSTEM',
            now()
        );
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log exception but allow user auth to succeed
        RAISE WARNING 'handle_new_user trigger error: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
