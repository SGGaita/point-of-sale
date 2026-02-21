-- Add missing columns to orders table (snake_case to match Supabase convention)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have timestamps
UPDATE orders SET created_at = timestamp, updated_at = timestamp WHERE created_at IS NULL;
UPDATE order_items SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;
