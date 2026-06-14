
---

# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Project Name:** NGO Co-Pilot & CSR Trust Oracle (MVP Version)  
**Target Audience:** Pre-Seed Investors, Corporate CSR Heads (for Pilot Funding)  
**Objective:** Build a zero-cost, fully functional, end-to-end prototype proving that Agentic AI can ingest multimodal field data, process compliance/procurement, and render dual-view dashboards while enforcing DPDP privacy.

## 1. Executive Summary

The MVP will simulate the daily operations of one NGO ("Nandini's NGO") executing one Corporate CSR Project ("Tata Trusts Education 2026"). The MVP will demonstrate the system's ability to take unstructured WhatsApp data (voice, images, text) and vendor bills, process them securely, and output them to a real-time ESG dashboard for funders, proving the B2B2C software model.

## 2. User Personas for the MVP Demo

1. **Raju (Field Worker):** Uses a standard mobile phone. Sends updates and photos via WhatsApp.
2. **Nandini (NGO Director):** Uses a laptop/tablet. Needs to approve AI drafts, review budgets, and generate Utilization Certificates.
3. **Sneha (Corporate CSR Head):** Uses a desktop. Wants a high-level, AI-verified dashboard showing map-based impact and zero-fraud procurement.

---

## 3. Tech Stack & Zero-Cost Infrastructure Mapping

To build this without initial capital, we will aggressively leverage generous developer "Free Tiers".

| Architecture Component | Enterprise Plan (Post-Funding) | Free Alternative for MVP (Zero-Cost) |
| :--- | :--- | :--- |
| **Frontend UI** | AWS Amplify / Vercel Pro | **Vercel (Free Tier)** for Next.js / Tailwind CSS. |
| **Backend API** | AWS EC2 / Azure App Service | **Render or Fly.io (Free Tier)** for Python FastAPI backend. |
| **Database & Auth** | AWS RDS + Cognito | **Supabase (Free Tier)**. Gives 500MB Postgres DB, pgvector, Auth (JWT), and strict Row-Level Security (RLS). |
| **Object Storage** | Amazon S3 | **Supabase Storage (Free Tier)** (up to 1GB free for storing MVP photos/receipts). |
| **WhatsApp Integration**| Gupshup / WATI (Paid) | **WhatsApp Cloud API (Free Tier)**. Meta gives 1,000 free service conversations per month. |
| **Voice AI / LLM** | GPT-4o / Claude 3.5 Sonnet | **Groq API (Free Tier)**. Lightning-fast Llama-3-8B/70B for intent routing, extraction, and empathy engine. |
| **Vision / OCR** | GPT-4o Vision API | **Gemini 1.5 Flash API (Free Tier)**. Google offers 15 RPM (requests per min) for free, excellent at reading handwritten/Hindi bills. |
| **Audio STT** | Custom Whisper / Bhashini | **Groq Whisper API (Free Tier)** or **Bhashini Developer Sandbox** (Free for testing Indian languages). |
| **PII Redaction** | Enterprise Presidio Cloud | **Local Microsoft Presidio** (Open-source Python library, runs locally on the free Render backend). |
| **Telephony Helpline** | Exotel / Twilio Live | **Twilio Sandbox / Developer Trial**. (Provides free testing credits to simulate one inbound voice call demo). |
| **Gov APIs (GST/ONDC)**| GST Suvidha Provider (Paid)| *(No free live alt)*. **Mock APIs / ONDC Sandbox**. We will use hardcoded sandbox responses to simulate live GST validation. |

---

## 4. MVP Core Features & Workflows

### Feature 1: The WhatsApp "Field-to-Impact" Pipeline

* **User Story:** Raju needs to log the distribution of 50 school bags using a Marathi voice note and a photo.
* **Requirements:**
  * Connect WhatsApp Cloud API webhook to FastAPI backend.
  * Use **Groq Whisper API** to transcribe Marathi voice to English.
  * Send text to **Presidio** to strip names (e.g., "Sunita" -> `[PERSON_1]`).
  * Pass redacted text to **Groq (Llama-3)** to extract JSON: `{"item": "bags", "qty": 50, "location": "Pune"}`.
  * Save the event to Supabase Postgres.
* **Success Metric:** From WhatsApp message sent to Supabase database update in under 5 seconds.

### Feature 2: The Agentic OCR & Procurement Engine

