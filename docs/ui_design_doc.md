
---

# 🎨 UI/UX DESIGN DOCUMENT (MVP)

**Project:** NGO Co-Pilot & CSR Trust Oracle  
**Design Philosophy:** "Invisible AI." The user should feel like they are using a standard, highly efficient management tool. No chatbots typing out long paragraphs on the web, no complex technical jargon.

## 1. Zero-Cost Design & UI Stack

To build this beautiful, corporate-grade UI for free, the MVP will use the following open-source resources:

* **Prototyping:** **Figma** (Free Tier).
* **Frontend Framework:** **Next.js + Tailwind CSS** (Free).
* **Component Library:** **shadcn/ui** (Free, open-source). It provides pre-built, corporate-looking components (tables, cards, progress bars) that look identical to enterprise software like Stripe or Vercel.
* **Icons:** **Lucide Icons** (Free). Clean, sharp, line-art icons. *(Replacing all emojis).*
* **Typography:** **Inter** (Google Fonts - Free). A highly legible, professional sans-serif font designed for data-heavy interfaces.
* **Maps:** **Leaflet.js + OpenStreetMap** (Free alternative to Google Maps API).
* **Charts:** **Recharts** (Free React library for clean, minimalistic charts).

---

## 2. Global Design System (Brand Guidelines)

* **Primary Brand Color (Trust & Authority):** Deep Navy Blue (`#0F172A`). Used for sidebars, primary headers, and active states.
* **Action Color (Validation & Success):** Emerald Green (`#059669`). Used for "Approve" buttons and positive health metrics (e.g., Budget on track).
* **Warning Color (Alerts & Audits):** Brick Red (`#DC2626`). Used sparingly for AI low-confidence warnings or budget breaches.
* **Background Color:** Off-White/Light Gray (`#F8FAFC`). Ensures the white data cards pop out clearly, reducing eye strain for long hours of administrative work.
* **Corner Radius:** 6px (Slightly rounded, avoiding overly bubbly/circular modern designs to maintain a serious corporate tone).

---

## 3. Interface 1: The Field Worker (Raju)

**Device:** Low-end Android Smartphone.  
**UX Goal:** Frictionless logging with zero learning curve.

### Screen 1A: The WhatsApp Native Interface

* **Visuals:** Standard WhatsApp chat.
* **Interaction:**
  * User sends text/photo.
  * System replies with clean, automated text (No emojis).
  * *Example System Reply:* "Update logged successfully. Project: Education 2026. Ref ID: #8842. To include secure GPS verification for the auditor, please use the secure upload link below."

### Screen 1B: The PWA "Secure Capture" Web App

*(When Raju clicks the link in WhatsApp, a lightweight browser window opens).*

* **Header:** Solid Navy Blue bar. Text: "Secure Impact Log".
* **Main Body:**
  * A large, rectangular viewfinder (accessing the phone camera).
  * Below the camera: A large Emerald Green button labeled `[Camera Icon] Capture Image & Location`.
  * A small text note below: *"Coordinates and timestamp will be automatically attached for compliance."*
* **Success State:** A simple checkmark screen. Text: "Data Verified and Uploaded. You may close this window."

---

## 4. Interface 2: The NGO Director (Nandini)

**Device:** Tablet or standard Laptop.  
**UX Goal:** Triage and overview. Prevent cognitive overload and "alert fatigue."

### Screen 2A: The NGO Command Dashboard

* **Layout:** Standard enterprise layout. Left vertical navigation bar (Navy Blue), top search bar, main content area.
* **Top Row (Key Metrics):** Three clean, white summary cards.
  * *Card 1 (Compliance):* "FCRA Admin Spend" - Shows a minimalist progress bar at 12% (Green). Text: "Safe. Limit is 20%."
  * *Card 2 (Operations):* "Pending AI Approvals" - Large number "4".
  * *Card 3 (Finance):* "Monthly Burn Rate" - Line chart showing a steady trajectory.
* **Main Body (The AI Inbox):**
  * Instead of a complex spreadsheet, Nandini sees a vertical list of "Action Cards."
  * Each card represents an AI-drafted task waiting for human approval.

### Screen 2B: Action Card Details (Procurement Approval)

*(When Nandini clicks one of the 4 pending approvals).*

