-- ==============================================================================
-- SPA MANAGEMENT SYSTEM - DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BUSINESSES (Spas / Salones)
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'BUSINESS_OWNER',
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'CO',
    currency VARCHAR(10) DEFAULT 'COP',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. WORKERS / TRABAJADORAS (Terapeutas, Estilistas, Masajistas)
CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'WORKER',
    phone VARCHAR(50) NOT NULL,
    specialty VARCHAR(150), -- e.g. 'Masoterapeuta', 'Cosmiatra', 'Manicurista'
    commission_percentage NUMERIC(5, 2) DEFAULT 0.00, -- e.g. 30.00%
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 3. CLIENTS / CLIENTES
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    primary_worker_id UUID REFERENCES workers(id) ON DELETE SET NULL, -- Trabajadora asignada / de preferencia
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    identification_number VARCHAR(50),
    birth_date DATE,
    notes TEXT, -- Observaciones médicas, alergias, preferencias
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CATALOG ITEMS (Servicios del Spa y Productos en Venta)
DO $$ BEGIN
    CREATE TYPE catalog_item_type AS ENUM ('SERVICE', 'PRODUCT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS catalog_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    item_type catalog_item_type NOT NULL DEFAULT 'SERVICE',
    category VARCHAR(100), -- e.g. 'Faciales', 'Corporales', 'Uñas', 'Cremas'
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cost NUMERIC(12, 2) DEFAULT 0.00,
    duration_minutes INT, -- Solo aplica para servicios (e.g. 60 min)
    stock_quantity INT, -- Solo aplica para productos físicos en stock
    sku VARCHAR(100),
    image_url TEXT, -- Imagen del producto o servicio almacenada en bucket 'products'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AUTH SESSIONS (JWT & Multi-device Session Management)
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

-- 6. APPOINTMENTS / CITAS (Reservas entre Dueño/Trabajadora y Cliente)
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES catalog_items(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    end_time TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'PENDING',
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    cancellation_reason TEXT,
    created_by_id UUID,
    created_by_role VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_workers_business_id ON workers(business_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workers_email ON workers(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_business_id ON clients(business_id);
CREATE INDEX IF NOT EXISTS idx_clients_primary_worker_id ON clients(primary_worker_id);
CREATE INDEX IF NOT EXISTS idx_catalog_business_id ON catalog_items(business_id);
CREATE INDEX IF NOT EXISTS idx_catalog_type ON catalog_items(item_type);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_refresh ON auth_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_business ON auth_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_appointments_business_id ON appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_worker_id ON appointments(worker_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_businesses_updated_at ON businesses;
CREATE TRIGGER trigger_businesses_updated_at
BEFORE UPDATE ON businesses
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_workers_updated_at ON workers;
CREATE TRIGGER trigger_workers_updated_at
BEFORE UPDATE ON workers
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_clients_updated_at ON clients;
CREATE TRIGGER trigger_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_catalog_items_updated_at ON catalog_items;
CREATE TRIGGER trigger_catalog_items_updated_at
BEFORE UPDATE ON catalog_items
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_auth_sessions_updated_at ON auth_sessions;
CREATE TRIGGER trigger_auth_sessions_updated_at
BEFORE UPDATE ON auth_sessions
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON appointments;
CREATE TRIGGER trigger_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- 7. SALES / SHOPPING (Ventas de Productos Físicos y Servicios)
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    service_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    product_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_by_id UUID,
    created_by_role VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE SET NULL,
    item_type VARCHAR(50) NOT NULL DEFAULT 'SERVICE',
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_business_id ON sales(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_worker_id ON sales(worker_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_catalog_item_id ON sale_items(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_item_type ON sale_items(item_type);

DROP TRIGGER IF EXISTS trigger_sales_updated_at ON sales;
CREATE TRIGGER trigger_sales_updated_at
BEFORE UPDATE ON sales
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

