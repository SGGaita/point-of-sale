-- =====================================================
-- UPDATE USER ROLES AND ADD LOGIN TRACKING
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- 1. Update UserRole enum to include new roles
-- First, add the new role values if they don't exist
DO $$ 
BEGIN
    -- Add STOREKEEPER if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'STOREKEEPER' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
    ) THEN
        ALTER TYPE "UserRole" ADD VALUE 'STOREKEEPER';
    END IF;
END $$;

-- 2. Create login_history table for tracking logins
CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  login_time TIMESTAMP NOT NULL DEFAULT NOW(),
  logout_time TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_duration INTEGER, -- in seconds
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_time ON login_history(login_time);

-- 3. Add last_login field to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_login'
    ) THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
    END IF;
END $$;

-- 4. Add login_count field to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'login_count'
    ) THEN
        ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if login_history table was created
SELECT 'login_history' as table_name, COUNT(*) as row_count FROM login_history;

-- Check new columns in users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('last_login', 'login_count');

-- Check UserRole enum values
SELECT enumlabel as role_name
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
ORDER BY enumlabel;
