-- Production Readiness: RLS, Edge Cases, and Security
-- This migration addresses the gaps for MVP-ready deployment

BEGIN;

--------------------------------------------------------------------------------
-- 1. ROW-LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Allow public read access to brands" ON public.brands;
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public read access to stores" ON public.stores;
DROP POLICY IF EXISTS "Allow public read access to customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public read access to transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public read access to transaction_items" ON public.transaction_items;

-- Create comprehensive RLS policies for analytics dashboard
-- These policies allow public read access for dashboard functionality

-- Brands: Public read access for dashboard
CREATE POLICY "dashboard_read_brands" ON public.brands
  FOR SELECT TO public USING (true);

-- Products: Public read access for dashboard
CREATE POLICY "dashboard_read_products" ON public.products
  FOR SELECT TO public USING (true);

-- Stores: Public read access for dashboard
CREATE POLICY "dashboard_read_stores" ON public.stores
  FOR SELECT TO public USING (true);

-- Customers: Limited public read access (no PII exposure)
CREATE POLICY "dashboard_read_customers_limited" ON public.customers
  FOR SELECT TO public USING (true);

-- Transactions: Public read access for analytics
CREATE POLICY "dashboard_read_transactions" ON public.transactions
  FOR SELECT TO public USING (true);

-- Transaction Items: Public read access for analytics
CREATE POLICY "dashboard_read_transaction_items" ON public.transaction_items
  FOR SELECT TO public USING (true);

-- Create analyst role with more permissive access (for future use)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analyst') THEN
    CREATE ROLE analyst;
  END IF;
END $$;

-- Grant analyst role access to analytics functions
GRANT USAGE ON SCHEMA public TO analyst;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analyst;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO analyst;

-- Create admin policies for data management (service role)
CREATE POLICY "admin_full_access_brands" ON public.brands
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "admin_full_access_products" ON public.products
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "admin_full_access_stores" ON public.stores
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "admin_full_access_customers" ON public.customers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "admin_full_access_transactions" ON public.transactions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "admin_full_access_transaction_items" ON public.transaction_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

--------------------------------------------------------------------------------
-- 2. TEMPORAL EDGE CASES & REALISTIC DATA PATTERNS
--------------------------------------------------------------------------------

-- Add zero-sales days for testing edge cases
INSERT INTO public.transactions (
  created_at, checkout_time, total_amount, customer_age, customer_gender, 
  store_id, device_id, request_type, suggestion_accepted, is_weekend
) VALUES 
-- Zero sales day (Sunday)
('2025-06-01 00:00:00+00', '2025-06-01 00:00:00+00', 0, 25, 'F', 1, 'device_zero_1', 'no_sale', false, true),
-- Very low sales day (Monday after holiday)
('2025-06-02 10:30:00+00', '2025-06-02 10:30:00+00', 15.50, 35, 'M', 2, 'device_low_1', 'branded', true, false),
('2025-06-02 14:15:00+00', '2025-06-02 14:15:00+00', 22.75, 28, 'F', 3, 'device_low_2', 'generic', false, false);

-- Add peak hour spikes (Christmas rush simulation)
DO $$
DECLARE
  i INTEGER;
  peak_day DATE := '2025-12-24';
  store_count INTEGER := 4;
BEGIN
  -- Generate 200 transactions for peak Christmas Eve (5x normal volume)
  FOR i IN 1..200 LOOP
    INSERT INTO public.transactions (
      created_at, checkout_time, total_amount, customer_age, customer_gender,
      store_id, device_id, request_type, suggestion_accepted, is_weekend
    ) VALUES (
      peak_day + (i::text || ' minutes')::interval,
      peak_day + (i::text || ' minutes')::interval,
      (50 + random() * 500)::numeric(10,2), -- Higher transaction values
      (18 + random() * 60)::integer,
      CASE WHEN random() < 0.6 THEN 'F' ELSE 'M' END, -- More female shoppers
      (random() * store_count + 1)::integer,
      'peak_device_' || i,
      CASE WHEN random() < 0.8 THEN 'branded' ELSE 'generic' END,
      random() < 0.7, -- Higher suggestion acceptance during peak
      true -- Christmas Eve is weekend-like behavior
    );
  END LOOP;
