# Fix log

This project was checked statically: Java was compiled with the JDK compiler (syntax, unresolved project
references, and project methods), the frontend was parsed and its imports and packages were verified, and
the AI service's 32 unit tests were run. The Spring, Lombok and React libraries are not installed in the
sandbox, so nothing was launched. Run `mvn package`, `npm install && npm run build`, and the app once locally.

## Backend

| Area | Fix |
| --- | --- |
| Compile | `CurrentUser` added. Admin, care and appointment code now uses the project's own `NotificationService`, `AuditService` and `CoinService`. Missing `RewardService` reference removed. |
| Test in main source | `CallRoomKeyTest` moved to `src/test`. |
| Migrations | `V1` no longer references Supabase's `auth.users`. `V5` statements are idempotent, so they no longer recreate tables from `V1`. `V2` and `V3` (Supabase-only) moved to `supabase/manual/`. `V6` lets orders wait for payment. |
| Authentication | Asymmetric Supabase tokens are verified through the project's JWKS, with the HS256 secret as fallback. The issuer is checked. |
| Roles | The role comes only from the database, never from token metadata. Missing profiles are created on first sign-in (`ProfileProvisioningService`), and admin status is never granted there. |
| CORS | Only the origins in `CORS_ALLOWED_ORIGINS` are allowed. Credentials are off, since requests use bearer tokens. |
| Actuator | Only `health` is public. |
| Payments | Checkout creates a pending order and a Razorpay order. Coins are spent and stock is reserved only after the Razorpay signature is verified (`POST /store/checkout/verify`). Orders can't be placed without a configured gateway. |
| Coins | Unknown activities earn 0 (was 10). Each vaccination record pays once. Completing a checkup pays once, and only from CONFIRMED. |
| Vet connect | Request bodies are DTOs (no entity binding). Appointments follow PENDING → CONFIRMED → COMPLETED with role checks. Booking requires verified vet and active consent. Messages are readable only by the two parties. Direct-message endpoint removed. |
| Privacy | `profile` links are hidden from JSON on vet, NGO and pet-parent profiles (lazy load errors). |
| Duplicate endpoints | Vaccination and medication endpoints in `HealthController` removed; the care module owns them. |
| Telehealth | `GET /telehealth/appointments/{id}/room` issues the room key to the two parties, only for confirmed appointments inside the call window. |
| AI | Every call sends `X-Internal-Token`, and the payload uses the AI service's snake_case contract. Fallbacks are stored as `rule-engine-fallback`. Browser-facing `/ai/risk` and `/ai/chat` added. |
| Configuration | `application.yml` property names match the code. Mail, Razorpay, AI and call-room settings added. |

## Frontend

| Area | Fix |
| --- | --- |
| Build | `react-hook-form`, `zod` and `@hookform/resolvers` declared. Stale lock file removed (run `npm install`). `Field` component added. |
| Supabase | One client (`supabaseClient.js`). The duplicate `lib/supabase.js` is removed. |
| API paths | Appointments, consents, prescriptions, profile and verification upload use the backend's real paths and camelCase bodies. |
| AI | Calls go through the backend. The AI service URL is no longer in the browser. Fallbacks are marked `fallback: true`. |
| Demo sign-in | One-click role buttons only in development builds. After sign-in the role comes from the server profile. |
| Demo data | Retired names replaced (`Dr. Anika Rao`, `Meera`). Coin amounts in messages match the seeded rules. |

## Deployment

- `render.yaml`: frontend removed (Vercel). The AI service is a private service with the internal token. Backend environment is complete (Aiven, Supabase, CORS, AI, call room, Razorpay, SMTP).
- `.env.example` files updated for Aiven, the AI token, and removed AI URL.
- Dead AI modules removed (`routes/`, `classifier.py`, `desktop_config.py`, `test_heuristics.py`).

## Still open

1. Seven frontend pages (landing, store, events, campaigns, both dashboards, NGO dashboard) still use the localStorage mock store. They need wiring to the backend endpoints.
2. The Razorpay checkout script is not in the browser yet. The backend flow is ready.
3. Telehealth: the backend issues room keys, but no video client is integrated.
4. Notifications are in-app only. The project's notification service does not send email.
5. Confirm the Groq model id against Groq's live model list before deploying.
