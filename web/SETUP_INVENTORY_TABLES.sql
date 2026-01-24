-- =====================================================
-- INVENTORY MANAGEMENT TABLES FOR RESTAURANT POS
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- 1. Create inventory_items table (Raw Materials & Cooked Items)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'RAW' or 'COOKED'
  category VARCHAR(100), -- 'MILK', 'BEEF', 'GREENS', 'DRY_GOODS', 'BEVERAGES', 'FOOD', 'OTHER'
  unit VARCHAR(50) NOT NULL, -- 'litres', 'kg', 'units', 'pieces', etc.
  current_stock DECIMAL(10, 2) DEFAULT 0,
  min_stock_level DECIMAL(10, 2) DEFAULT 0, -- Alert threshold
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_type ON inventory_items(type);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items(is_active);

-- 2. Create daily_stock_entries table (Morning Supply Entry)
CREATE TABLE IF NOT EXISTS daily_stock_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE NOT NULL,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  opening_stock DECIMAL(10, 2) NOT NULL,
  added_stock DECIMAL(10, 2) DEFAULT 0,
  closing_stock DECIMAL(10, 2),
  stock_used DECIMAL(10, 2) DEFAULT 0,
  wastage DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  entered_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(entry_date, inventory_item_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_stock_date ON daily_stock_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_daily_stock_item ON daily_stock_entries(inventory_item_id);

-- 3. Create stock_transactions table (Track all stock movements)
CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  transaction_type VARCHAR(50) NOT NULL, -- 'OPENING', 'ADDITION', 'SALE', 'WASTAGE', 'ADJUSTMENT', 'COOKING'
  quantity DECIMAL(10, 2) NOT NULL,
  reference_id UUID, -- Link to sale_id or other reference
  notes TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stock_trans_item ON stock_transactions(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_trans_type ON stock_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_stock_trans_date ON stock_transactions(created_at);

-- 4. Create recipe_ingredients table (Link cooked items to raw materials)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooked_item_id UUID NOT NULL REFERENCES inventory_items(id),
  raw_item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity_needed DECIMAL(10, 2) NOT NULL, -- Amount of raw material needed per unit of cooked item
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recipe_cooked ON recipe_ingredients(cooked_item_id);
CREATE INDEX IF NOT EXISTS idx_recipe_raw ON recipe_ingredients(raw_item_id);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample raw materials
INSERT INTO inventory_items (name, type, category, unit, min_stock_level, current_stock) VALUES
('Milk', 'RAW', 'MILK', 'litres', 10, 0),
('Beef', 'RAW', 'BEEF', 'kg', 5, 0),
('Greens/Vegetables', 'RAW', 'GREENS', 'kg', 3, 0),
('Flour', 'RAW', 'DRY_GOODS', 'kg', 10, 0),
('Cooking Oil', 'RAW', 'DRY_GOODS', 'litres', 5, 0),
('Spices Mix', 'RAW', 'DRY_GOODS', 'kg', 2, 0),
('Rice', 'RAW', 'DRY_GOODS', 'kg', 15, 0),
('Tomatoes', 'RAW', 'GREENS', 'kg', 5, 0),
('Onions', 'RAW', 'GREENS', 'kg', 3, 0),
('Sugar', 'RAW', 'DRY_GOODS', 'kg', 5, 0),
('Salt', 'RAW', 'DRY_GOODS', 'kg', 2, 0),
('Tea Leaves', 'RAW', 'DRY_GOODS', 'kg', 3, 0),
('Coffee Beans', 'RAW', 'DRY_GOODS', 'kg', 2, 0)
ON CONFLICT DO NOTHING;

-- Insert sample cooked items
INSERT INTO inventory_items (name, type, category, unit, min_stock_level, current_stock) VALUES
('Beef Stew', 'COOKED', 'FOOD', 'servings', 10, 0),
('Mandazi', 'COOKED', 'FOOD', 'pieces', 20, 0),
('Chapati', 'COOKED', 'FOOD', 'pieces', 15, 0),
('Tea', 'COOKED', 'BEVERAGES', 'cups', 10, 0),
('Coffee', 'COOKED', 'BEVERAGES', 'cups', 10, 0),
('Ugali', 'COOKED', 'FOOD', 'servings', 15, 0),
('Pilau', 'COOKED', 'FOOD', 'servings', 10, 0)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 'inventory_items' as table_name, COUNT(*) as row_count FROM inventory_items
UNION ALL
SELECT 'daily_stock_entries', COUNT(*) FROM daily_stock_entries
UNION ALL
SELECT 'stock_transactions', COUNT(*) FROM stock_transactions
UNION ALL
SELECT 'recipe_ingredients', COUNT(*) FROM recipe_ingredients;

-- View all inventory items
SELECT * FROM inventory_items ORDER BY type, category, name;
