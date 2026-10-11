-- ====================================================================
-- PawConnect Database Schema: Migration 04 - Row Level Security (RLS)
-- Defense-in-depth security policies for all tables in public schema
-- ====================================================================

-- 1. Helper Function: Check active consent grant between a vet and a dog
CREATE OR REPLACE FUNCTION public.has_active_consent(p_dog_id UUID, p_vet_id UUID)
RETURNS BOOLEAN
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.consent_grants cg
        WHERE cg.dog_id = p_dog_id
          AND cg.vet_id = p_vet_id
          AND cg.revoked_at IS NULL
          AND (cg.expires_at IS NULL OR cg.expires_at > now())
    );
END;
$$ LANGUAGE plpgsql;

-- Helper Function: Check if user owns dog
CREATE OR REPLACE FUNCTION public.owns_dog(p_dog_id UUID, p_user_id UUID)
RETURNS BOOLEAN
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.dogs d
        WHERE d.id = p_dog_id
          AND d.pet_parent_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- Enable RLS on all tables
-- ====================================================================
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

-- ====================================================================
-- RLS Policies: Profiles & Roles
-- ====================================================================

-- profiles
DROP POLICY IF EXISTS "Profiles are viewable by owner or if verified provider" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner or if verified provider"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = id
        OR role IN ('VET', 'NGO')
        OR auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- vet_profiles
DROP POLICY IF EXISTS "Vet profiles viewable by all if verified, or owner" ON public.vet_profiles;
CREATE POLICY "Vet profiles viewable by all if verified, or owner"
    ON public.vet_profiles FOR SELECT
    USING (
        verification_status = 'VERIFIED'
        OR auth.uid() = profile_id
    );

DROP POLICY IF EXISTS "Vets can update own profile" ON public.vet_profiles;
CREATE POLICY "Vets can update own profile"
    ON public.vet_profiles FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- ngo_profiles
DROP POLICY IF EXISTS "NGO profiles viewable by all if verified, or owner" ON public.ngo_profiles;
CREATE POLICY "NGO profiles viewable by all if verified, or owner"
    ON public.ngo_profiles FOR SELECT
    USING (
        verification_status = 'VERIFIED'
        OR auth.uid() = profile_id
    );

DROP POLICY IF EXISTS "NGOs can update own profile" ON public.ngo_profiles;
CREATE POLICY "NGOs can update own profile"
    ON public.ngo_profiles FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- pet_parent_profiles
DROP POLICY IF EXISTS "Pet parent profiles viewable by owner" ON public.pet_parent_profiles;
CREATE POLICY "Pet parent profiles viewable by owner"
    ON public.pet_parent_profiles FOR SELECT
    USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Pet parents can update own profile" ON public.pet_parent_profiles;
CREATE POLICY "Pet parents can update own profile"
    ON public.pet_parent_profiles FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- ====================================================================
-- RLS Policies: Dogs & Consent Grants
-- ====================================================================

-- dogs: Pet Parents manage own dogs; Consented Vets can view
DROP POLICY IF EXISTS "Pet parents can view own dogs" ON public.dogs;
CREATE POLICY "Pet parents can view own dogs"
    ON public.dogs FOR SELECT
    USING (
        auth.uid() = pet_parent_id
        OR public.has_active_consent(id, auth.uid())
    );

DROP POLICY IF EXISTS "Pet parents can insert own dogs" ON public.dogs;
CREATE POLICY "Pet parents can insert own dogs"
    ON public.dogs FOR INSERT
    WITH CHECK (auth.uid() = pet_parent_id);

DROP POLICY IF EXISTS "Pet parents can update own dogs" ON public.dogs;
CREATE POLICY "Pet parents can update own dogs"
    ON public.dogs FOR UPDATE
    USING (auth.uid() = pet_parent_id)
    WITH CHECK (auth.uid() = pet_parent_id);

DROP POLICY IF EXISTS "Pet parents can delete own dogs" ON public.dogs;
CREATE POLICY "Pet parents can delete own dogs"
    ON public.dogs FOR DELETE
    USING (auth.uid() = pet_parent_id);

-- consent_grants
DROP POLICY IF EXISTS "Consent grants viewable by pet parent or vet" ON public.consent_grants;
CREATE POLICY "Consent grants viewable by pet parent or vet"
    ON public.consent_grants FOR SELECT
    USING (
        auth.uid() = pet_parent_id
        OR auth.uid() = vet_id
    );

