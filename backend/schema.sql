-- ==========================================
-- Supabase PostgreSQL Schema & RLS Policies
-- Project: NGO Co-Pilot & CSR Trust Oracle
-- ==========================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('ngo_admin', 'funder', 'field_worker');
CREATE TYPE impact_status AS ENUM ('pending_approval', 'approved', 'rejected');
CREATE TYPE ledger_event_type AS ENUM ('debit', 'credit', 'reversal');

-- 2. TABLES

-- Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    role user_role NOT NULL,
    organization_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id UUID NOT NULL,
    funder_id UUID NOT NULL,
    project_name TEXT NOT NULL,
    total_budget INTEGER NOT NULL,
    target_metric INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Impact Logs Table
CREATE TABLE impact_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) NOT NULL,
    quantity_delivered INTEGER NOT NULL,
    masked_narrative TEXT NOT NULL,
    image_hash TEXT,
    gps_coordinates TEXT,
    status impact_status DEFAULT 'pending_approval',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Ledger (Append-Only)
CREATE TABLE financial_ledger (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) NOT NULL,
    event_type ledger_event_type NOT NULL,
    amount INTEGER NOT NULL,
    ai_confidence_score FLOAT,
    receipt_storage_url TEXT,
    approved_by_user_id UUID REFERENCES users(user_id) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- PII Vault Table
CREATE TABLE pii_vault (
    token_id TEXT PRIMARY KEY,
    real_value TEXT NOT NULL, -- In production, this would use symmetric encryption
    ngo_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE pii_vault ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- Users Policies
-- --------------------------------------------------------
-- Users can see users in their own organization or themselves
CREATE POLICY "Users view own org" ON users
FOR SELECT USING (
    auth.uid() = user_id OR 
    (SELECT u.organization_id FROM users u WHERE u.user_id = auth.uid() LIMIT 1) = organization_id
);

-- --------------------------------------------------------
-- Projects Policies
-- --------------------------------------------------------
-- NGO can see projects where they are the ngo_id
CREATE POLICY "NGO views own projects" ON projects
FOR SELECT USING (
    ngo_id = (SELECT organization_id FROM users WHERE user_id = auth.uid())
);

-- Funder can see projects where they are the funder_id
CREATE POLICY "Funder views own projects" ON projects
FOR SELECT USING (
    funder_id = auth.uid()
);

-- --------------------------------------------------------
-- Impact Logs Policies
-- --------------------------------------------------------
-- NGO Full Access (Select & Insert/Update)
CREATE POLICY "NGO impact logs access" ON impact_logs
FOR ALL USING (
    (SELECT organization_id FROM users WHERE user_id = auth.uid()) = 
    (SELECT ngo_id FROM projects WHERE projects.project_id = impact_logs.project_id)
);

-- Funder Restricted Access (Select Only)
CREATE POLICY "Funder impact logs access" ON impact_logs
FOR SELECT USING (
    auth.uid() = (SELECT funder_id FROM projects WHERE projects.project_id = impact_logs.project_id)
);

-- --------------------------------------------------------
-- Financial Ledger Policies (APPEND-ONLY)
-- --------------------------------------------------------
-- Funder Restricted Access (Select Only)
CREATE POLICY "Funder views ledger" ON financial_ledger
FOR SELECT USING (
    auth.uid() = (SELECT funder_id FROM projects WHERE projects.project_id = financial_ledger.project_id)
);

-- NGO Access (Select and Insert ONLY)
CREATE POLICY "NGO views ledger" ON financial_ledger
FOR SELECT USING (
    (SELECT organization_id FROM users WHERE user_id = auth.uid()) = 
    (SELECT ngo_id FROM projects WHERE projects.project_id = financial_ledger.project_id)
);

CREATE POLICY "NGO inserts ledger" ON financial_ledger
FOR INSERT WITH CHECK (
    (SELECT organization_id FROM users WHERE user_id = auth.uid()) = 
    (SELECT ngo_id FROM projects WHERE projects.project_id = financial_ledger.project_id)
);

-- Explicitly block UPDATE and DELETE for all users (Append-Only enforce)
-- (PostgreSQL automatically denies UPDATE/DELETE if no policies exist for them, but we can be explicit or rely on default deny)

-- --------------------------------------------------------
-- PII Vault Policies
-- --------------------------------------------------------
-- Only NGO can read/insert their own organization's PII vault
CREATE POLICY "NGO vault access" ON pii_vault
FOR ALL USING (
    ngo_id = (SELECT organization_id FROM users WHERE user_id = auth.uid())
);