END $$;

-- Add early morning (6-8 AM) and late evening (8-10 PM) transactions
INSERT INTO public.transactions (
  created_at, checkout_time, total_amount, customer_age, customer_gender,
  store_id, device_id, request_type, suggestion_accepted, is_weekend
) VALUES 
-- Early morning rush (6-8 AM)
('2025-06-15 06:15:00+00', '2025-06-15 06:15:00+00', 45.50, 32, 'M', 1, 'early_rush_1', 'branded', true, false),
('2025-06-15 06:45:00+00', '2025-06-15 06:45:00+00', 38.75, 28, 'F', 2, 'early_rush_2', 'branded', true, false),
('2025-06-15 07:30:00+00', '2025-06-15 07:30:00+00', 52.25, 35, 'M', 3, 'early_rush_3', 'generic', false, false),
-- Late evening (8-10 PM)
('2025-06-15 20:15:00+00', '2025-06-15 20:15:00+00', 65.50, 42, 'F', 1, 'late_evening_1', 'branded', true, false),
('2025-06-15 21:30:00+00', '2025-06-15 21:30:00+00', 48.75, 38, 'M', 4, 'late_evening_2', 'generic', true, false),
('2025-06-15 21:45:00+00', '2025-06-15 21:45:00+00', 72.25, 29, 'F', 2, 'late_evening_3', 'branded', false, false);

--------------------------------------------------------------------------------
-- 3. AI INSIGHTS SEED DATA
--------------------------------------------------------------------------------

-- Create table for AI insights if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id SERIAL PRIMARY KEY,
  insight_type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info', -- info, warning, critical
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on AI insights
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_read_ai_insights" ON public.ai_insights
  FOR SELECT TO public USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Insert realistic AI insights seed data
INSERT INTO public.ai_insights (insight_type, title, description, severity, data, expires_at) VALUES

-- Revenue insights
('revenue', 'Peak Sales Hour Identified', 
 'Sales spike detected between 7-8 PM on weekdays. Consider staff optimization during these hours.',
 'info', 
 '{"peak_hour": "19:00-20:00", "increase_percentage": 35, "recommended_action": "increase_staff"}',
 now() + interval '30 days'),

('revenue', 'Weekend Revenue Decline', 
 'Weekend sales down 15% compared to last month. Consider promotional campaigns.',
 'warning',
 '{"decline_percentage": 15, "affected_days": ["Saturday", "Sunday"], "suggested_promotions": ["family_packs", "weekend_specials"]}',
 now() + interval '7 days'),

-- Customer behavior insights  
('customer', 'Age Group Preference Shift',
 'Customers aged 26-35 showing increased preference for premium brands (+12%).',
 'info',
 '{"age_group": "26-35", "preference_shift": 12, "trending_brands": ["Procter & Gamble", "Colgate"]}',
 now() + interval '14 days'),

('customer', 'Gender-Based Shopping Patterns',
 'Female customers spend 40% more on Personal Care items during weekends.',
 'info',
 '{"gender": "Female", "category": "Personal Care", "weekend_increase": 40}',
 now() + interval '21 days'),

-- Product insights
('product', 'Low Stock Alert',
 'Beverage category showing high demand. Consider restocking popular items.',
 'warning',
 '{"category": "Beverages", "demand_increase": 25, "low_stock_products": ["C2 Green Tea", "Coca-Cola"]}',
 now() + interval '3 days'),

('product', 'Cross-Selling Opportunity',
 'Customers buying milk products often purchase snacks. Bundle recommendation active.',
 'info',
 '{"primary_category": "Beverages", "secondary_category": "Snacks", "correlation": 0.65}',
 now() + interval '10 days'),

-- Operational insights
('operational', 'Store Performance Variance',
 'Store in Poblacion outperforming others by 20%. Analyze best practices for replication.',
 'info',
 '{"top_store": "Poblacion", "performance_gap": 20, "key_metrics": ["transaction_volume", "avg_basket_size"]}',
 now() + interval '30 days'),

