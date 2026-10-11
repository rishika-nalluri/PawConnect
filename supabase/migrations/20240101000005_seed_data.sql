-- ====================================================================
-- PawConnect Database Schema: Migration 05 - Seed Data
-- Initial coin earning rules, product categories, and sample catalog
-- ====================================================================

-- 1. Coin Earning Rules
INSERT INTO public.coin_earning_rules (activity_type, coins_awarded, description, is_active)
VALUES
    ('VACCINATION_LOG', 50, 'Awarded when a verified vaccination record is added', true),
    ('SYMPTOM_LOG', 15, 'Awarded when logging a preliminary symptom check for your dog', true),
    ('HEALTH_CHECKUP', 40, 'Awarded upon completion of a vet consultation', true),
    ('STORE_PURCHASE', 20, 'Awarded per 500 INR spent on PawStore dog wellness products', true),
    ('EVENT_ATTENDANCE', 30, 'Awarded when attending an NGO adoption or feeding drive', true),
    ('PROFILE_COMPLETION', 25, 'Awarded for completing pet parent and dog details', true)
ON CONFLICT (activity_type) DO UPDATE SET
    coins_awarded = EXCLUDED.coins_awarded,
    description = EXCLUDED.description;

-- 2. Product Categories
INSERT INTO public.product_categories (name, slug, description, icon_name)
VALUES
    ('Food & Nutrition', 'food-nutrition', 'Premium dog food, nutritious treats, and vital supplements', 'Bone'),
    ('Healthcare & Meds', 'healthcare-meds', 'Dewormers, tick & flea treatments, and first-aid kits', 'HeartPulse'),
    ('Grooming & Hygiene', 'grooming-hygiene', 'Organic shampoos, dental chews, and paw balms', 'Sparkles'),
    ('Toys & Training', 'toys-training', 'Interactive puzzles, dental chew toys, and training leashes', 'Activity'),
    ('Accessories & Comfort', 'accessories-comfort', 'Orthopedic beds, ergonomic harnesses, and feeding bowls', 'ShieldCheck')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name;

-- 3. Initial Products
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
