
---

# 🗄️ DATA FLOW & DATABASE ARCHITECTURE (MVP)

**Project:** NGO Co-Pilot & CSR Trust Oracle  
**Infrastructure Goal:** 100% Free-Tier MVP (Render, Supabase, Groq, Gemini, WhatsApp Cloud API).  
**Security Goal:** Append-only financial ledger, strict Row-Level Security (RLS), and zero PII leakage to LLMs.

---

## 1. High-Level Architecture Topology

The system is divided into four distinct layers:

1. **The Client Layer (Ingestion):** WhatsApp Cloud API (Field) + Next.js UI (Web).
2. **The Processing Engine (Backend):** Python FastAPI hosted on **Render (Free Tier)**. Handles API routing, webhook validation, and orchestration.
3. **The AI / Security Airgap:** Microsoft Presidio (runs locally in Python) + Groq API (Llama-3/Whisper) + Gemini 1.5 Flash.
4. **The Storage Vault:** **Supabase (Free Tier)** providing PostgreSQL database, Auth (JWT), Storage (S3-compatible), and pgvector.

---

## 2. The Database Schema (Supabase PostgreSQL)

We will utilize an **Event-Sourced (Append-Only)** design for finance, and strict relational mapping for access control.

### Core Tables & Relationships

**Table 1: `users` (Identity & Auth)**

* `user_id` (UUID, Primary Key)
* `role` (Enum: `ngo_admin`, `funder`, `field_worker`)
* `organization_id` (UUID)

**Table 2: `projects` (The Master Context)**

* `project_id` (UUID, Primary Key)
* `ngo_id` (UUID, Foreign Key) -> *Mapped to Nandini*
* `funder_id` (UUID, Foreign Key) -> *Mapped to Sneha*
* `project_name` (String) -> *e.g., "Education 2026"*
* `total_budget` (Integer) -> *e.g., ₹5,00,000*
* `target_metric` (Integer) -> *e.g., 500 bags*

**Table 3: `impact_logs` (Operational Tracking)**

* `log_id` (UUID, Primary Key)
* `project_id` (UUID, Foreign Key)
* `quantity_delivered` (Integer)
* `masked_narrative` (Text) -> *Stored WITHOUT real names (e.g., "Delivered to [PERSON_1]")*
* `image_hash` (String) -> *SHA-256 hash of the uploaded photo*
* `gps_coordinates` (String)
* `status` (Enum: `pending_approval`, `approved`)

**Table 4: `financial_ledger` (The Append-Only Audit Trail)**
*(Crucial for investors: `UPDATE` and `DELETE` commands are strictly disabled on this table).*

* `transaction_id` (UUID, Primary Key)
* `project_id` (UUID, Foreign Key)
* `event_type` (Enum: `debit`, `credit`, `reversal`)
* `amount` (Integer)
* `ai_confidence_score` (Float) -> *e.g., 0.98*
* `receipt_storage_url` (String)
* `approved_by_user_id` (UUID, Foreign Key) -> *The JWT of the human who clicked approve*
* `timestamp` (Timestamptz)

**Table 5: `pii_vault` (The Privacy Escrow)**

* `token_id` (String, Primary Key) -> *e.g., "[PERSON_1]"*
* `real_value` (String, Encrypted) -> *e.g., "Sunita"*
* `ngo_id` (UUID) -> *Ensures only the NGO can decrypt, NOT the funder.*

---

## 3. Data Security: Row-Level Security (RLS) Implementation

To prove the "Data Escrow" B2B2C model, we enforce multi-tenancy at the database level using Supabase RLS. Even if the FastAPI backend is compromised, the database engine will not leak data.

**Example RLS Policy on `impact_logs` table:**

```sql
-- NGO Admin can see ALL data for their NGO
CREATE POLICY "NGO Full Access" ON impact_logs
FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM users WHERE role = 'ngo_admin' AND organization_id = impact_logs.ngo_id)
);

-- CSR Funder can ONLY see data mapped to their specific project_id
CREATE POLICY "Funder Restricted Access" ON impact_logs
FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM projects WHERE funder_id = auth.uid() AND project_id = impact_logs.project_id)
);
```

---

## 4. End-to-End Data Flow 1: "Field-to-Impact"

*How unstructured WhatsApp data becomes a verified CSR metric.*

* **Step 1: Ingestion (WhatsApp -> Render)**
  * Raju sends a voice note and photo to the WhatsApp bot.
  * WhatsApp Cloud API (Free) sends an HTTP POST Webhook payload to the FastAPI backend on Render.
