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

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES expense_templates(id) ON DELETE SET NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  quantity DECIMAL(10, 2),
  unit_cost DECIMAL(10, 2),
  description TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_timestamp ON expenses(timestamp);
CREATE INDEX IF NOT EXISTS idx_expenses_template_id ON expenses(template_id);
CREATE INDEX IF NOT EXISTS idx_expense_templates_category ON expense_templates(category);
CREATE INDEX IF NOT EXISTS idx_expense_templates_active ON expense_templates(is_active);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expense_templates_updated_at ON expense_templates;
CREATE TRIGGER update_expense_templates_updated_at
  BEFORE UPDATE ON expense_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add some default expense templates
INSERT INTO expense_templates (name, category, unit, is_active, sort_order)
VALUES 
  ('Electricity', 'Utilities', 'KWh', true, 1),
  ('Water', 'Utilities', 'Liters', true, 2),
  ('Rent', 'Fixed Costs', 'Monthly', true, 3),
  ('Salaries', 'Labor', 'Monthly', true, 4),
  ('Supplies', 'Inventory', 'Items', true, 5)
ON CONFLICT DO NOTHING;