* **Card Header:** "Action Required: Approve Purchase Order"
* **Context Section (Left Half):**
  * Displays the original text Nandini wrote: *"Need 500 bags for Pune."*
  * Shows a strict, minimalist table of the 3 quotes fetched by the AI.
  * Columns: `Vendor Name`, `Base Rate`, `GST Verified`, `Total Landed Cost`.
  * Row 1 (L1 Bidder) is highlighted with a subtle green background.
* **Action Section (Right Half):**
  * **Trust Indicator:** A small badge reading `[Shield Icon] 3-Quote Compliance Verified by AI. GST Active.`
  * **Buttons:**
    * Large Green Button: `Sign & Generate PO`.
    * Outline Gray Button: `Reject & Request New Quotes`.

### Screen 2C: Action Card Details (Receipt OCR Approval)

* **Split Screen View:**
  * *Left Side:* High-resolution zoomable image of the crumpled vendor receipt uploaded from the field.
  * *Right Side:* A clean web form pre-filled by the Gemini OCR AI.
  * Fields: `Invoice Number`, `Date`, `Total Amount`.
  * **The AI Confidence UI:** If the AI is unsure about a digit (e.g., the receipt is stained), that specific text box is outlined in Brick Red with a warning tag: `[Alert Icon] Low confidence (65%). Please verify amount manually.`
  * Nandini just corrects the number and clicks `Approve Expense`.

---

## 5. Interface 3: The Corporate CSR Funder (Sneha)

**Device:** High-resolution Desktop Monitor.  
**UX Goal:** High-level transparency, auditable proof, and ESG reporting ready for the Board of Directors.

### Screen 3A: The Portfolio Overview

* **Layout:** Clean, expansive, data-rich. No left sidebar, top horizontal navigation instead to maximize screen real estate for data.
* **The Hero Map (Leaflet.js):**
  * A muted grayscale map of India.
  * Blue pins represent active projects. Green radius circles represent AI-verified impact zones.
* **Financial Utilization Table:**
  * A clean data grid displaying funded NGOs.
  * Columns: `Partner NGO`, `Total Grant`, `Verified Disbursed`, `Impact KPIs Reached`.
  * Each row has a `[Chevron Right Icon]` indicating it can be expanded for a drill-down.

### Screen 3B: The "Trust Vault" Drill-Down (Auditor View)

*(When Sneha clicks on Nandini's "Education 2026" row).*

* **Header:** "Project Audit Trail: Education 2026"
* **The "Append-Only" Ledger View:**
  * A highly corporate, strict chronological table of every rupee spent.
  * Columns: `Date`, `Event Type`, `Amount`, `Verification Tag`.
* **The "Proof" Modal:**
  * If Sneha clicks on a row titled *"Procurement: 500 Bags (₹1,50,000)"*, a modal window opens.
  * The modal shows:
        1. The AI-generated Comparative Statement.
        2. The Cryptographic Hash string (e.g., `SHA-256: a8b4...`) of the vendor bill.
        3. A sanitized version of the field photo (Faces blurred or names masked as `[Beneficiary #45]`) with exact GPS coordinates and timestamps overlaid.

---

## 6. Interaction & State Design (The Frontend-Backend Bridge)

Because AI can take 3 to 10 seconds to process complex tasks, the UI must manage user expectations professionally.

### The "Asynchronous Loading" UI Pattern

* *Avoid:* Standard circular spinning wheels (makes the app feel broken or slow).
* *Implement:* **Server-Sent Events (SSE) Skeleton Loaders.**
  * When Nandini asks the AI to compare 3 vendor PDFs, the screen transitions to a gray outline of a table (a skeleton).
  * Inside the skeleton, clean, corporate text updates in real-time to show the AI's "thought process":
    * `[File Icon] Parsing Vendor A PDF...` (0.5s)
    * `[Search Icon] Verifying GSTIN via Government API...` (2.5s)
    * `[Calculator Icon] Calculating Lowest Bidder...` (4.0s)
    * *(UI snaps instantly to the fully populated table).*
  * **Why this works:** It transforms a "wait time" into a "value demonstration." The user actually *enjoys* watching the system do the heavy lifting.

### Error Handling & Graceful Degradation

* *Scenario:* The Gemini OCR completely fails to read a receipt.
* *UI Response:* Do not show a red "Error 500" screen.
* *Corporate Fallback:* The AI Inbox creates a card tagged `Manual Review Required`. The text reads: *"The uploaded document could not be mathematically verified by the AI due to low image quality. Please enter the invoice details manually."* This keeps the tone professional and immediately gives the user the manual fallback.

---
