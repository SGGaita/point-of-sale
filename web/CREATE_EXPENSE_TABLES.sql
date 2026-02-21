-- Create expense_templates table
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

-- Create index on category for faster queries
CREATE INDEX IF NOT EXISTS idx_expense_templates_category ON expense_templates(category);
CREATE INDEX IF NOT EXISTS idx_expense_templates_active ON expense_templates(is_active);

-- Create expenses table (if not exists)
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

-- Create indexes on expenses table
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_template_id ON expenses(template_id);
CREATE INDEX IF NOT EXISTS idx_expenses_timestamp ON expenses(timestamp);

-- Insert default expense templates
INSERT INTO expense_templates (name, category, unit, sort_order) VALUES
  ('Unga Ugali (2KG)', 'Food Supplies', 'Qty', 1),
  ('Unga Mandazi (2KG)', 'Food Supplies', 'Qty', 2),
  ('Unga Chapati (2KG)', 'Food Supplies', 'Qty', 3),
  ('Rice (1KG)', 'Food Supplies', 'Qty', 4),
  ('Sugar (1KG)', 'Food Supplies', 'Qty', 5),
  ('Milk (1L)', 'Food Supplies', 'Qty', 6),
  ('Tea Leaves', 'Food Supplies', 'Ksh', 7),
  ('Beef (1KG)', 'Food Supplies', 'Qty', 8),
  ('Pilau Masala', 'Food Supplies', 'Ksh', 9),
  ('Soy Sauce', 'Food Supplies', 'Ksh', 10),
  ('Bulb Onions', 'Food Supplies', 'Ksh', 11),
  ('Sukuma', 'Food Supplies', 'Ksh', 12),
  ('Cabbage', 'Food Supplies', 'Ksh', 13),
  ('Spinach', 'Food Supplies', 'Ksh', 14),
  ('Managu', 'Food Supplies', 'Ksh', 15),
  ('Carrot', 'Food Supplies', 'Ksh', 16),
  ('Ginger', 'Food Supplies', 'Ksh', 17),
  ('Garlic', 'Food Supplies', 'Ksh', 18),
  ('Tomatoes', 'Food Supplies', 'Ksh', 19),
  ('Ring Onions', 'Food Supplies', 'Ksh', 20),
  ('Salt', 'Food Supplies', 'Ksh', 21),
  ('Pili Pili', 'Food Supplies', 'Ksh', 22),
  ('Electricity Bill (Tokens)', 'Utilities', 'Ksh', 23),
  ('Charcoal', 'Utilities', 'Ksh', 24),
  ('Cooking Gas', 'Utilities', 'Ksh', 25),
  ('Packaging', 'Utilities', 'Ksh', 26),
  ('Soap', 'Utilities', 'Ksh', 27)
ON CONFLICT DO NOTHING;
