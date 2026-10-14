-- Project Manager Module Schema Additions
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/qzluqpezumhkbrtxkttw/sql)

-- 1. Project Charters
CREATE TABLE IF NOT EXISTS project_charters (
    charter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id),
    manager_id TEXT NOT NULL,
    content JSONB NOT NULL,
    status TEXT DEFAULT 'pending_approval',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Quotations
CREATE TABLE IF NOT EXISTS quotations (
    quote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id),
    vendor_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    details TEXT,
    contact_email TEXT,
    status TEXT DEFAULT 'received',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Field Agents Extension
CREATE TABLE IF NOT EXISTS field_agents (
    agent_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location_lat NUMERIC,
    location_lng NUMERIC,
    is_available BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-seed default field agent for dispatch
INSERT INTO field_agents (agent_id, name, location_lat, location_lng, is_available)
VALUES ('mock-agent-1', 'Raju (Field)', 18.5204, 73.8567, TRUE)
ON CONFLICT (agent_id) DO NOTHING;

-- 4. Field Tasks
CREATE TABLE IF NOT EXISTS field_tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id),
    agent_id TEXT REFERENCES field_agents(agent_id),
    task_desc TEXT NOT NULL,
    target_location_lat NUMERIC,
    target_location_lng NUMERIC,
    status TEXT DEFAULT 'assigned',
    completion_notes TEXT,
    completed_lat NUMERIC,
    completed_lng NUMERIC,
    photo_url TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS) Settings
-- Disable RLS on these PM tables so client / backend anon role can perform CRUD operations
ALTER TABLE project_charters DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotations DISABLE ROW LEVEL SECURITY;
ALTER TABLE field_agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE field_tasks DISABLE ROW LEVEL SECURITY;
