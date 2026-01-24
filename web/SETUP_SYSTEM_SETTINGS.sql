-- =====================================================
-- SYSTEM SETTINGS TABLE
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- 1. Create system_settings table
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
  updated_by TEXT REFERENCES users(id)
);

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON system_settings(category);

-- 3. Insert default settings
INSERT INTO system_settings (id, setting_key, setting_value, setting_type, category, label, description, is_editable) VALUES
  -- Currency Settings
  (gen_random_uuid(), 'currency_code', 'KES', 'text', 'financial', 'Currency Code', 'ISO currency code (e.g., KES, USD, EUR)', true),
  (gen_random_uuid(), 'currency_name', 'Kenya Shillings', 'text', 'financial', 'Currency Name', 'Full name of the currency', true),
  (gen_random_uuid(), 'currency_symbol', 'KSh', 'text', 'financial', 'Currency Symbol', 'Symbol to display for currency', true),
  (gen_random_uuid(), 'currency_position', 'before', 'text', 'financial', 'Currency Symbol Position', 'Position of currency symbol (before/after amount)', true),
  (gen_random_uuid(), 'decimal_places', '2', 'number', 'financial', 'Decimal Places', 'Number of decimal places for currency', true),
  
  -- Tax Settings
  (gen_random_uuid(), 'vat_rate', '16', 'number', 'tax', 'VAT Rate (%)', 'Value Added Tax rate percentage', true),
  (gen_random_uuid(), 'vat_enabled', 'true', 'boolean', 'tax', 'Enable VAT', 'Enable or disable VAT calculation', true),
  (gen_random_uuid(), 'tax_inclusive', 'false', 'boolean', 'tax', 'Tax Inclusive Pricing', 'Whether prices include tax', true),
  
  -- Business Settings
  (gen_random_uuid(), 'business_name', 'My Restaurant', 'text', 'general', 'Business Name', 'Name of your business', true),
  (gen_random_uuid(), 'business_address', '', 'text', 'general', 'Business Address', 'Physical address of your business', true),
  (gen_random_uuid(), 'business_phone', '', 'text', 'general', 'Business Phone', 'Contact phone number', true),
  (gen_random_uuid(), 'business_email', '', 'text', 'general', 'Business Email', 'Contact email address', true),
  (gen_random_uuid(), 'receipt_footer', 'Thank you for your business!', 'text', 'general', 'Receipt Footer', 'Message to display on receipts', true),
  
  -- Notification Settings
  (gen_random_uuid(), 'low_stock_threshold', '10', 'number', 'notification', 'Low Stock Threshold', 'Alert when stock falls below this level', true),
  (gen_random_uuid(), 'enable_email_notifications', 'false', 'boolean', 'notification', 'Enable Email Notifications', 'Send email alerts for important events', true)
ON CONFLICT (setting_key) DO NOTHING;

-- 4. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_settings_updated_at 
BEFORE UPDATE ON system_settings
FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if table was created
SELECT 'system_settings' as table_name, COUNT(*) as row_count FROM system_settings;

-- View all settings by category
SELECT 
    category,
    setting_key,
    label,
    setting_value,
    setting_type
FROM system_settings
ORDER BY category, setting_key;

-- View financial settings
SELECT 
    label,
    setting_value,
    description
FROM system_settings
WHERE category = 'financial'
ORDER BY label;

-- View tax settings
SELECT 
    label,
    setting_value,
    description
FROM system_settings
WHERE category = 'tax'
ORDER BY label;
