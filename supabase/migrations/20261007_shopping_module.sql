-- ==============================================================================
-- MIGRATION: 20261007_shopping_module
-- Módulo de Shopping / Ventas de Servicios y Productos Físicos con Paginación
-- ==============================================================================

-- 1. TABLA PRINCIPAL DE VENTAS / SHOPPING ORDERS
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

-- 2. TABLA DE DETALLE DE VENTA / ITEMS VENDIDOS
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE SET NULL,
    item_type VARCHAR(50) NOT NULL DEFAULT 'SERVICE', -- 'SERVICE' | 'PRODUCT'
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ÍNDICES PARA CONSULTAS RÁPIDAS Y FILTROS EN TABLAS
CREATE INDEX IF NOT EXISTS idx_sales_business_id ON sales(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_worker_id ON sales(worker_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_catalog_item_id ON sale_items(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_item_type ON sale_items(item_type);

-- 4. TRIGGER PARA ACTUALIZACIÓN AUTOMÁTICA DE updated_at
DROP TRIGGER IF EXISTS trigger_sales_updated_at ON sales;
CREATE TRIGGER trigger_sales_updated_at
BEFORE UPDATE ON sales
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
