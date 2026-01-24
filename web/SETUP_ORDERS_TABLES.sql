-- =====================================================
-- ORDERS AND MENU TABLES
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- 1. Create order_types enum
DO $$ BEGIN
    CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create order_status enum
DO $$ BEGIN
    CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create payment_method enum
DO $$ BEGIN
    CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'MPESA', 'CARD', 'BANK_TRANSFER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Create payment_status enum
DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Create menu_items table (based on cooked inventory items)
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES inventory_items(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'breakfast', 'beef', 'meals', 'beverages'
  price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50), -- 'portion', 'kg', 'piece', 'plate'
  is_available BOOLEAN DEFAULT true,
  preparation_time INTEGER, -- in minutes
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT REFERENCES users(id)
);

-- 6. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  order_type "OrderType" NOT NULL DEFAULT 'DINE_IN',
  order_status "OrderStatus" NOT NULL DEFAULT 'PENDING',
  payment_status "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  payment_method "PaymentMethod",
  
  -- Customer info
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  table_number VARCHAR(20), -- for dine-in
  delivery_address TEXT, -- for delivery
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  
  -- Timestamps
  order_date TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  paid_at TIMESTAMP,
  
  -- Notes and metadata
  notes TEXT,
  special_instructions TEXT,
  created_by TEXT REFERENCES users(id),
  updated_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  inventory_item_id UUID REFERENCES inventory_items(id),
  
  item_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL,
  unit VARCHAR(50),
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Create order_payments table (for tracking multiple payments)
CREATE TABLE IF NOT EXISTS order_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method "PaymentMethod" NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reference_number VARCHAR(100), -- M-Pesa code, card transaction ID, etc.
  payment_date TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_inventory ON menu_items(inventory_item_id);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu ON order_items(menu_item_id);

CREATE INDEX IF NOT EXISTS idx_order_payments_order ON order_payments(order_id);

-- 10. Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at 
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();

CREATE TRIGGER update_menu_items_updated_at 
BEFORE UPDATE ON menu_items
FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();

-- 11. Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    date_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    -- Format: ORD-YYYYMMDD-XXXX
    date_prefix := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
    
    -- Get the count of orders today
    SELECT COUNT(*) + 1 INTO sequence_num
    FROM orders
    WHERE order_number LIKE date_prefix || '%';
    
    new_number := date_prefix || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- 12. Insert sample menu items based on common cooked items
INSERT INTO menu_items (id, name, description, category, price, unit, is_available) VALUES
  -- Breakfast items
  (gen_random_uuid(), 'Tea (Cup)', 'Hot tea with milk', 'breakfast', 30.00, 'cup', true),
  (gen_random_uuid(), 'Mandazi', 'Fresh mandazi', 'breakfast', 10.00, 'piece', true),
  (gen_random_uuid(), 'Chapati', 'Soft chapati', 'breakfast', 20.00, 'piece', true),
  (gen_random_uuid(), 'Breakfast Set', 'Tea + 2 Mandazi + Chapati', 'breakfast', 80.00, 'set', true),
  
  -- Beef portions
  (gen_random_uuid(), 'Beef Portion (Small)', 'Cooked beef - small portion', 'beef', 150.00, 'portion', true),
  (gen_random_uuid(), 'Beef Portion (Medium)', 'Cooked beef - medium portion', 'beef', 250.00, 'portion', true),
  (gen_random_uuid(), 'Beef Portion (Large)', 'Cooked beef - large portion', 'beef', 350.00, 'portion', true),
  (gen_random_uuid(), 'Raw Beef Takeaway', 'Fresh raw beef for takeaway', 'beef', 600.00, 'kg', true),
  
  -- Meals
  (gen_random_uuid(), 'Ugali + Beef', 'Ugali with beef stew', 'meals', 200.00, 'plate', true),
  (gen_random_uuid(), 'Rice + Beef', 'Rice with beef stew', 'meals', 220.00, 'plate', true),
  (gen_random_uuid(), 'Chips + Beef', 'Chips with beef', 'meals', 250.00, 'plate', true),
  
  -- Beverages
  (gen_random_uuid(), 'Soda (300ml)', 'Assorted sodas', 'beverages', 50.00, 'bottle', true),
  (gen_random_uuid(), 'Water (500ml)', 'Bottled water', 'beverages', 30.00, 'bottle', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tables were created
SELECT 'menu_items' as table_name, COUNT(*) as row_count FROM menu_items
UNION ALL
SELECT 'orders' as table_name, COUNT(*) as row_count FROM orders
UNION ALL
SELECT 'order_items' as table_name, COUNT(*) as row_count FROM order_items
UNION ALL
SELECT 'order_payments' as table_name, COUNT(*) as row_count FROM order_payments;

-- View menu items by category
SELECT 
    category,
    name,
    price,
    unit,
    is_available
FROM menu_items
ORDER BY category, name;

-- Test order number generation
SELECT generate_order_number() as sample_order_number;