DROP POLICY IF EXISTS "Pet parents can grant consent" ON public.consent_grants;
CREATE POLICY "Pet parents can grant consent"
    ON public.consent_grants FOR INSERT
    WITH CHECK (
        auth.uid() = pet_parent_id
        AND public.owns_dog(dog_id, auth.uid())
    );

DROP POLICY IF EXISTS "Pet parents can revoke consent" ON public.consent_grants;
CREATE POLICY "Pet parents can revoke consent"
    ON public.consent_grants FOR UPDATE
    USING (auth.uid() = pet_parent_id)
    WITH CHECK (auth.uid() = pet_parent_id);

-- ====================================================================
-- RLS Policies: Health Records (Vaccines, Meds, Symptoms, AI, Docs)
-- ====================================================================

-- vaccination_records
DROP POLICY IF EXISTS "Vaccinations viewable by owner or consented vet" ON public.vaccination_records;
CREATE POLICY "Vaccinations viewable by owner or consented vet"
    ON public.vaccination_records FOR SELECT
    USING (
        public.owns_dog(dog_id, auth.uid())
        OR public.has_active_consent(dog_id, auth.uid())
    );

DROP POLICY IF EXISTS "Owner or consented vet can add vaccination record" ON public.vaccination_records;
CREATE POLICY "Owner or consented vet can add vaccination record"
    ON public.vaccination_records FOR INSERT
    WITH CHECK (
        public.owns_dog(dog_id, auth.uid())
        OR public.has_active_consent(dog_id, auth.uid())
    );

-- medication_records
DROP POLICY IF EXISTS "Medications viewable by owner or consented vet" ON public.medication_records;
CREATE POLICY "Medications viewable by owner or consented vet"
    ON public.medication_records FOR SELECT
    USING (
        public.owns_dog(dog_id, auth.uid())
        OR public.has_active_consent(dog_id, auth.uid())
    );

DROP POLICY IF EXISTS "Owner or consented vet can add medication" ON public.medication_records;
CREATE POLICY "Owner or consented vet can add medication"
    ON public.medication_records FOR INSERT
    WITH CHECK (
        public.owns_dog(dog_id, auth.uid())
        OR public.has_active_consent(dog_id, auth.uid())
    );

-- symptom_logs
DROP POLICY IF EXISTS "Symptom logs viewable by owner or consented vet" ON public.symptom_logs;
CREATE POLICY "Symptom logs viewable by owner or consented vet"
    ON public.symptom_logs FOR SELECT
    USING (
        public.owns_dog(dog_id, auth.uid())
        OR public.has_active_consent(dog_id, auth.uid())
    );

DROP POLICY IF EXISTS "Pet parents can log symptoms for their dog" ON public.symptom_logs;
CREATE POLICY "Pet parents can log symptoms for their dog"
    ON public.symptom_logs FOR INSERT
    WITH CHECK (public.owns_dog(dog_id, auth.uid()));

-- ai_risk_assessments
DROP POLICY IF EXISTS "AI risk assessments viewable by owner or consented vet" ON public.ai_risk_assessments;
CREATE POLICY "AI risk assessments viewable by owner or consented vet"
    ON public.ai_risk_assessments FOR SELECT
    USING (
        public.owns_dog(dog_id, auth.uid())
        OR public.has_active_consent(dog_id, auth.uid())
    );

DROP POLICY IF EXISTS "AI risk assessments insertable by owner or backend" ON public.ai_risk_assessments;
CREATE POLICY "AI risk assessments insertable by owner or backend"
    ON public.ai_risk_assessments FOR INSERT
    WITH CHECK (
        public.owns_dog(dog_id, auth.uid())
        OR auth.role() = 'service_role'
    );

-- health_documents
DROP POLICY IF EXISTS "Health documents viewable by owner or consented vet" ON public.health_documents;
CREATE POLICY "Health documents viewable by owner or consented vet"
    ON public.health_documents FOR SELECT
    USING (
        public.owns_dog(dog_id, auth.uid())
        OR public.has_active_consent(dog_id, auth.uid())
    );

DROP POLICY IF EXISTS "Owner or consented vet can upload health docs" ON public.health_documents;
CREATE POLICY "Owner or consented vet can upload health docs"
    ON public.health_documents FOR INSERT
    WITH CHECK (
        public.owns_dog(dog_id, auth.uid())
        OR public.has_active_consent(dog_id, auth.uid())
    );

