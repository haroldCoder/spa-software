-- ==============================================================================
-- WHATSAPP MODULE MIGRATION
-- Table: whatsapp_messages
-- ==============================================================================

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id VARCHAR(255) PRIMARY KEY,
    sender_name VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(sender_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_business ON whatsapp_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_worker ON whatsapp_messages(worker_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON whatsapp_messages(timestamp DESC);
