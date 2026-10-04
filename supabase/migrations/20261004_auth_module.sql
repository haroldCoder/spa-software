-- ==============================================================================
-- MIGRATION: AUTHENTICATION MODULE (SPA OWNER & WORKERS) + SESSIONS
-- ==============================================================================

-- 1. Modify businesses table to support authentication
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'BUSINESS_OWNER';

-- Ensure email is unique in businesses
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'businesses_email_unique'
    ) THEN
        ALTER TABLE businesses ADD CONSTRAINT businesses_email_unique UNIQUE (email);
    END IF;
END $$;

-- 2. Modify workers table to support authentication
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'WORKER';

-- Ensure worker email is unique when not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_workers_email_unique ON workers(email) WHERE email IS NOT NULL;

-- 3. Create auth_sessions table for JWT & Session management
CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- references businesses(id) or workers(id)
    user_type VARCHAR(50) NOT NULL, -- 'BUSINESS' or 'WORKER'
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_refresh ON auth_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_business ON auth_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions(expires_at);

-- Trigger for updated_at in auth_sessions
DROP TRIGGER IF EXISTS trigger_auth_sessions_updated_at ON auth_sessions;
CREATE TRIGGER trigger_auth_sessions_updated_at
BEFORE UPDATE ON auth_sessions
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
