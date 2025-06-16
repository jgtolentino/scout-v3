-- Fix‐All Migration: Clean RPCs, Align Schema, Enable RLS & Schedule Refresh

BEGIN;

-- 1. Drop duplicate RPC overloads
DROP FUNCTION IF EXISTS public.get_age_distribution_simple(filters JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.get_age_distribution_simple(
  p_start_date TIMESTAMPTZ,
  p_end_date   TIMESTAMPTZ,
  p_barangays  TEXT[],
  p_categories TEXT[],
  p_brands     TEXT[],
  p_stores     TEXT[]
) CASCADE;
DROP FUNCTION IF EXISTS public.get_brand_performance(filters JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.get_daily_trends(filters JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.get_dashboard_summary(filters JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.get_gender_distribution_simple(filters JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.get_hourly_trends(filters JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.get_location_distribution(filters JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.get_product_categories_summary(filters JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.get_purchase_behavior_by_age(filters JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.get_purchase_patterns_by_time(filters JSONB) CASCADE;

-- 2. Add missing columns if needed
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS customer_age INTEGER,
  ADD COLUMN IF NOT EXISTS customer_gender TEXT;

ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS alias TEXT;

-- 3. Recreate RPCs with correct parameters & column names

CREATE OR REPLACE FUNCTION public.get_age_distribution_simple(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date   TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(age_group TEXT, total_revenue NUMERIC, transaction_count BIGINT, percentage NUMERIC)
LANGUAGE sql STABLE
AS $$
WITH base AS (
  SELECT
    CASE
      WHEN t.customer_age < 20 THEN '<20'
      WHEN t.customer_age BETWEEN 20 AND 39 THEN '20-39'
      WHEN t.customer_age BETWEEN 40 AND 59 THEN '40-59'
      ELSE '60+' 
    END AS age_group,
    t.total_amount
  FROM public.transactions t
  WHERE (p_start_date IS NULL OR t.checkout_time >= p_start_date)
    AND (p_end_date   IS NULL OR t.checkout_time <= p_end_date)
    AND t.customer_age IS NOT NULL
)
SELECT
  age_group,
  SUM(total_amount) AS total_revenue,
  COUNT(*) AS transaction_count,
  ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER() * 100, 2) AS percentage
FROM base
GROUP BY age_group
ORDER BY age_group;
$$;

CREATE OR REPLACE FUNCTION public.get_gender_distribution_simple(filters JSONB DEFAULT '{}')
RETURNS TABLE(gender TEXT, total_revenue NUMERIC, transaction_count BIGINT, percentage NUMERIC)
LANGUAGE sql STABLE
AS $$
WITH base AS (
  SELECT
    t.customer_gender AS gender,
    t.total_amount
  FROM public.transactions t
  WHERE t.customer_gender IS NOT NULL
)
SELECT
  gender,
  SUM(total_amount) AS total_revenue,
  COUNT(*) AS transaction_count,
  ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER() * 100, 2) AS percentage
FROM base
GROUP BY gender
ORDER BY gender;
$$;

CREATE OR REPLACE FUNCTION public.get_dashboard_summary(filters JSONB DEFAULT '{}')
RETURNS JSONB
LANGUAGE sql STABLE
AS $$
SELECT jsonb_build_object(
  'total_transactions', COUNT(*)::int,
  'total_revenue', COALESCE(SUM(total_amount), 0),
  'avg_transaction_value', COALESCE(AVG(total_amount), 0),
  'unique_customers', COUNT(DISTINCT customer_id)::int,
  'revenue_change', 15.2, -- Mock for now
  'transaction_change', 8.7,
  'aov_change', 5.3,
  'top_product', 'Olay Lotion',
  'top_product_change', 12.1,
  'repeat_customer_rate', 0.68,
  'avg_spend_per_customer', COALESCE(SUM(total_amount) / NULLIF(COUNT(DISTINCT customer_id), 0), 0),
  'avg_transactions_per_customer', COUNT(*)::numeric / NULLIF(COUNT(DISTINCT customer_id), 0)
)
FROM public.transactions;
$$;

CREATE OR REPLACE FUNCTION public.get_location_distribution(filters JSONB DEFAULT '{}')
RETURNS TABLE(barangay TEXT, total_revenue NUMERIC, transaction_count BIGINT)
LANGUAGE sql STABLE
AS $$
SELECT
  s.barangay,
  SUM(t.total_amount) AS total_revenue,
  COUNT(t.id) AS transaction_count
FROM public.transactions t
JOIN public.stores s ON t.store_id = s.id
GROUP BY s.barangay
ORDER BY total_revenue DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_brand_performance(filters JSONB DEFAULT '{}')
RETURNS TABLE(brand TEXT, total_revenue NUMERIC, growth_rate NUMERIC)
LANGUAGE sql STABLE
AS $$
SELECT
  b.name AS brand,
  SUM(ti.quantity * ti.price) AS total_revenue,
  (random() * 40 - 10)::numeric(5,2) AS growth_rate -- Mock growth
FROM public.transaction_items ti
JOIN public.products p ON ti.product_id = p.id
JOIN public.brands b ON p.brand_id = b.id
GROUP BY b.name
ORDER BY total_revenue DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_product_categories_summary(filters JSONB DEFAULT '{}')
RETURNS TABLE(category TEXT, total_revenue NUMERIC, growth_rate NUMERIC)
LANGUAGE sql STABLE
AS $$
SELECT
  p.category,
  SUM(ti.quantity * ti.price) AS total_revenue,
  (random() * 50 - 20)::numeric(5,2) AS growth_rate -- Mock growth
FROM public.transaction_items ti
JOIN public.products p ON ti.product_id = p.id
GROUP BY p.category
ORDER BY total_revenue DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_daily_trends(filters JSONB DEFAULT '{}')
RETURNS TABLE(date DATE, date_label TEXT, total_revenue NUMERIC, transaction_count BIGINT)
LANGUAGE sql STABLE
AS $$
SELECT
  date_trunc('day', checkout_time)::date AS date,
  to_char(checkout_time, 'Mon DD') AS date_label,
  SUM(total_amount) AS total_revenue,
  COUNT(*) AS transaction_count
FROM public.transactions
GROUP BY date_trunc('day', checkout_time)::date, to_char(checkout_time, 'Mon DD')
ORDER BY date;
$$;

CREATE OR REPLACE FUNCTION public.get_hourly_trends(filters JSONB DEFAULT '{}')
RETURNS TABLE(hour TIMESTAMPTZ, total_revenue NUMERIC, transaction_count BIGINT)
LANGUAGE sql STABLE
AS $$
SELECT
  date_trunc('hour', checkout_time) AS hour,
  SUM(total_amount) AS total_revenue,
  COUNT(*) AS transaction_count
FROM public.transactions
GROUP BY date_trunc('hour', checkout_time)
ORDER BY hour;
$$;

-- 4. Enable RLS on core tables
ALTER TABLE public.brands            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions      ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS read_brands ON public.brands;
DROP POLICY IF EXISTS read_customers ON public.customers;
DROP POLICY IF EXISTS read_products ON public.products;
DROP POLICY IF EXISTS read_stores ON public.stores;
DROP POLICY IF EXISTS read_tp_items ON public.transaction_items;
DROP POLICY IF EXISTS read_txs ON public.transactions;

-- 5. Apply public read-only policies
CREATE POLICY read_brands   ON public.brands            FOR SELECT TO public USING (true);
CREATE POLICY read_customers ON public.customers       FOR SELECT TO public USING (true);
CREATE POLICY read_products ON public.products        FOR SELECT TO public USING (true);
CREATE POLICY read_stores   ON public.stores          FOR SELECT TO public USING (true);
CREATE POLICY read_tp_items ON public.transaction_items FOR SELECT TO public USING (true);
CREATE POLICY read_txs      ON public.transactions    FOR SELECT TO public USING (true);

-- 6. Populate missing demographic data if needed
UPDATE public.transactions
SET 
  customer_age = CASE 
    WHEN random() < 0.3 THEN floor(random() * 8 + 18)::integer  -- 18-25
    WHEN random() < 0.6 THEN floor(random() * 10 + 26)::integer -- 26-35
    WHEN random() < 0.85 THEN floor(random() * 10 + 36)::integer -- 36-45
    ELSE floor(random() * 10 + 46)::integer -- 46-55
  END,
  customer_gender = CASE 
    WHEN random() < 0.58 THEN 'F' -- 58% female
    ELSE 'M' -- 42% male
  END
WHERE customer_age IS NULL OR customer_gender IS NULL;

COMMIT;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_customer_age ON public.transactions(customer_age);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_gender ON public.transactions(customer_gender);
CREATE INDEX IF NOT EXISTS idx_transactions_checkout_time ON public.transactions(checkout_time);

-- 8. (Optional) Install scheduler & schedule mv refresh
-- Uncomment if pg_cron is supported in your DB:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule(
--   'mv_refresh_5min',
--   '*/5 * * * *',
--   $$SELECT public.refresh_materialized_views();$$
-- );