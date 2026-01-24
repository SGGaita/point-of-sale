-- =====================================================
-- CHECK USER ACCOUNT AND RESET PASSWORD
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- STEP 1: Check all users and their status
SELECT 
    id,
    name,
    email,
    role,
    "isActive" as is_active,
    "createdAt" as created_at
FROM users
ORDER BY "createdAt" DESC;

-- STEP 2: Check if there are any admin accounts
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admin_count,
    COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_users
FROM users;

-- STEP 3: Reset password for your account
-- Replace 'your-email@example.com' with YOUR actual email
-- New password will be: admin123

UPDATE users
SET 
    password = '$2b$10$lzk7bKJMK3yceLlfpyC5OeP1GPJYM8k1ty/SN4d7xG1d94lBEo0VO',
    "isActive" = true,
    role = 'ADMIN',
    "updatedAt" = NOW()
WHERE email = 'steveggaikia@gmail.com';  -- ⚠️ CHANGE THIS TO YOUR EMAIL

-- STEP 4: Verify the update worked
SELECT 
    id,
    name,
    email,
    role,
    "isActive" as is_active,
    LEFT(password, 20) as password_hash_preview,
    "updatedAt" as updated_at
FROM users
WHERE email = 'steveggaikia@gmail.com';  -- ⚠️ CHANGE THIS TO YOUR EMAIL

-- =====================================================
-- ALTERNATIVE: Create a fresh admin account
-- =====================================================
-- If you want to create a new admin account instead:
-- Email: admin@restaurant.com
-- Password: admin123

INSERT INTO users (
    id,
    name,
    email,
    password,
    role,
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'System Administrator',
    'admin@restaurant.com',
    '$2b$10$lzk7bKJMK3yceLlfpyC5OeP1GPJYM8k1ty/SN4d7xG1d94lBEo0VO',
    'ADMIN',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    "isActive" = true,
    role = 'ADMIN',
    "updatedAt" = NOW();

-- STEP 5: Verify the new account was created
SELECT 
    id,
    name,
    email,
    role,
    "isActive" as is_active
FROM users
WHERE email = 'admin@restaurant.com';
