-- ==============================================================================
-- MIGRATION: 20261009_supplies_module
-- Módulo de Insumos, Útiles y Control de Stock Interno para Spas/Salones
-- ==============================================================================

-- 1. TIPOS ENUM
DO $$ BEGIN
    CREATE TYPE supply_item_type AS ENUM (
        'CONSUMABLE',         -- Insumo consumible (aceites, cremas, ceras, tintes, químicos)
        'DISPOSABLE',         -- Material desechable (guantes, toallas desechables, cofias, gasas)
        'TOOL_UTILITY',       -- Útiles y herramientas de trabajo (tijeras, peines, brochas, recipientes)
        'CLEANING_HYGIENE'    -- Insumos de limpieza, esterilización y desinfección
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE supply_unit_measure AS ENUM (
        'UNIT',               -- Unidades / Piezas
        'ML',                 -- Mililitros
        'L',                  -- Litros
        'GR',                 -- Gramos
        'KG',                 -- Kilogramos
        'PACK',               -- Paquetes
        'BOX',                -- Cajas
        'ROLL'                -- Rollos
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE supply_movement_type AS ENUM (
        'PURCHASE',           -- Compra / Entrada de stock
        'CONSUMPTION',        -- Salida por uso interno / consumo en cabina
        'WASTE',              -- Merma, vencimiento, rotura o desperdicio
        'ADJUSTMENT'          -- Ajuste manual de inventario físico
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA PRINCIPAL: supplies (Insumos y Útiles)
CREATE TABLE IF NOT EXISTS supplies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    item_type supply_item_type NOT NULL DEFAULT 'CONSUMABLE',
    category VARCHAR(100),            -- e.g. 'Facial', 'Corporal', 'Capilar', 'Uñas', 'Cabina', 'Aseo'
    unit_measure supply_unit_measure NOT NULL DEFAULT 'UNIT',
    current_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    min_stock_alert NUMERIC(12, 2) NOT NULL DEFAULT 5.00,
    cost_per_unit NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Último costo unitario o promedio
    sku VARCHAR(100),
    supplier_name VARCHAR(255),       -- Proveedor habitual
    supplier_contact VARCHAR(255),    -- Teléfono / contacto del proveedor
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA DE KARDEX: supply_movements (Entradas, Salidas y Ajustes)
CREATE TABLE IF NOT EXISTS supply_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    supply_id UUID NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
    movement_type supply_movement_type NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,                    -- Cantidad positiva que ingresa o egresa
    previous_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    new_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,      -- Costo al momento del movimiento
    total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,     -- quantity * unit_cost
    reason TEXT,                                         -- Motivo o concepto (e.g. 'Compra Factura #45', 'Uso semanal cabina 1')
    invoice_number VARCHAR(100),                         -- Número de factura / comprobante opcional
    worker_id UUID REFERENCES workers(id) ON DELETE SET NULL, -- Trabajadora responsable (en caso de consumo)
    created_by_id UUID NOT NULL,                         -- ID del usuario que registra
    created_by_role VARCHAR(50) NOT NULL,                -- Rol ('BUSINESS_OWNER' o 'WORKER')
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_supplies_business_id ON supplies(business_id);
CREATE INDEX IF NOT EXISTS idx_supplies_item_type ON supplies(item_type);
CREATE INDEX IF NOT EXISTS idx_supplies_category ON supplies(category);
CREATE INDEX IF NOT EXISTS idx_supplies_is_active ON supplies(is_active);

CREATE INDEX IF NOT EXISTS idx_supply_movements_business_id ON supply_movements(business_id);
CREATE INDEX IF NOT EXISTS idx_supply_movements_supply_id ON supply_movements(supply_id);
CREATE INDEX IF NOT EXISTS idx_supply_movements_type ON supply_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_supply_movements_created_at ON supply_movements(created_at);

-- 5. TRIGGER AUTOMÁTICO DE updated_at
DROP TRIGGER IF EXISTS trigger_supplies_updated_at ON supplies;
CREATE TRIGGER trigger_supplies_updated_at
BEFORE UPDATE ON supplies
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
