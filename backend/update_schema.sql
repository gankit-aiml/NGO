-- Project Manager Module Schema Additions

-- 1. Project Charters
CREATE TABLE IF NOT EXISTS project_charters (
    charter_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(project_id),
    manager_id UUID REFERENCES users(user_id),
    content JSONB NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Quotations
CREATE TABLE IF NOT EXISTS quotations (
    quote_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(project_id),
    vendor_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    details TEXT,
    contact_email TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Field Agents Extension (We add location to the users table or create a new one)
CREATE TABLE IF NOT EXISTS field_agents (
    agent_id UUID PRIMARY KEY REFERENCES users(user_id),
    name TEXT NOT NULL,
    location_lat NUMERIC,
    location_lng NUMERIC,
    is_available BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Field Tasks
CREATE TABLE IF NOT EXISTS field_tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(project_id),
    agent_id UUID REFERENCES field_agents(agent_id),
    task_desc TEXT NOT NULL,
    target_location_lat NUMERIC,
    target_location_lng NUMERIC,
    status TEXT DEFAULT 'assigned',
    completion_notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
