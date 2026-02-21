-- Remove the old camelCase foreign key constraint
-- This fixes the "more than one relationship was found" error

ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS "order_items_orderId_fkey";

-- Verify only the new snake_case foreign key remains
-- You should see only: order_items_order_id_fkey
SELECT conname 
FROM pg_constraint 
WHERE conrelid = 'order_items'::regclass 
AND contype = 'f';
