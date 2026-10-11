# PawConnect — Final Build Prompt (Supabase + Groq + Vercel)

*This supersedes the earlier build prompt's tech stack. It's self-contained: the full data model, repositories, services, and build order are included here so you only need to hand this one document to a coding assistant.*

---

## 1. Project Summary

Build **PawConnect**, a role-based web platform connecting Dog Parents, Veterinarians, and NGOs, with shared consent-based dog health records, AI-assisted preliminary health screening, an AI assistant for reminders/record explanations/event digests, vaccination/medication/appointment reminders, an integrated pet store, and a coin-based reward system that funds street-dog welfare through NGO-redeemed donations.

---

## 2. Tech Stack

**Frontend**

- React 18 + Vite, deployed on **Vercel**
- Tailwind CSS
- React Router v6, Axios, React Query, Zustand, React Hook Form + Zod
- `@supabase/supabase-js` for auth (sign up, login, session, password reset) called directly from the frontend

**Authentication — Supabase**

- Supabase Auth handles all credential storage, password hashing, session/JWT issuance, and (optionally) Google/email-OTP sign-in — **do not build custom password/JWT logic in Spring Boot.**
- Role (`PET_PARENT` / `VET` / `NGO`) is captured at sign-up and stored in a `profiles` table (see schema below), not crammed into Supabase's built-in user object.
- The Spring Boot backend never issues its own JWTs. It only **validates** the JWT Supabase already issued, on every incoming request, using Supabase's JWT secret (or JWKS endpoint for asymmetric keys) in a custom Spring Security filter.

**Backend — business logic**

- Java 17+, Spring Boot 3, Spring Data JPA, Maven
- **Database: Supabase's own hosted Postgres** (one database, two schemas in practice — Supabase manages the `auth` schema, Flyway manages your `public` schema tables). Point Spring Boot's datasource at Supabase's connection string.
- Flyway for all `public`-schema migrations
- Spring Security configured for **JWT validation only** (no `UserDetailsService` backed by a local password table)
- Deployed on **Render or Railway** (free tier) — not Vercel. Vercel's serverless model isn't a good fit for a long-running JVM app; keep the frontend on Vercel and the API on a container host.

**AI Microservice**

