-- Scout Analytics v3 - Azure Database Functions
-- Analytics functions for both Azure SQL and Azure PostgreSQL

-- =============================================================================
-- AZURE POSTGRESQL FUNCTIONS
-- =============================================================================

-- Function: get_dashboard_summary
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(filters jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
    date_filter text;
    region_filter text;
    store_filter text;
BEGIN
    -- Extract filters
    date_filter := COALESCE(filters->>'date_range', 'last_30_days');
    region_filter := filters->>'region';
    store_filter := filters->>'store';
    
    WITH filtered_data AS (
        SELECT 
            t.total_amount,
            t.transaction_date,
            s.region,
            s.name as store_name,
            t.customer_id
        FROM public.transactions t
        JOIN public.stores s ON t.store_id = s.id
        WHERE 
            (region_filter IS NULL OR s.region = region_filter)
            AND (store_filter IS NULL OR s.name = store_filter)
            AND (
                CASE date_filter
                    WHEN 'last_7_days' THEN t.transaction_date >= NOW() - INTERVAL '7 days'
                    WHEN 'last_30_days' THEN t.transaction_date >= NOW() - INTERVAL '30 days'
                    WHEN 'last_90_days' THEN t.transaction_date >= NOW() - INTERVAL '90 days'
                    ELSE t.transaction_date >= NOW() - INTERVAL '30 days'
                END
            )
    )
    SELECT jsonb_build_object(
        'total_revenue', COALESCE(SUM(total_amount), 0),
        'total_transactions', COUNT(*),
        'unique_customers', COUNT(DISTINCT customer_id),
        'avg_order_value', COALESCE(AVG(total_amount), 0),
        'revenue_growth', 12.5, -- Placeholder for growth calculation
        'transaction_growth', 8.3  -- Placeholder for growth calculation
    ) INTO result
    FROM filtered_data;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Function: get_location_distribution
CREATE OR REPLACE FUNCTION public.get_location_distribution(filters jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
BEGIN
    WITH location_stats AS (
        SELECT 
            s.region,
            s.city,
            COUNT(t.id) as transaction_count,
            SUM(t.total_amount) as total_revenue,
            COUNT(DISTINCT t.customer_id) as unique_customers
        FROM public.transactions t
        JOIN public.stores s ON t.store_id = s.id
        WHERE t.transaction_date >= NOW() - INTERVAL '30 days'
        GROUP BY s.region, s.city
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'region', region,
            'city', city,
            'transaction_count', transaction_count,
            'total_revenue', total_revenue,
            'unique_customers', unique_customers,
            'avg_revenue_per_customer', CASE WHEN unique_customers > 0 THEN total_revenue / unique_customers ELSE 0 END
        )
    ) INTO result
    FROM location_stats
    ORDER BY total_revenue DESC;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Function: get_product_categories_summary
CREATE OR REPLACE FUNCTION public.get_product_categories_summary(filters jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
BEGIN
    WITH category_stats AS (
        SELECT 
            p.category,
            COUNT(ti.id) as item_count,
            SUM(ti.quantity) as total_quantity,
            SUM(ti.total_price) as total_revenue,
            AVG(ti.unit_price) as avg_price
        FROM public.transaction_items ti
        JOIN public.products p ON ti.product_id = p.id
        JOIN public.transactions t ON ti.transaction_id = t.id
        WHERE t.transaction_date >= NOW() - INTERVAL '30 days'
        GROUP BY p.category
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'category', category,
            'item_count', item_count,
            'total_quantity', total_quantity,
            'total_revenue', total_revenue,
            'avg_price', avg_price,
            'market_share', ROUND((total_revenue / SUM(total_revenue) OVER()) * 100, 2)
        )
    ) INTO result
    FROM category_stats
    ORDER BY total_revenue DESC;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Function: get_brand_performance
CREATE OR REPLACE FUNCTION public.get_brand_performance(filters jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
BEGIN
    WITH brand_stats AS (
        SELECT 
            b.name as brand_name,
            b.company,
            b.is_tbwa,
            COUNT(ti.id) as item_count,
            SUM(ti.quantity) as total_quantity,
            SUM(ti.total_price) as total_revenue,
            AVG(ti.unit_price) as avg_price
        FROM public.transaction_items ti
        JOIN public.products p ON ti.product_id = p.id
        JOIN public.brands b ON p.brand_id = b.id
        JOIN public.transactions t ON ti.transaction_id = t.id
        WHERE t.transaction_date >= NOW() - INTERVAL '30 days'
        GROUP BY b.id, b.name, b.company, b.is_tbwa
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'brand_name', brand_name,
            'company', company,
            'is_tbwa', is_tbwa,
            'item_count', item_count,
            'total_quantity', total_quantity,
            'total_revenue', total_revenue,
            'avg_price', avg_price,
            'market_share', ROUND((total_revenue / SUM(total_revenue) OVER()) * 100, 2)
        )
    ) INTO result
    FROM brand_stats
    ORDER BY total_revenue DESC;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Function: get_daily_trends
CREATE OR REPLACE FUNCTION public.get_daily_trends(filters jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
BEGIN
    WITH daily_stats AS (
        SELECT 
            DATE(t.transaction_date) as sale_date,
            COUNT(t.id) as transaction_count,
            SUM(t.total_amount) as total_revenue,
            COUNT(DISTINCT t.customer_id) as unique_customers,
            AVG(t.total_amount) as avg_order_value
        FROM public.transactions t
        WHERE t.transaction_date >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(t.transaction_date)
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'date', sale_date,
            'transaction_count', transaction_count,
            'total_revenue', total_revenue,
            'unique_customers', unique_customers,
            'avg_order_value', avg_order_value
        ) ORDER BY sale_date
    ) INTO result
    FROM daily_stats;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Function: get_age_distribution_simple
CREATE OR REPLACE FUNCTION public.get_age_distribution_simple(filters jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
BEGIN
    WITH age_groups AS (
        SELECT 
            CASE 
                WHEN c.age < 25 THEN '18-24'
                WHEN c.age < 35 THEN '25-34'
                WHEN c.age < 45 THEN '35-44'
                WHEN c.age < 55 THEN '45-54'
                WHEN c.age < 65 THEN '55-64'
                ELSE '65+'
            END as age_group,
            COUNT(DISTINCT c.id) as customer_count,
            SUM(t.total_amount) as total_spent,
            AVG(t.total_amount) as avg_order_value
        FROM public.customers c
        JOIN public.transactions t ON c.id = t.customer_id
        WHERE t.transaction_date >= NOW() - INTERVAL '30 days'
        AND c.age IS NOT NULL
        GROUP BY 
            CASE 
                WHEN c.age < 25 THEN '18-24'
                WHEN c.age < 35 THEN '25-34'
                WHEN c.age < 45 THEN '35-44'
                WHEN c.age < 55 THEN '45-54'
                WHEN c.age < 65 THEN '55-64'
                ELSE '65+'
            END
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'age_group', age_group,
            'customer_count', customer_count,
            'total_spent', total_spent,
            'avg_order_value', avg_order_value,
            'percentage', ROUND((customer_count::numeric / SUM(customer_count) OVER()) * 100, 2)
        )
    ) INTO result
    FROM age_groups
    ORDER BY age_group;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Function: get_gender_distribution_simple
CREATE OR REPLACE FUNCTION public.get_gender_distribution_simple(filters jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
BEGIN
    WITH gender_stats AS (
        SELECT 
            c.gender,
            COUNT(DISTINCT c.id) as customer_count,
            SUM(t.total_amount) as total_spent,
            AVG(t.total_amount) as avg_order_value
        FROM public.customers c
        JOIN public.transactions t ON c.id = t.customer_id
        WHERE t.transaction_date >= NOW() - INTERVAL '30 days'
        AND c.gender IS NOT NULL
        GROUP BY c.gender
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'gender', gender,
            'customer_count', customer_count,
            'total_spent', total_spent,
            'avg_order_value', avg_order_value,
            'percentage', ROUND((customer_count::numeric / SUM(customer_count) OVER()) * 100, 2)
        )
    ) INTO result
    FROM gender_stats
    ORDER BY customer_count DESC;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- =============================================================================
-- AZURE SQL SERVER STORED PROCEDURES (EQUIVALENT FUNCTIONS)
-- =============================================================================

-- Note: Azure SQL Server doesn't have the same function syntax as PostgreSQL
-- Instead, we create stored procedures that return JSON strings

-- Stored Procedure: sp_get_dashboard_summary
-- CREATE PROCEDURE sp_get_dashboard_summary
--     @filters NVARCHAR(MAX) = '{}'
-- AS
-- BEGIN
--     DECLARE @result NVARCHAR(MAX);
--     
--     WITH filtered_data AS (
--         SELECT 
--             t.total_amount,
--             t.transaction_date,
--             s.region,
--             s.name as store_name,
--             t.customer_id
--         FROM transactions t
--         JOIN stores s ON t.store_id = s.id
--         WHERE t.transaction_date >= DATEADD(day, -30, GETUTCDATE())
--     )
--     SELECT @result = (
--         SELECT 
--             ISNULL(SUM(total_amount), 0) as total_revenue,
--             COUNT(*) as total_transactions,
--             COUNT(DISTINCT customer_id) as unique_customers,
--             ISNULL(AVG(total_amount), 0) as avg_order_value,
--             12.5 as revenue_growth,
--             8.3 as transaction_growth
--         FROM filtered_data
--         FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
--     );
--     
--     SELECT @result as dashboard_summary;
-- END;

SELECT 'Azure database functions created successfully!' as status;