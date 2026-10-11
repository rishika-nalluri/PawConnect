# PawConnect â€” Unified Canine Welfare & Health Ecosystem

PawConnect is an end-to-end, role-based platform that unifies **Pet Parents**, licensed **Veterinarians**, and frontline animal welfare **NGOs**, complete with sovereign canine health records, AI-assisted gut health and symptom screening, online video teleconsultation, an integrated pet store, community events, and a coin-based reward system that directly funds street-dog welfare (1 PawCoin = 1 Street-Dog Meal / â‚¹1).

---

## ðŸŒŸ Complete Architecture Overview

This is the consolidated, unified master distribution combining all modules and features developed across iterations into a single cohesive project:

1. **Frontend (rontend/)**: React 18, Vite, Tailwind CSS, Lucide icons, Supabase Auth client, and role-gated dashboards for Dog Parents, Veterinarians, NGOs, and Administrators.
2. **Backend (ackend/)**: Spring Boot 3 (Java 17), Spring Security 6 with Supabase JWT authentication, Spring Data JPA / Hibernate, Flyway database migrations, and 14 dedicated domain modules.
3. **AI Microservice (i-service/)**: FastAPI, Python 3.11+, dual-layer symptom screening (instant rule-based ML heuristic triage + high-speed Groq LLM inference), token rate limiting, medical guardrails, and clinical explanations.
4. **Database & Storage (supabase/)**: Complete PostgreSQL schema, Row-Level Security (RLS) policies, database triggers for user creation, document verification buckets, and seed data.
5. **Interactive Standalone Preview (PawConnect_Live_Project_Preview.html)**: Complete self-contained runnable preview file showing all workflows, dashboards, and role states in any web browser without needing any dev server.
6. **Architecture Assets**: Includes high-resolution mindmaps and system diagrams (\.png\), research abstract (\.pdf\), and final deployment specifications (\ender.yaml\).

---

## ðŸš€ Quick Start Guide

### 1. Interactive Preview (Instant Demo)
Double-click \PawConnect_Live_Project_Preview.html\ to launch the interactive portal preview in your browser with full role-switching (Guest, Dog Parent, Vet Clinic, NGO) and live workflows.

### 2. Frontend Development Server
\\\ash
cd frontend
npm install
npm run dev
\\\
The application will run at \http://localhost:5173\.

### 3. AI Screening Microservice
\\\ash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
\\\
API documentation is available at \http://localhost:8000/docs\.

### 4. Spring Boot Backend
\\\ash
cd backend
mvn spring-boot:run
\\\
API endpoints will run at \http://localhost:8080\.

### 5. Supabase Setup
- Open your [Supabase Dashboard](https://supabase.com/dashboard).
- Run \supabase/setup_complete.sql\ in the SQL Editor to set up all tables, triggers, and storage buckets.

---

## ðŸ“‚ Project Structure

\\\
PawConnect/
â”œâ”€â”€ PawConnect_Live_Project_Preview.html           # Interactive standalone browser demo
â”œâ”€â”€ PawConnect Backend Architecture Mindmap.png    # Backend architecture diagram
â”œâ”€â”€ PawConnect Integrated Canine Welfare Architecture.png # Full system architecture
â”œâ”€â”€ PawConnect_Abstract.pdf.pdf                    # Research paper and system abstract
â”œâ”€â”€ PawConnect â€” Final Build Prompt (Supabase + Groq + Vercel).md
â”œâ”€â”€ render.yaml                                    # Multi-service cloud deployment descriptor
â”œâ”€â”€ package.json                                   # Monorepo orchestration scripts
â”‚
â”œâ”€â”€ frontend/                                      # React 18 + Vite frontend
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ api/                                   # API client and rich mock datasets
â”‚   â”‚   â”œâ”€â”€ components/                            # Modals, Navbar, TeleConsultRoom, Verification
â”‚   â”‚   â”œâ”€â”€ context/                               # AuthContext, CartContext
â”‚   â”‚   â”œâ”€â”€ lib/                                   # Supabase client, schemas, utilities
â”‚   â”‚   â””â”€â”€ pages/                                 # Landing, Dashboards, Store, Campaigns, TeleConsult, Admin
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ vite.config.js
â”‚   â””â”€â”€ tailwind.config.js
â”‚
â”œâ”€â”€ backend/                                       # Spring Boot 3 backend (Java 17)
â”‚   â”œâ”€â”€ pom.xml
â”‚   â”œâ”€â”€ Dockerfile
â”‚   â””â”€â”€ src/main/java/com/pawconnect/
â”‚       â”œâ”€â”€ admin/                                 # Admin verification review
â”‚       â”œâ”€â”€ audit/                                 # Spring AOP audit trail
â”‚       â”œâ”€â”€ care/                                  # Vaccinations and medication records
â”‚       â”œâ”€â”€ consent/                               # Sovereign consent grant/revoke
â”‚       â”œâ”€â”€ dog/                                   # Canine profile dossiers
â”‚       â”œâ”€â”€ event/                                 # Adoption camps & rabies drives
â”‚       â”œâ”€â”€ health/                                # AI symptom screening client & logs
â”‚       â”œâ”€â”€ ngo/                                   # Street-dog feeding & donations
â”‚       â”œâ”€â”€ notification/                          # Reminders and notifications
â”‚       â”œâ”€â”€ profile/                               # Role-based profiles
â”‚       â”œâ”€â”€ reward/                                # PawCoins wallet & redemptions
â”‚       â”œâ”€â”€ security/                              # Supabase JWT token filter
â”‚       â”œâ”€â”€ storage/                               # Verification document storage
â”‚       â”œâ”€â”€ store/                                 # Curated marketplace & checkout
â”‚       â”œâ”€â”€ telehealth/                            # Room keys & call window sessions
â”‚       â””â”€â”€ vetconnect/                            # Clinical appointments & digital Rx
â”‚
â”œâ”€â”€ ai-service/                                    # FastAPI screening microservice
â”‚   â”œâ”€â”€ main.py                                    # REST API routes
â”‚   â”œâ”€â”€ classifier.py                              # Structured heuristic ML classifier
â”‚   â”œâ”€â”€ requirements.txt
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ providers/                             # Groq, OpenAI, Anthropic adapters
â”‚   â”‚   â”œâ”€â”€ risk.py                                # Risk scoring engine
â”‚   â”‚   â”œâ”€â”€ guard.py                               # Medical boundary safety guardrails
â”‚   â”‚   â””â”€â”€ explain.py                             # Triage explanation generator
â”‚   â””â”€â”€ tests/                                     # Automated test suites
â”‚
â””â”€â”€ supabase/                                      # Database & Storage
    â”œâ”€â”€ setup_complete.sql                         # Complete monolithic SQL setup script
    â””â”€â”€ migrations/                                # Flyway / Supabase versioned migrations
\\\

---

## ðŸ”’ Security & Compliance
- **Non-Diagnostic Policy**: Preliminary AI screenings categorize risk as \LOW\, \MODERATE\, or \CONSULT_VET\ with safe non-invasive guidance. Immediate vet consultation is flagged for elevated risk.
- **Sovereign Consent**: Health dossiers are strictly consent-gated. Veterinarians cannot view medical logs without explicit authorization from the pet parent.
- **Audit Trails**: Spring AOP intercepts every medical query, consent change, and donation event to guarantee accountability.
