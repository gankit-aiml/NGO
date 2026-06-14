# 🚀 MVP Modifications & Enhancements

This document tracks all the modifications and feature expansions added to the NGO Co-Pilot & CSR Trust Oracle MVP that deviated from or extended the original `prd.md` and `data_doc.md` specifications.

## 1. New Role Added: Project Manager
- **Original Plan:** The system primarily focused on Field Workers, NGO Directors, and CSR Funders.
- **Modification:** Added a comprehensive **Project Manager Dashboard** (`/project-manager-dashboard`).
- **Features:** 
  - **Charter AI:** Automatically generates structured Project Charters based on core inputs (budget, scope, timeline).
  - **Procurement AI:** Simulates reaching out to vendors, collecting quotes, and highlighting the best deals.
  - **Dispatch AI:** Automatically assigns tasks to Field Agents based on their geographic location.

## 2. Field Operations Shift (WhatsApp to Web Portal)
- **Original Plan:** Field Agents were supposed to interact solely via WhatsApp voice notes and images.
- **Modification:** To better demonstrate task completion and live GPS capture for investors, we built a dedicated **Field Agent Web Portal** (`/agent-dashboard`).
- **Features:** Agents log in to view their dynamically assigned tasks, mark them as completed, and capture live coordinates to feed directly into the CSR map.
- *(Note: For the investor demo, the Dispatch AI is currently hardcoded to assign all tasks to "Raju" so the flow can be easily demonstrated).*

## 3. Advanced CSR Visualizations
- **Original Plan:** The CSR Dashboard used basic CSS placeholders for maps and simple progress bars.
- **Modification:** Integrated advanced React visualization libraries.
- **Features:**
  - **React Leaflet:** Added an interactive, real-time map displaying the exact GPS coordinates of Field Agents and their completed tasks.
  - **Recharts:** Added dynamic area graphs to visualize financial utilization trends over time.

## 4. NGO Director Approval Workflows
- **Modification:** Expanded the NGO Dashboard to include an **Inbox/Approvals** section. The NGO Director can now review AI-generated Project Charters submitted by the Project Manager and approve them before they are initiated.

## 5. Local JSON Mock Database (For Demo Stability)
- **Original Plan:** All new tables were to be strictly managed in Supabase PostgreSQL.
- **Modification:** To ensure a frictionless MVP presentation for investors without requiring manual DDL execution (SQL script running) on the Supabase dashboard, the new Project Manager modules (Charters, Quotes, Tasks, Agents) use a robust local JSON-based fallback database (`backend/local_db/`). This guarantees the demo works instantly "out of the box."

## 6. Model Upgrades & OCR Fixes
- **Modification:** The original Gemini 1.5 Flash model was deprecated and causing 404/400 errors during receipt scanning. We migrated the Vision AI pipeline to **Gemini 2.5 Flash** and updated the MIME-type handling to gracefully process various image formats during accountant ledger generation.

## 7. New Role Added: NGO Accountant
- **Original Plan:** Did not explicitly define an independent accountant dashboard for maintaining physical ledgers and journals.
- **Modification:** Built a dedicated **NGO Accountant Dashboard** (`/accountant-dashboard`).
- **Features:** 
  - **AI Vendor Bill Processing:** Integrates with Gemini 2.5 Flash to automatically scan, extract, and digitize uploaded vendor receipts/bills (OCR).
  - **General Ledger & Daily Cash Book:** Maintains a strict double-entry ledger style format showing daily spends and transaction histories.
  - **Audit Reporting:** Formats records mimicking standard Indian auditing templates, enabling easy tax filing and financial oversight.
