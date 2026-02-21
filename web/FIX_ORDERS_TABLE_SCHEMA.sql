-- Complete fix for orders table schema to match sync API expectations
-- Run this in Supabase SQL Editor

-- Add all missing snake_case columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add all missing snake_case columns to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS order_id TEXT,
ADD COLUMN IF NOT EXISTS item_name TEXT,
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create unique constraint on order_number if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_number_key'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON orders(order_number);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'order_items_order_id_fkey'
    ) THEN
        ALTER TABLE order_items 
        ADD CONSTRAINT order_items_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES orders(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Update existing records to populate new columns from old camelCase columns (if they exist)
UPDATE orders 
SET 
    order_number = COALESCE(order_number, "orderNumber"),
    customer_name = COALESCE(customer_name, "customerName"),
    created_at = COALESCE(created_at, timestamp),
    updated_at = COALESCE(updated_at, timestamp)
WHERE order_number IS NULL OR created_at IS NULL;

UPDATE order_items 
SET 
    order_id = COALESCE(order_id, "orderId"),
    item_name = COALESCE(item_name, "itemName"),
    total_price = COALESCE(total_price, "totalPrice"),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE order_id IS NULL OR created_at IS NULL;
