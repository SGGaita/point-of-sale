-- =====================================================
-- COMPLETE DATABASE MIGRATION SCRIPT
-- Point of Sale System - Restaurant Management
-- Run this SQL in Supabase SQL Editor to create a new database
-- =====================================================

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

-- Order types
DO $$ BEGIN
    CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Order status
DO $$ BEGIN
    CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment methods
DO $$ BEGIN
    CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'MPESA', 'CARD', 'BANK_TRANSFER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment status
DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User roles
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'CHEF', 'STOREKEEPER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. CREATE CORE TABLES
-- =====================================================

-- Users table (Application users with authentication)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password TEXT NOT NULL,
  role "UserRole" NOT NULL DEFAULT 'CASHIER',
  phone VARCHAR(50),
  "isActive" BOOLEAN DEFAULT true,
  "lastLogin" TIMESTAMP,
  "loginCount" INTEGER DEFAULT 0,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Login History
CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  login_time TIMESTAMP NOT NULL DEFAULT NOW(),
  logout_time TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_duration INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) NOT NULL, -- 'text', 'number', 'boolean', 'json'
  category VARCHAR(50) NOT NULL, -- 'general', 'financial', 'tax', 'notification'
  label VARCHAR(255) NOT NULL,
  description TEXT,
  is_editable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by TEXT
);

-- Positions (Staff roles)
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT
);

-- Staff (Employees without system accounts)
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  position_id UUID REFERENCES positions(id),
  position_name VARCHAR(100),
  hire_date DATE,
  salary DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT
);

-- =====================================================
-- 3. INVENTORY TABLES
-- =====================================================

-- Inventory Items (Raw materials and cooked items)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'RAW' or 'COOKED'
  category VARCHAR(100), -- 'MILK', 'BEEF', 'GREENS', 'DRY_GOODS', 'BEVERAGES', 'FOOD', 'OTHER'
  unit VARCHAR(50) NOT NULL,
  current_stock DECIMAL(10, 2) DEFAULT 0,
  min_stock_level DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Daily Stock Entries
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
  entered_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(entry_date, inventory_item_id)
);

-- Stock Transactions
CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  transaction_type VARCHAR(50) NOT NULL, -- 'OPENING', 'ADDITION', 'SALE', 'WASTAGE', 'ADJUSTMENT', 'COOKING'
  quantity DECIMAL(10, 2) NOT NULL,
  reference_id UUID,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recipe Ingredients (Link cooked items to raw materials)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooked_item_id UUID NOT NULL REFERENCES inventory_items(id),
  raw_item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity_needed DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. MENU AND ORDERS TABLES
-- =====================================================

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  order_type "OrderType" NOT NULL DEFAULT 'DINE_IN',
  order_status "OrderStatus" NOT NULL DEFAULT 'PENDING',
  payment_status "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  payment_method "PaymentMethod",
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  table_number VARCHAR(20),
  delivery_address TEXT,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  order_date TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  paid_at TIMESTAMP,
  notes TEXT,
  special_instructions TEXT,
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
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

-- Order Payments
CREATE TABLE IF NOT EXISTS order_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method "PaymentMethod" NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reference_number VARCHAR(100),
  payment_date TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. EXPENSE TABLES
-- =====================================================

-- Expense Templates
CREATE TABLE IF NOT EXISTS expense_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 999,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES expense_templates(id) ON DELETE SET NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  quantity DECIMAL(10, 2),
  unit_cost DECIMAL(10, 2),
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. CREATE INDEXES
-- =====================================================

-- System Settings
CREATE INDEX IF NOT EXISTS idx_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON system_settings(category);

-- Users and Authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_time ON login_history(login_time);

-- Staff and Positions
CREATE INDEX IF NOT EXISTS idx_staff_position ON staff(position_id);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active);
CREATE INDEX IF NOT EXISTS idx_positions_active ON positions(is_active);