-- ====================================================================
-- RLS Policies: Veterinary Connectivity
-- ====================================================================

-- appointments
DROP POLICY IF EXISTS "Appointments viewable by participants" ON public.appointments;
CREATE POLICY "Appointments viewable by participants"
    ON public.appointments FOR SELECT
    USING (
        auth.uid() = pet_parent_id
        OR auth.uid() = vet_id
    );

DROP POLICY IF EXISTS "Pet parents can book appointments" ON public.appointments;
CREATE POLICY "Pet parents can book appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (
        auth.uid() = pet_parent_id
        AND public.owns_dog(dog_id, auth.uid())
    );

DROP POLICY IF EXISTS "Participants can update appointments" ON public.appointments;
CREATE POLICY "Participants can update appointments"
    ON public.appointments FOR UPDATE
    USING (auth.uid() = pet_parent_id OR auth.uid() = vet_id);

-- vet_messages
DROP POLICY IF EXISTS "Messages viewable by sender or receiver" ON public.vet_messages;
CREATE POLICY "Messages viewable by sender or receiver"
    ON public.vet_messages FOR SELECT
    USING (
        auth.uid() = sender_id
        OR auth.uid() = receiver_id
    );

DROP POLICY IF EXISTS "Users can send messages" ON public.vet_messages;
CREATE POLICY "Users can send messages"
    ON public.vet_messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- prescriptions
DROP POLICY IF EXISTS "Prescriptions viewable by pet parent or prescribing vet" ON public.prescriptions;
CREATE POLICY "Prescriptions viewable by pet parent or prescribing vet"
    ON public.prescriptions FOR SELECT
    USING (
        auth.uid() = vet_id
        OR public.owns_dog(dog_id, auth.uid())
    );

DROP POLICY IF EXISTS "Vets can issue prescriptions" ON public.prescriptions;
CREATE POLICY "Vets can issue prescriptions"
    ON public.prescriptions FOR INSERT
    WITH CHECK (
        auth.uid() = vet_id
        AND public.has_active_consent(dog_id, auth.uid())
    );

-- ====================================================================
-- RLS Policies: Reminders & Notifications
-- ====================================================================

-- reminders
DROP POLICY IF EXISTS "Pet parents manage their dog reminders" ON public.reminders;
CREATE POLICY "Pet parents manage their dog reminders"
    ON public.reminders FOR ALL
    USING (auth.uid() = pet_parent_id);

-- notifications
DROP POLICY IF EXISTS "Users manage their notifications" ON public.notifications;
CREATE POLICY "Users manage their notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = profile_id);

-- ====================================================================
-- RLS Policies: Events & RSVPs
-- ====================================================================

-- events
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone"
    ON public.events FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "NGOs can post events" ON public.events;
CREATE POLICY "NGOs can post events"
    ON public.events FOR INSERT
    WITH CHECK (
        auth.uid() = posted_by_ngo_id
        AND EXISTS (
            SELECT 1 FROM public.ngo_profiles
            WHERE profile_id = auth.uid()
              AND verification_status = 'VERIFIED'
        )
    );

DROP POLICY IF EXISTS "NGOs can update their events" ON public.events;
CREATE POLICY "NGOs can update their events"
    ON public.events FOR UPDATE
    USING (auth.uid() = posted_by_ngo_id);

-- event_rsvps
DROP POLICY IF EXISTS "RSVPs viewable by everyone" ON public.event_rsvps;
CREATE POLICY "RSVPs viewable by everyone"
    ON public.event_rsvps FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users manage own RSVPs" ON public.event_rsvps;
CREATE POLICY "Users manage own RSVPs"
    ON public.event_rsvps FOR ALL
    USING (auth.uid() = profile_id);

-- ====================================================================
-- RLS Policies: Store & Orders
-- ====================================================================

-- product_categories & products
DROP POLICY IF EXISTS "Categories viewable by public" ON public.product_categories;
CREATE POLICY "Categories viewable by public"
    ON public.product_categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Active products viewable by public" ON public.products;
CREATE POLICY "Active products viewable by public"
    ON public.products FOR SELECT
    USING (is_active = true);

-- carts & cart_items
DROP POLICY IF EXISTS "Pet parents manage own cart" ON public.carts;
CREATE POLICY "Pet parents manage own cart"
    ON public.carts FOR ALL
    USING (auth.uid() = pet_parent_id);

