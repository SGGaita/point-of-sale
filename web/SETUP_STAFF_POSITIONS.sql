-- =====================================================
-- STAFF AND POSITIONS MANAGEMENT SYSTEM
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- 1. Create positions table for dynamic position management
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT REFERENCES users(id)
);

-- Insert default positions
INSERT INTO positions (id, name, description, is_active) VALUES
  (gen_random_uuid(), 'Waiter', 'Serves customers and takes orders', true),
  (gen_random_uuid(), 'Chef', 'Prepares food in the kitchen', true),
  (gen_random_uuid(), 'Bartender', 'Prepares and serves beverages', true),
  (gen_random_uuid(), 'Cleaner', 'Maintains cleanliness of premises', true),
  (gen_random_uuid(), 'Security', 'Ensures safety and security', true)
ON CONFLICT (name) DO NOTHING;

-- 2. Create staff table for employees without system accounts
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  position_id UUID REFERENCES positions(id),
  position_name VARCHAR(100), -- For backward compatibility if position is deleted
  hire_date DATE,
  salary DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT REFERENCES users(id)
);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_position ON staff(position_id);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active);
CREATE INDEX IF NOT EXISTS idx_positions_active ON positions(is_active);

-- 4. Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created
SELECT 'positions' as table_name, COUNT(*) as row_count FROM positions
UNION ALL
SELECT 'staff' as table_name, COUNT(*) as row_count FROM staff;

-- View all positions
SELECT id, name, description, is_active, created_at 
FROM positions 
ORDER BY name;

-- View table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'staff'
ORDER BY ordinal_position;