-- Inventory
CREATE INDEX IF NOT EXISTS idx_inventory_items_type ON inventory_items(type);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_stock_date ON daily_stock_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_daily_stock_item ON daily_stock_entries(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_trans_item ON stock_transactions(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_trans_type ON stock_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_stock_trans_date ON stock_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_recipe_cooked ON recipe_ingredients(cooked_item_id);
CREATE INDEX IF NOT EXISTS idx_recipe_raw ON recipe_ingredients(raw_item_id);

-- Menu Items
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_order_payments_order ON order_payments(order_id);

-- Expenses
CREATE INDEX IF NOT EXISTS idx_expense_templates_category ON expense_templates(category);
CREATE INDEX IF NOT EXISTS idx_expense_templates_active ON expense_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_template_id ON expenses(template_id);
CREATE INDEX IF NOT EXISTS idx_expenses_timestamp ON expenses(timestamp);

-- =====================================================
-- 7. CREATE FUNCTIONS
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Generate order number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    date_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    date_prefix := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
    
    SELECT COUNT(*) + 1 INTO sequence_num
    FROM orders
    WHERE order_number LIKE date_prefix || '%';
    
    new_number := date_prefix || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. CREATE TRIGGERS
-- =====================================================

-- Users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- System Settings
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at 
BEFORE UPDATE ON system_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Staff and Positions
DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at 
BEFORE UPDATE ON staff
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
CREATE TRIGGER update_positions_updated_at 
BEFORE UPDATE ON positions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Menu Items
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at 
BEFORE UPDATE ON menu_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. INSERT DEFAULT DATA
-- =====================================================

-- Default Admin User (password: admin123 - CHANGE THIS IMMEDIATELY!)
INSERT INTO users (id, email, name, password, role, "isActive") VALUES
  ('admin-001', 'admin@restaurant.com', 'System Administrator', '$2b$10$29r1tcUnLXSvqXncJ/3c4.YSqLCWqWKce2wRvFZdIKJrzsQlK.JOW', 'ADMIN', true)
ON CONFLICT (email) DO NOTHING;

-- System Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, label, description, is_editable) VALUES
  ('currency_code', 'KES', 'text', 'financial', 'Currency Code', 'ISO currency code (e.g., KES, USD, EUR)', true),
  ('currency_name', 'Kenya Shillings', 'text', 'financial', 'Currency Name', 'Full name of the currency', true),
  ('currency_symbol', 'KSh', 'text', 'financial', 'Currency Symbol', 'Symbol to display for currency', true),
  ('currency_position', 'before', 'text', 'financial', 'Currency Symbol Position', 'Position of currency symbol (before/after amount)', true),
  ('decimal_places', '2', 'number', 'financial', 'Decimal Places', 'Number of decimal places for currency', true),
  ('vat_rate', '16', 'number', 'tax', 'VAT Rate (%)', 'Value Added Tax rate percentage', true),
  ('vat_enabled', 'true', 'boolean', 'tax', 'Enable VAT', 'Enable or disable VAT calculation', true),
  ('tax_inclusive', 'false', 'boolean', 'tax', 'Tax Inclusive Pricing', 'Whether prices include tax', true),
  ('business_name', 'My Restaurant', 'text', 'general', 'Business Name', 'Name of your business', true),
  ('business_address', '', 'text', 'general', 'Business Address', 'Physical address of your business', true),
  ('business_phone', '', 'text', 'general', 'Business Phone', 'Contact phone number', true),
  ('business_email', '', 'text', 'general', 'Business Email', 'Contact email address', true),
  ('receipt_footer', 'Thank you for your business!', 'text', 'general', 'Receipt Footer', 'Message to display on receipts', true),
  ('low_stock_threshold', '10', 'number', 'notification', 'Low Stock Threshold', 'Alert when stock falls below this level', true),
  ('enable_email_notifications', 'false', 'boolean', 'notification', 'Enable Email Notifications', 'Send email alerts for important events', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Default Positions
INSERT INTO positions (name, description, is_active) VALUES
  ('Waiter', 'Serves customers and takes orders', true),
  ('Chef', 'Prepares food in the kitchen', true),
  ('Bartender', 'Prepares and serves beverages', true),
  ('Cleaner', 'Maintains cleanliness of premises', true),
  ('Security', 'Ensures safety and security', true)
ON CONFLICT (name) DO NOTHING;

-- Sample Inventory Items (Raw Materials)
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
  ('Tea Leaves', 'RAW', 'DRY_GOODS', 'kg', 3, 0)
ON CONFLICT DO NOTHING;

-- Sample Inventory Items (Cooked)
INSERT INTO inventory_items (name, type, category, unit, min_stock_level, current_stock) VALUES
  ('Beef Stew', 'COOKED', 'FOOD', 'servings', 10, 0),
  ('Mandazi', 'COOKED', 'FOOD', 'pieces', 20, 0),
  ('Chapati', 'COOKED', 'FOOD', 'pieces', 15, 0),
  ('Tea', 'COOKED', 'BEVERAGES', 'cups', 10, 0),
  ('Ugali', 'COOKED', 'FOOD', 'servings', 15, 0)
ON CONFLICT DO NOTHING;

-- Sample Menu Items
INSERT INTO menu_items (name, category, price, is_available) VALUES
  ('Tea (Cup)', 'breakfast', 30.00, true),
  ('Mandazi', 'breakfast', 10.00, true),
  ('Chapati', 'breakfast', 20.00, true),
  ('Breakfast Set', 'breakfast', 80.00, true),
  ('Ugali + Beef', 'meals', 200.00, true),
  ('Rice + Beef', 'meals', 220.00, true),
  ('Chips + Beef', 'meals', 250.00, true)
ON CONFLICT DO NOTHING;

-- Expense Templates
INSERT INTO expense_templates (name, category, unit, sort_order) VALUES
  ('Unga Ugali (2KG)', 'Food Supplies', 'Qty', 1),
  ('Unga Mandazi (2KG)', 'Food Supplies', 'Qty', 2),
  ('Unga Chapati (2KG)', 'Food Supplies', 'Qty', 3),
  ('Rice (1KG)', 'Food Supplies', 'Qty', 4),
  ('Sugar (1KG)', 'Food Supplies', 'Qty', 5),
  ('Milk (1L)', 'Food Supplies', 'Qty', 6),
  ('Tea Leaves', 'Food Supplies', 'Ksh', 7),
  ('Beef (1KG)', 'Food Supplies', 'Qty', 8),
  ('Tomatoes', 'Food Supplies', 'Ksh', 9),
  ('Onions', 'Food Supplies', 'Ksh', 10),
  ('Salt', 'Food Supplies', 'Ksh', 11),
  ('Electricity Bill (Tokens)', 'Utilities', 'Ksh', 12),
  ('Charcoal', 'Utilities', 'Ksh', 13),
  ('Cooking Gas', 'Utilities', 'Ksh', 14),
  ('Packaging', 'Utilities', 'Ksh', 15)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Count all tables
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL SELECT 'login_history', COUNT(*) FROM login_history
UNION ALL SELECT 'system_settings', COUNT(*) FROM system_settings
UNION ALL SELECT 'positions', COUNT(*) FROM positions
UNION ALL SELECT 'staff', COUNT(*) FROM staff
UNION ALL SELECT 'inventory_items', COUNT(*) FROM inventory_items
UNION ALL SELECT 'daily_stock_entries', COUNT(*) FROM daily_stock_entries
UNION ALL SELECT 'stock_transactions', COUNT(*) FROM stock_transactions
UNION ALL SELECT 'recipe_ingredients', COUNT(*) FROM recipe_ingredients
UNION ALL SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'order_payments', COUNT(*) FROM order_payments
UNION ALL SELECT 'expense_templates', COUNT(*) FROM expense_templates
UNION ALL SELECT 'expenses', COUNT(*) FROM expenses
ORDER BY table_name;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Your database is now ready to use!
-- 
-- Next steps:
-- 1. Set up Supabase authentication
-- 2. Configure Row Level Security (RLS) policies as needed
-- 3. Update environment variables in your applications
-- 4. Test the database connection from your apps
-- =====================================================
