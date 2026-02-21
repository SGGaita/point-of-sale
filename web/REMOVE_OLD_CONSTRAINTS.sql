-- Remove NOT NULL constraints from old camelCase columns
-- This allows the sync API to use the new snake_case columns

-- Remove NOT NULL constraints from orders table
ALTER TABLE orders 
ALTER COLUMN "orderNumber" DROP NOT NULL,
ALTER COLUMN "waiter" DROP NOT NULL,
ALTER COLUMN "total" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "timestamp" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- Remove NOT NULL constraints from order_items table
ALTER TABLE order_items 
ALTER COLUMN "orderId" DROP NOT NULL,
ALTER COLUMN "itemName" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "totalPrice" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- Make the new snake_case columns NOT NULL instead
ALTER TABLE orders 
ALTER COLUMN order_number SET NOT NULL,
ALTER COLUMN waiter SET NOT NULL,
ALTER COLUMN total SET NOT NULL,
ALTER COLUMN status SET NOT NULL,
ALTER COLUMN timestamp SET NOT NULL;

ALTER TABLE order_items 
ALTER COLUMN order_id SET NOT NULL,
ALTER COLUMN item_name SET NOT NULL,
ALTER COLUMN price SET NOT NULL,
ALTER COLUMN quantity SET NOT NULL,
ALTER COLUMN total_price SET NOT NULL;