- Python 3.11, FastAPI, deployed on **Render or Railway** (same reasoning as above — not Vercel, since the model/classifier benefits from a persistent process rather than cold-starting per request)
- `AIProvider` interface with **Groq as the default/primary implementation** (free-tier friendly, fast inference on open models — pin an exact model string, e.g. a current Llama 3.x instant/8B-class model, and check Groq's console for the live name and current rate limits before deploying)
- `OpenAIProvider` and `ClaudeProvider` kept as optional fallback implementations behind the same interface, in case you want a second opinion model or Groq's free quota runs out
- scikit-learn / XGBoost for the structured symptom-risk classifier (unchanged from before — this part doesn't call any LLM at all, see Section 6)

**Deployment summary**

| Piece | Host |
| --- | --- |
| React frontend | Vercel |
| Spring Boot API | Render / Railway (free tier) |
| FastAPI AI service | Render / Railway (free tier) |
| Database + Auth | Supabase |

---

## 3. Design Direction

(Unchanged from the earlier design brief — keeping it here for completeness.)

Match the **structural** pattern of a modern pet-brand storefront: slim promo bar, sticky header (logo, nav, search, account/cart), large two-column hero with a real lifestyle photo, a horizontal rounded-icon category strip, card grids with consistent shadow/radius, a split promo-banner pair, a trust-badge row, a newsletter band, and a footer with tagline + link columns + socials. Use PawConnect's own brand palette (deep teal `#12594C` primary, amber `#B9711F` for coins/rewards, coral `#BD4B29` for NGO/welfare, warm off-white `#F5F2EA` background) instead of a generic orange/green scheme. Apply this to the public landing page and store; keep the logged-in dashboards in the card-and-sidebar layout already established in the PawConnect dashboard mockup.

---

## 4. Supabase Auth Flow (role-based, 3 roles)

1. **Sign up:** frontend calls `supabase.auth.signUp({ email, password, options: { data: { role, full_name } } })`. The chosen role is written into `user_metadata` at sign-up time.
2. **Database trigger:** a Postgres trigger function (`handle_new_user`) fires on insert into `auth.users` and automatically creates a matching row in `public.profiles` (copying `id`, `role`, `full_name`), and — if role is `VET` or `NGO` — leaves `verification_status = 'PENDING'`.
3. **Vet/NGO document upload:** after sign-up, the frontend prompts for license/registration documents, uploaded to **Supabase Storage**, with the file path saved on `vet_profiles`/`ngo_profiles`.
4. **Login:** frontend calls `supabase.auth.signInWithPassword(...)`; Supabase returns a session with an access token (JWT).
5. **Authenticated API calls:** every request to the Spring Boot backend includes `Authorization: Bearer <supabase_access_token>`. A `SupabaseJwtAuthFilter` in Spring Security verifies the signature, extracts `sub` (the user's UUID) and reads their role from `public.profiles` (not from the JWT itself, so a role change doesn't require a token refresh to take effect).
6. **Row Level Security (RLS):** since the database is Supabase Postgres, turn on RLS on every table and write policies so, e.g., a pet parent can only `SELECT`/`UPDATE` their own `dogs` rows, and a vet can only `SELECT` a dog's health data where a matching `consent_grants` row exists. This gives you defense-in-depth even if a Spring Boot endpoint has a bug — treat Spring Boot's checks and RLS as two independent layers, not a substitute for each other.
7. **Verification approval:** a lightweight internal review screen (or, to start, a direct Supabase Studio table edit) sets `verification_status = 'VERIFIED'` on `vet_profiles`/`ngo_profiles`.

---

## 5. Database Schema

### Identity & Roles

| Table | Key columns |
| --- | --- |
| `auth.users` | *(managed by Supabase — id, email, encrypted_password, etc. Don't touch directly.)* |
| `profiles` | id (= `auth.users.id`, FK), full_name, role (`PET_PARENT`/`VET`/`NGO`), created_at |
| `vet_profiles` | profile_id (FK), license_number, council_registration_no, specialization, clinic_name, years_experience, verification_status, verification_doc_url |
| `ngo_profiles` | profile_id (FK), org_name, registration_number, registration_cert_url, focus_area, address, contact_person, verification_status |
| `pet_parent_profiles` | profile_id (FK), address, city, pincode |

### Dogs & Health

| Table | Key columns |
| --- | --- |
| `dogs` | id, pet_parent_id (FK → profiles), name, breed, dob, weight, photo_url |
| `vaccination_records` | id, dog_id (FK), vaccine_name, date_given, next_due_date |
| `medication_records` | id, dog_id (FK), medication_name, dosage, schedule, start_date, end_date |
| `symptom_logs` | id, dog_id (FK), symptoms_text, appetite, stool_consistency, vomiting, lethargy, logged_at |
| `ai_risk_assessments` | id, dog_id (FK), source_symptom_log_id (FK), risk_level, explanation, model_provider, model_version, created_at |
| `health_documents` | id, dog_id (FK), uploaded_by (FK profiles), file_url, doc_type |
| `consent_grants` | id, dog_id (FK), pet_parent_id (FK), vet_id (FK), granted_at, revoked_at |

### Veterinary Connectivity

| Table | Key columns |
| --- | --- |
| `appointments` | id, dog_id (FK), vet_id (FK), scheduled_at, status, notes |
| `vet_messages` | id, appointment_id (FK, nullable), sender_id (FK), receiver_id (FK), message_text, sent_at |
| `prescriptions` | id, dog_id (FK), vet_id (FK), appointment_id (FK), medication_details, follow_up_date |

### Notifications & Events

| Table | Key columns |
| --- | --- |
| `reminders` | id, dog_id (FK), type, due_date, is_sent |
| `notifications` | id, profile_id (FK), title, body, type, is_read, created_at |
| `events` | id, title, description, event_type, location, event_date, posted_by_ngo_id (FK, nullable) |
| `event_rsvps` | id, event_id (FK), profile_id (FK), rsvp_status |

### E-commerce

| Table | Key columns |
| --- | --- |
| `product_categories` | id, name |
| `products` | id, category_id (FK), name, description, price, stock_qty, image_url, coin_eligible |
| `carts` | id, pet_parent_id (FK) |
| `cart_items` | id, cart_id (FK), product_id (FK), quantity |
| `orders` | id, pet_parent_id (FK), total_amount, status, placed_at |
| `order_items` | id, order_id (FK), product_id (FK), quantity, unit_price |
| `payments` | id, order_id (FK, nullable — also used for cash donations), amount, gateway_ref, status, paid_at |

### Rewards

| Table | Key columns |
| --- | --- |
| `coin_transactions` | id, pet_parent_id (FK), type (`EARN`/`REDEEM`), source, amount, balance_after, created_at |
| `coin_earning_rules` | id, activity_type, coins_awarded, is_active |

### NGO & Street Dog Welfare

| Table | Key columns |
| --- | --- |
| `ngo_welfare_campaigns` | id, ngo_id (FK), title, description, target_amount, achieved_amount, start_date, end_date, status |
| `donations` | id, pet_parent_id (FK), ngo_id (FK), campaign_id (FK), donation_type (`COIN`/`CASH`), coins_used, cash_amount, payment_id (FK, nullable), status |
| `donation_redemptions` | id, donation_id (FK), coin_transaction_id (FK) |
| `impact_reports` | id, campaign_id (FK), ngo_id (FK), report_text, dogs_fed_count, photo_url, report_date |

### Audit

| Table | Key columns |
| --- | --- |
| `audit_logs` | id, profile_id (FK), action, entity_name, entity_id, timestamp, ip_address |

---

## 6. Repository & Service Layer (Spring Boot, package-by-feature)

```
profile/     entity: Profile, VetProfile, NGOProfile, PetParentProfile
             repository/service/controller for profile CRUD + verification

dog/         entity: Dog
             repository/service/controller

health/      entity: VaccinationRecord, MedicationRecord, SymptomLog,
                      AIRiskAssessment, HealthDocument, ConsentGrant
             service: HealthRecordService, ConsentService, AIRiskService
                      (AIRiskService calls the FastAPI /risk endpoint over REST)

vetconnect/  entity: Appointment, VetMessage, Prescription
             service: AppointmentService, MessagingService

notification/ entity: Reminder, Notification
              service: NotificationService, ReminderSchedulerService (@Scheduled)

event/       entity: Event, EventRsvp
             service: EventService

store/       entity: ProductCategory, Product, Cart, CartItem, Order, OrderItem, Payment
             service: ProductService, CartService, OrderService, PaymentService

reward/      entity: CoinTransaction, CoinEarningRule
             service: CoinService

ngo/         entity: NGOWelfareCampaign, Donation, DonationRedemption, ImpactReport
             service: NGOCampaignService, DonationService, ImpactReportService

audit/       entity: AuditLog
             service: AuditService
             aspect: AuditAspect (AOP — logs consent changes, record views, donations)

security/    SupabaseJwtAuthFilter, SupabaseJwtValidator, SecurityConfig
```

No `auth/` module with register/login/JWT-issuing code — that responsibility moved to Supabase per Section 4.

---

## 7. AI Feature Specs (Groq-first)

### 7.1 Gut Health / Symptom Risk Screening

Two layers, unchanged in design from before:

1. **Structured classifier** (scikit-learn/XGBoost, no LLM call) takes appetite, stool consistency, vomiting, lethargy, water intake → outputs a risk tier (`LOW`/`MODERATE`/`CONSULT_VET`) + confidence.
2. **LLM explanation layer**, now via `GroqProvider` by default: pass the tier + raw inputs to Groq with a system prompt that forbids diagnosis language, always recommends a vet consult at `MODERATE`+, and caps the response length. Cache by input hash for 24 hours so repeat checks don't re-call the API.

### 7.2 AI Assistant / Chatbot

Single `/ai/chat` FastAPI endpoint, Groq by default, scoped by system prompt to: general pet-care Q&A, explaining the dog's own recorded data, reminders, event info, platform navigation — explicitly refuses diagnosis requests and redirects to vet-connect. Rate-limit per user per day.

### 7.3 Reminders & Event Digests

Scheduling stays rule-based (Spring `@Scheduled`, no LLM in the decision path). Groq is only used, optionally, to phrase the reminder/digest text — with a plain templated fallback if the API is unavailable or unconfigured, so reminders never silently fail.

---

## 8. Environment Variables

**frontend/.env**

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=https://<your-render-backend>.onrender.com/api
```

**backend/.env**

```
DB_URL=jdbc:postgresql://<supabase-host>:5432/postgres
DB_USER=postgres
DB_PASSWORD=
SUPABASE_JWT_SECRET=
AI_SERVICE_BASE_URL=https://<your-render-ai-service>.onrender.com
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
```

**ai-service/.env**

```
AI_PROVIDER=groq
GROQ_API_KEY=
AI_MODEL_GROQ=<pin exact current model id from Groq's console>
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

---

## 9. Build Order

1. Create the Supabase project; enable email auth; write the `handle_new_user` trigger and the `profiles`/`vet_profiles`/`ngo_profiles`/`pet_parent_profiles` tables via the Supabase SQL editor or an initial Flyway migration pointed at the Supabase connection string.
2. Set up Supabase Storage buckets for verification documents and dog photos; write baseline RLS policies for `dogs`, `consent_grants`, and health tables.
3. Scaffold the frontend (Vite + Tailwind + Supabase client), build sign-up/login with role selection, confirm a session reaches the browser.
4. Scaffold Spring Boot, wire `SupabaseJwtAuthFilter`, confirm a request carrying a real Supabase access token resolves to the right `profiles` row and role.
5. Implement `dog` and `health` modules end to end (entities → repositories → services → controllers), including the consent-gated access check for vets.
6. Implement `vetconnect`, `notification`, `event` modules.
7. Implement `store` and `reward` modules.
8. Implement `ngo` module (depends on `reward` being in place).
9. Build the FastAPI AI service: `AIProvider` interface, `GroqProvider` first, `/risk` and `/chat` endpoints, classifier training script.
10. Build the frontend's public landing/store pages (Section 3 design direction) and the three role dashboards.
11. Wire one full flow end to end first — symptom log → risk screening → vet view — before parallelizing the rest.
12. Deploy: frontend to Vercel, backend and AI service to Render/Railway, confirm the deployed frontend's Supabase keys and API base URL point at the live services, not localhost.

---

Now generate the project starting with Step 1 and Step 2 above, using the exact schema, module breakdown, and Supabase-based auth flow defined in this document.