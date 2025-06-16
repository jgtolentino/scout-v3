-- Fix foreign key relationships for transaction items
-- This ensures proper joining between transactions_fmcg and transaction_items_fmcg

-- First, check if the foreign key constraint already exists
DO $$
BEGIN
    -- Add foreign key constraint for transaction_items_fmcg -> transactions_fmcg
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transaction_items_fmcg_transaction_id_fkey'
        AND table_name = 'transaction_items_fmcg'
    ) THEN
        ALTER TABLE transaction_items_fmcg
        ADD CONSTRAINT transaction_items_fmcg_transaction_id_fkey
        FOREIGN KEY (transaction_id) REFERENCES transactions_fmcg(id)
        ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key constraint for transaction_items_fmcg -> products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transaction_items_fmcg_product_id_fkey'
        AND table_name = 'transaction_items_fmcg'
    ) THEN
        ALTER TABLE transaction_items_fmcg
        ADD CONSTRAINT transaction_items_fmcg_product_id_fkey
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT;
    END IF;
    
    -- Add foreign key constraint for transactions_fmcg -> customers
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transactions_fmcg_customer_id_fkey'
        AND table_name = 'transactions_fmcg'
    ) THEN
        ALTER TABLE transactions_fmcg
        ADD CONSTRAINT transactions_fmcg_customer_id_fkey
        FOREIGN KEY (customer_id) REFERENCES customers(id)
        ON DELETE RESTRICT;
    END IF;
    
    -- Add foreign key constraint for transactions_fmcg -> stores
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transactions_fmcg_store_id_fkey'
        AND table_name = 'transactions_fmcg'
    ) THEN
        ALTER TABLE transactions_fmcg
        ADD CONSTRAINT transactions_fmcg_store_id_fkey
        FOREIGN KEY (store_id) REFERENCES stores(id)
        ON DELETE RESTRICT;
    END IF;
    
    -- Add foreign key constraint for products -> brands
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_brand_id_fkey'
        AND table_name = 'products'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT products_brand_id_fkey
        FOREIGN KEY (brand_id) REFERENCES brands(id)
        ON DELETE RESTRICT;
    END IF;
END $$;

-- Create a function to get transaction statistics for the data table
CREATE OR REPLACE FUNCTION get_transaction_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'totalTransactions', (SELECT COUNT(*) FROM transactions_fmcg),
        'totalRevenue', (SELECT COALESCE(SUM(total_amount), 0) FROM transactions_fmcg),
        'uniqueCustomers', (SELECT COUNT(DISTINCT customer_id) FROM transactions_fmcg),
        'totalItems', (SELECT COALESCE(SUM(quantity), 0) FROM transaction_items_fmcg),
        'dateRange', jsonb_build_object(
            'from', (SELECT MIN(transaction_date) FROM transactions_fmcg),
            'to', (SELECT MAX(transaction_date) FROM transactions_fmcg)
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_transaction_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_transaction_stats() TO anon;

-- Create indexes for better performance on large dataset queries
CREATE INDEX IF NOT EXISTS idx_transactions_fmcg_date ON transactions_fmcg(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_fmcg_customer ON transactions_fmcg(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_fmcg_store ON transactions_fmcg(store_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_fmcg_transaction ON transaction_items_fmcg(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_fmcg_product ON transaction_items_fmcg(product_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_stores_region ON stores(region);

-- Add comments for documentation
COMMENT ON FUNCTION get_transaction_stats() IS 'Returns comprehensive statistics about all transactions in the FMCG dataset';

-- Create a view for easier transaction data access with all relationships
CREATE OR REPLACE VIEW transactions_with_details AS
SELECT 
    t.id,
    t.transaction_date,
    t.total_amount,
    t.payment_method,
    c.customer_id as customer_code,
    c.first_name,
    c.last_name,
    c.age,
    c.gender,
    c.income_bracket,
    s.name as store_name,
    s.region,
    s.address as store_address,
    ti.quantity,
    ti.unit_price,
    ti.total_price,
    p.name as product_name,
    p.category,
    p.unit_cost,
    b.name as brand_name,
    b.company
FROM transactions_fmcg t
LEFT JOIN customers c ON t.customer_id = c.id
LEFT JOIN stores s ON t.store_id = s.id
LEFT JOIN transaction_items_fmcg ti ON t.id = ti.transaction_id
LEFT JOIN products p ON ti.product_id = p.id
LEFT JOIN brands b ON p.brand_id = b.id
ORDER BY t.transaction_date DESC;

-- Grant access to the view
GRANT SELECT ON transactions_with_details TO authenticated;
GRANT SELECT ON transactions_with_details TO anon;

COMMENT ON VIEW transactions_with_details IS 'Comprehensive view of all transaction data with customer, store, product, and brand details';