* **Step 2: Processing & Storage (Render -> Supabase)**
  * FastAPI downloads the `.ogg` audio and `.jpg` image.
  * Uploads the image to **Supabase Storage**. Supabase returns a URL.
  * FastAPI calculates the `SHA-256 hash` of the image.
* **Step 3: Transcription (Groq Whisper)**
  * FastAPI sends the `.ogg` file to **Groq Whisper API (Free)**.
  * *Output:* "Sunita received the bag at Pune school."
* **Step 4: The Privacy Airgap (Local Presidio)**
  * FastAPI passes the text through the local Microsoft Presidio library.
  * *Output:* " `[PERSON_1]` received the bag at `[LOCATION_1]` school."
  * FastAPI writes `[PERSON_1] = Sunita` to the `pii_vault` table.
* **Step 5: Agentic Extraction (Groq Llama-3)**
  * FastAPI sends the *masked* text to **Groq Llama-3 (Free)** with a JSON extraction prompt.
  * *Output:* `{"qty": 1, "item": "bag"}`.
* **Step 6: Database Commit**
  * FastAPI executes an `INSERT` into `impact_logs` with `status: pending_approval`.
* **Step 7: UI Update (Next.js -> UI)**
  * Supabase Realtime (WebSocket) triggers the Next.js frontend. Nandini's dashboard instantly spawns a new "Action Card" for her to review.

---

## 5. End-to-End Data Flow 2: "Procurement & The Immutable Ledger"

*How an AI reads a receipt and securely locks it for audits.*

* **Step 1: File Upload (Next.js -> FastAPI)**
  * Nandini uploads a handwritten vendor bill (JPEG) via the Web Dashboard.
  * Next.js sends the file and Nandini's JWT token to FastAPI.
* **Step 2: Vision OCR (Gemini 1.5 Flash)**
  * FastAPI calls the **Gemini 1.5 Flash API (Free Tier: 15 RPM)**.
  * *Prompt:* "Extract Total Amount, Base, Tax, and Vendor GSTIN. Return JSON."
  * *Output:* `{"total": 150000, "gstin": "27AAAC...", "confidence": 0.95}`.
* **Step 3: Draft State Creation**
  * FastAPI saves the extracted data temporarily in Redis (or a `draft_tasks` Supabase table).
  * Server-Sent Events (SSE) tell the Next.js UI: *"Draft Ready for Review."*
* **Step 4: Human-in-the-Loop Approval (The Digital Signature)**
  * Nandini reviews the AI's extraction on screen. It looks correct. She clicks "Approve Expense".
  * Next.js sends an `HTTP POST /approve-finance` containing `draft_id` and her active **JWT**.
* **Step 5: The Immutable Ledger Append**
  * FastAPI validates the JWT (proving Nandini actually initiated the action).
  * FastAPI executes an `INSERT` into the `financial_ledger` table:
    * `event_type`: "debit"
    * `amount`: 150000
    * `approved_by`: Nandini's UUID.
* **Step 6: The Funder Dashboard Live Sync**
  * Because the ledger was updated, a database trigger automatically recalculates the `total_spent` view.
  * Sneha (The Funder), looking at her dashboard, sees her "Utilization Progress Bar" instantly jump from 0% to 30%.

---

## 6. The Zero-Cost Infrastructure Map (For Investor Due Diligence)

Investors will ask: *"How long can this startup survive before AWS bills kill you?"*
Your answer is this perfectly mapped free tier strategy:

| Microservice | Provider | Limits (Zero-Cost Tier) | How we stay within limits for MVP |
| :--- | :--- | :--- | :--- |
| **Frontend Hosting** | Vercel | 100GB Bandwidth/mo | MVP UI is highly optimized, no heavy video assets. |
| **Backend API** | Render / Fly.io | 512MB RAM, shared CPU | Async Python (FastAPI) handles concurrent I/O efficiently. |
| **Database & Auth** | Supabase | 500MB DB, 1GB Storage | 500MB holds ~2 million rows of financial/impact text data. |
| **Voice / Text AI** | Groq API | 14,000 requests/day | We will use ~50 requests per day for MVP demo purposes. |
| **Vision AI (OCR)** | Gemini API | 15 requests/minute | The MVP demo requires max 1-2 bill scans per minute. |
| **WhatsApp Chat** | Meta Cloud API| 1,000 Service chats/mo | Demo will trigger less than 100 messages a month. |
| **PII Redaction** | Presidio | Local compute (Free) | Runs directly on the Render server memory. |

---
