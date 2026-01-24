-- =====================================================
-- INVENTORY STOCK REDUCTION FUNCTION
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- Function to reduce inventory stock when order is completed
CREATE OR REPLACE FUNCTION reduce_inventory_stock(
    item_id UUID,
    quantity_to_reduce DECIMAL
)
RETURNS VOID AS $$
BEGIN
    -- Update the current stock
    UPDATE inventory_items
    SET 
        current_stock = current_stock - quantity_to_reduce,
        updated_at = NOW()
    WHERE id = item_id;
    
    -- Create stock transaction record
    INSERT INTO stock_transactions (
        id,
        inventory_item_id,
        transaction_type,
        quantity,
        transaction_date,
        notes,
        created_at
    ) VALUES (
        gen_random_uuid(),
        item_id,
        'SALE',
        -quantity_to_reduce,
        NOW(),
        'Automatic stock reduction from order',
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Test the function (optional)
-- SELECT reduce_inventory_stock('your-item-id-here', 1.0);