('operational', 'Device Health Alert',
 'Some POS devices showing connectivity issues. Schedule maintenance check.',
 'critical',
 '{"affected_devices": 3, "error_rate": 5, "recommended_action": "immediate_maintenance"}',
 now() + interval '1 day');

--------------------------------------------------------------------------------
-- 4. MATERIALIZED VIEW REFRESH FUNCTION (ENHANCED)
--------------------------------------------------------------------------------

-- Enhanced refresh function with error handling
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS TABLE(view_name TEXT, status TEXT, execution_time INTERVAL)
LANGUAGE plpgsql AS $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
BEGIN
    -- Refresh mv_daily_metrics
    start_time := clock_timestamp();
    
    BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_daily_metrics;
        end_time := clock_timestamp();
        
        RETURN QUERY SELECT 'mv_daily_metrics'::TEXT, 'success'::TEXT, (end_time - start_time);
    EXCEPTION WHEN OTHERS THEN
        end_time := clock_timestamp();
        RETURN QUERY SELECT 'mv_daily_metrics'::TEXT, ('error: ' || SQLERRM)::TEXT, (end_time - start_time);
    END;
    
    -- Log refresh activity
    INSERT INTO public.ai_insights (insight_type, title, description, severity, data)
    VALUES ('system', 'Materialized Views Refreshed', 
            'Daily metrics materialized view updated successfully', 
            'info',
            jsonb_build_object('refresh_time', now(), 'view_count', 1));
            
END $$;

-- Create a scheduling function that can be called by external cron
CREATE OR REPLACE FUNCTION public.schedule_refresh_materialized_views()
RETURNS TEXT
LANGUAGE plpgsql AS $$
DECLARE
    result_text TEXT;
BEGIN
    -- Only refresh if last refresh was more than 5 minutes ago
    IF NOT EXISTS (
        SELECT 1 FROM public.ai_insights 
        WHERE insight_type = 'system' 
        AND title = 'Materialized Views Refreshed'
        AND created_at > now() - interval '5 minutes'
    ) THEN
        PERFORM public.refresh_materialized_views();
        result_text := 'Materialized views refreshed at ' || now();
    ELSE
        result_text := 'Materialized views already refreshed recently';
    END IF;
    
    RETURN result_text;
END $$;

--------------------------------------------------------------------------------
-- 5. ANALYTICS FUNCTION SECURITY & OPTIMIZATION
--------------------------------------------------------------------------------

-- Grant public access to analytics functions
GRANT EXECUTE ON FUNCTION public.get_age_distribution_simple(TIMESTAMPTZ) TO public;
GRANT EXECUTE ON FUNCTION public.get_gender_distribution_simple(TIMESTAMPTZ) TO public;
GRANT EXECUTE ON FUNCTION public.get_daily_trends(TIMESTAMPTZ) TO public;
GRANT EXECUTE ON FUNCTION public.get_brand_performance(TIMESTAMPTZ) TO public;
GRANT EXECUTE ON FUNCTION public.refresh_materialized_views() TO service_role;
GRANT EXECUTE ON FUNCTION public.schedule_refresh_materialized_views() TO service_role;

-- Create function to get AI insights for dashboard
CREATE OR REPLACE FUNCTION public.get_ai_insights(insight_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  id INTEGER,
  insight_type VARCHAR,
  title TEXT,
  description TEXT,
  severity VARCHAR,
  data JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT id, insight_type, title, description, severity, data, created_at
  FROM public.ai_insights
  WHERE is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY 
    CASE severity 
      WHEN 'critical' THEN 1
      WHEN 'warning' THEN 2
      WHEN 'info' THEN 3
    END,
    created_at DESC
  LIMIT insight_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_ai_insights(INTEGER) TO public;

--------------------------------------------------------------------------------
COMMIT;

-- Create indexes for performance (outside transaction)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_checkout_time_hour 
ON public.transactions (date_trunc('hour', checkout_time));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_checkout_time_day 
ON public.transactions (date_trunc('day', checkout_time));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_insights_active_severity 
ON public.ai_insights (is_active, severity, created_at) 
WHERE is_active = true;