DROP POLICY IF EXISTS "Pet parents manage own cart items" ON public.cart_items;
CREATE POLICY "Pet parents manage own cart items"
    ON public.cart_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.carts c
            WHERE c.id = cart_items.cart_id
              AND c.pet_parent_id = auth.uid()
        )
    );

-- orders & order_items
DROP POLICY IF EXISTS "Pet parents view own orders" ON public.orders;
CREATE POLICY "Pet parents view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = pet_parent_id);

DROP POLICY IF EXISTS "Pet parents create own orders" ON public.orders;
CREATE POLICY "Pet parents create own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = pet_parent_id);

DROP POLICY IF EXISTS "Pet parents view own order items" ON public.order_items;
CREATE POLICY "Pet parents view own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
              AND o.pet_parent_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Pet parents insert own order items" ON public.order_items;
CREATE POLICY "Pet parents insert own order items"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
              AND o.pet_parent_id = auth.uid()
        )
    );

-- payments
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;
CREATE POLICY "Users view own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users create own payments" ON public.payments;
CREATE POLICY "Users create own payments"
    ON public.payments FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

-- ====================================================================
-- RLS Policies: Rewards & Welfare Campaigns
-- ====================================================================

-- coin_transactions
DROP POLICY IF EXISTS "Pet parents view own coin transactions" ON public.coin_transactions;
CREATE POLICY "Pet parents view own coin transactions"
    ON public.coin_transactions FOR SELECT
    USING (auth.uid() = pet_parent_id);

-- coin_earning_rules
DROP POLICY IF EXISTS "Coin rules viewable by all" ON public.coin_earning_rules;
CREATE POLICY "Coin rules viewable by all"
    ON public.coin_earning_rules FOR SELECT
    USING (is_active = true);

-- ngo_welfare_campaigns
DROP POLICY IF EXISTS "Campaigns viewable by everyone" ON public.ngo_welfare_campaigns;
CREATE POLICY "Campaigns viewable by everyone"
    ON public.ngo_welfare_campaigns FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "NGOs can create campaigns" ON public.ngo_welfare_campaigns;
CREATE POLICY "NGOs can create campaigns"
    ON public.ngo_welfare_campaigns FOR INSERT
    WITH CHECK (
        auth.uid() = ngo_id
        AND EXISTS (
            SELECT 1 FROM public.ngo_profiles
            WHERE profile_id = auth.uid()
              AND verification_status = 'VERIFIED'
        )
    );

DROP POLICY IF EXISTS "NGOs can update own campaigns" ON public.ngo_welfare_campaigns;
CREATE POLICY "NGOs can update own campaigns"
    ON public.ngo_welfare_campaigns FOR UPDATE
    USING (auth.uid() = ngo_id);

-- donations
DROP POLICY IF EXISTS "Donations viewable by donor or beneficiary NGO" ON public.donations;
CREATE POLICY "Donations viewable by donor or beneficiary NGO"
    ON public.donations FOR SELECT
    USING (
        auth.uid() = pet_parent_id
        OR auth.uid() = ngo_id
    );

DROP POLICY IF EXISTS "Users can donate" ON public.donations;
CREATE POLICY "Users can donate"
    ON public.donations FOR INSERT
    WITH CHECK (auth.uid() = pet_parent_id);

-- donation_redemptions
DROP POLICY IF EXISTS "Donation redemptions viewable by participants" ON public.donation_redemptions;
CREATE POLICY "Donation redemptions viewable by participants"
    ON public.donation_redemptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.donations d
            WHERE d.id = donation_redemptions.donation_id
              AND (d.pet_parent_id = auth.uid() OR d.ngo_id = auth.uid())
        )
    );

-- impact_reports
DROP POLICY IF EXISTS "Impact reports viewable by everyone" ON public.impact_reports;
CREATE POLICY "Impact reports viewable by everyone"
    ON public.impact_reports FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Verified NGOs can post impact reports" ON public.impact_reports;
CREATE POLICY "Verified NGOs can post impact reports"
    ON public.impact_reports FOR INSERT
    WITH CHECK (
        auth.uid() = ngo_id
        AND EXISTS (
            SELECT 1 FROM public.ngo_profiles
            WHERE profile_id = auth.uid()
              AND verification_status = 'VERIFIED'
        )
    );

-- audit_logs
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = profile_id);