* **User Story:** Nandini uploads a photo of a messy, handwritten vendor bill for ₹1,50,000 via the web dashboard.
* **Requirements:**
  * Frontend sends the image to backend. Backend calls **Gemini 1.5 Flash Vision (Free Tier)**.
  * Prompt Gemini to extract: `Vendor Name, GST Number, Base Price, Tax, Total`.
  * Agent checks extracted GST Number against a Mock GST API (returns `Valid`).
  * Agent drafts a "Comparative Statement" and pauses.
  * Frontend updates UI to show "Pending Approval".
* **Success Metric:** AI successfully extracts handwritten tabular data and mathematically verifies the total (Base + Tax).

### Feature 3: The "Append-Only" Financial Ledger (Compliance)

* **User Story:** Investors want to see that the system is audit-proof and prevents overwriting data.
* **Requirements:**
  * Supabase Postgres database setup with an `events` table (Event Sourcing).
  * No `UPDATE` or `DELETE` endpoints in the FastAPI backend for financial tables.
  * When Nandini approves the ₹1,50,000 vendor bill, a new row `INSERT: Debit ₹1,50,000` is added.
  * The current budget is dynamically calculated by summing the ledger, not stored as a static number.

### Feature 4: The B2B2C Dual Dashboard (The "Wow" Factor)

* **User Story:** During the pitch, you show Nandini's dashboard, then switch tabs to show Sneha's Corporate dashboard to prove data escrow.
* **Requirements:**
  * **Next.js Frontend UI:**
    * *Role = NGO_Admin (Nandini):* Can see raw photos, unmasked names (UI calls a rehydration function), and internal HR logs.
    * *Role = CSR_Funder (Sneha):* UI is restricted via Supabase Row-Level Security (RLS). Sneha sees an aggregated Progress Bar (e.g., "75% Funds Utilized"), a Map showing location pins (based on WhatsApp data), and strictly masked PII (`Beneficiary #84`).
  * **Real-time Updates:** Use Supabase's built-in real-time WebSockets so that when Raju sends a WhatsApp message, Sneha's dashboard updates live on screen during the investor pitch.

---

## 5. Security & DPDP Compliance (MVP Level)

Even for a free MVP, investors will ask how you handle data privacy. We must build the "Security Shield" into the prototype.

1. **Presidio Implementation:** We will host the Presidio analyzer locally in our FastAPI container. Before *any* Groq LLM call is made, Presidio runs the text string and outputs the anonymized version.
2. **Cryptographic Hashing:** When an image is uploaded to Supabase Storage, the FastAPI backend will run a Python `hashlib.sha256()` script on the file and store the string in the DB.
3. **Supabase RLS:** We will configure Postgres policies:
   `CREATE POLICY "Funders only see their projects" ON impact_logs FOR SELECT USING (auth.uid() = funder_id);`

---

## 6. Out of Scope for MVP (To be built post-funding)

To ensure we can build this MVP in 3-4 weeks for free, the following are strictly **Out of Scope**:

* **Live ONDC/e-RUPI Integration:** (Requires extensive government approvals; we will use mock sandboxes).
* **Live Bank Account Sync (ICICI/SBI APIs):** (Requires corporate banking licenses; we will simulate bank webhooks).
* **High-Volume Telephony / Full Voice Empathy Agent:** (Twilio charges per minute for live calls outside the sandbox. We will build a *simulated* web-based voice recorder on the frontend to demo the latency of the Groq LPU, avoiding Twilio costs for the MVP).
* **Multi-Tenant SaaS Onboarding:** (The MVP will have hardcoded login credentials for 1 NGO and 1 Funder. Automated sign-ups are for V2).

---

## 7. The Investor Pitch Demo Flow (The "Golden Path")

This is exactly how you will present the MVP to investors:

1. **The Setup:** Open the Corporate Dashboard (Sneha). Show investors the budget is ₹5,00,000, and 0 bags have been distributed.
2. **The Field Action (Live):** Pull out your actual mobile phone. Send a WhatsApp voice note in Hindi to the bot: *"50 bags distributed in Pune school."* Attach a photo.
3. **The AI Magic:** Switch to the NGO Dashboard (Nandini). Show how the AI transcribed the Hindi, stripped the PII, and created a draft approval card. Click "Approve".
4. **The Money Shot:** Switch back to the Corporate Dashboard. Investors watch the progress bar animate in real-time to show 50 bags distributed, budget updated, and the photo (cryptographically hashed) appears on Sneha's screen.
5. **The OCR Flex:** Upload a crumpled receipt to the NGO dashboard and watch the AI extract the data for the auditor's utilization certificate.

---
**End of PRD**
