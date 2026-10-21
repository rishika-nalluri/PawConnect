# PawConnect 🐾

**PawConnect** is an integrated canine welfare and community-driven management platform designed to streamline stray animal tracking, rescue coordination, health monitoring, and adoption workflows. By combining modern web technologies with AI-powered data processing, PawConnect bridges the gap between animal welfare organizations, veterinarians, municipal agencies, and compassionate citizens.

---

## 🚀 Key Features

- **🤖 AI-Powered Service (`/ai-service`):** Leverages advanced LLMs (via Groq) for intelligent rescue report parsing, automatic urgency categorization, and automated case triaging.
- **🏥 Digital Health & Veterinary Records:** Facilitates pet health profiles, symptom logging, weight and health tracking, vaccination reminders, and consent-based health data sharing with veterinarians.
- **🐕 Stray Rescue & Adoption Workflows:** Connects community members looking to report stray incidents or adopt rescues with active shelters and NGOs.
- **📊 Real-Time Operations Dashboard (`/frontend`):** A responsive user interface built for tracking rescue operations, monitoring health records, and allocating community resources efficiently.
- **⚡ Robust Backend & Data Sync:** Powered by Supabase for reliable database management, secure authentication, and real-time updates.

---

## 🛠️ Tech Stack & Architecture

### Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **AI Microservice:** Python, FastAPI, Groq API
- **Database & Auth:** Supabase (PostgreSQL, Realtime, Auth)
- **Deployment:** Render (AI Service), Vercel (Frontend)

### Architecture Overview
```text
┌────────────────┐       REST / JSON      ┌──────────────────┐
│                │ ─────────────────────> │                  │
│ React Frontend │                        │ FastAPI (Groq AI)│
│    (Vercel)    │ <───────────────────── │  (Render API)    │
│                │      AI Triage Res     └──────────────────┘
└───────┬────────┘                                  
        │                                           
        │ Direct Client SDK / Auth                  
        ▼                                           
┌────────────────┐                                  
│    Supabase    │                                  
│ (DB, Auth, Real│                                  
│     time)      │                                  
└────────────────┘
