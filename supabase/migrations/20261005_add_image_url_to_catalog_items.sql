-- ==============================================================================
-- MIGRATION: Add image_url to catalog_items and configure 'products' storage bucket
-- ==============================================================================

-- 1. Add image_url to catalog_items
ALTER TABLE catalog_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Configure 'products' bucket in Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage access policies for 'products' bucket
DO $$ BEGIN
    CREATE POLICY "Public Read Access for Products Bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'products');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated Users can upload to products"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'products');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated Users can update products"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'products');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated Users can delete from products"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'products');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
