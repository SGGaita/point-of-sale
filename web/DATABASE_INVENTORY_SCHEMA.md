# Inventory Database Schema for Restaurant POS

## Tables to Create in Supabase SQL Editor

### 1. inventory_items (Raw Materials & Cooked Items)
```sql
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

CREATE INDEX idx_inventory_items_type ON inventory_items(type);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_active ON inventory_items(is_active);
```

### 2. daily_stock_entries (Morning Supply Entry)
```sql
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
  entered_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(entry_date, inventory_item_id)
);

CREATE INDEX idx_daily_stock_date ON daily_stock_entries(entry_date);
CREATE INDEX idx_daily_stock_item ON daily_stock_entries(inventory_item_id);
```

### 3. stock_transactions (Track all stock movements)
```sql
CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  transaction_type VARCHAR(50) NOT NULL, -- 'OPENING', 'ADDITION', 'SALE', 'WASTAGE', 'ADJUSTMENT', 'COOKING'
  quantity DECIMAL(10, 2) NOT NULL,
  reference_id UUID, -- Link to sale_id or other reference
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stock_trans_item ON stock_transactions(inventory_item_id);
CREATE INDEX idx_stock_trans_type ON stock_transactions(transaction_type);
CREATE INDEX idx_stock_trans_date ON stock_transactions(created_at);
```

### 4. recipe_ingredients (Link cooked items to raw materials)
```sql
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooked_item_id UUID NOT NULL REFERENCES inventory_items(id),
  raw_item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity_needed DECIMAL(10, 2) NOT NULL, -- Amount of raw material needed per unit of cooked item
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recipe_cooked ON recipe_ingredients(cooked_item_id);
CREATE INDEX idx_recipe_raw ON recipe_ingredients(raw_item_id);
```

## Initial Data Setup

### Sample Raw Materials
```sql
INSERT INTO inventory_items (name, type, category, unit, min_stock_level) VALUES
('Milk', 'RAW', 'MILK', 'litres', 10),
('Beef', 'RAW', 'BEEF', 'kg', 5),
('Greens/Vegetables', 'RAW', 'GREENS', 'kg', 3),
('Flour', 'RAW', 'DRY_GOODS', 'kg', 10),
('Cooking Oil', 'RAW', 'DRY_GOODS', 'litres', 5),
('Spices Mix', 'RAW', 'DRY_GOODS', 'kg', 2),
('Rice', 'RAW', 'DRY_GOODS', 'kg', 15),
('Tomatoes', 'RAW', 'GREENS', 'kg', 5),
('Onions', 'RAW', 'GREENS', 'kg', 3);

INSERT INTO inventory_items (name, type, category, unit, min_stock_level) VALUES
('Beef Stew', 'COOKED', 'FOOD', 'servings', 10),
('Mandazi', 'COOKED', 'FOOD', 'pieces', 20),
('Chapati', 'COOKED', 'FOOD', 'pieces', 15),
('Tea', 'COOKED', 'BEVERAGES', 'cups', 10),
('Coffee', 'COOKED', 'BEVERAGES', 'cups', 10);
```

## Notes
- Run these SQL commands in Supabase SQL Editor
- The schema supports both raw materials and cooked items
- Daily stock entries track opening/closing stock for each day
- Stock transactions provide audit trail
- Recipe ingredients link cooked items to raw materials for auto-deduction
