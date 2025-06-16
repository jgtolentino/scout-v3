BEGIN;

-- 1. Add missing columns to match application inserts
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS alias TEXT;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS customer_age   INTEGER,
  ADD COLUMN IF NOT EXISTS customer_gender TEXT;

-- 2. Remove duplicate/erroneous overloads of get_age_distribution_simple
DROP FUNCTION IF EXISTS public.get_age_distribution_simple(
  filters JSONB
) CASCADE;
DROP FUNCTION IF EXISTS public.get_age_distribution_simple(
  p_start_date TIMESTAMPTZ,
  p_end_date   TIMESTAMPTZ,
  p_barangays  TEXT[],
  p_categories TEXT[],
  p_brands     TEXT[],
  p_stores     TEXT[]
) CASCADE;

-- 3. Re‐deploy the single correct definition of get_age_distribution_simple
CREATE OR REPLACE FUNCTION public.get_age_distribution_simple(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date   TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(age_group TEXT, count BIGINT, percentage NUMERIC)
LANGUAGE sql STABLE AS $
WITH base AS (
  SELECT
    CASE
      WHEN customer_age < 20 THEN '<20'
      WHEN customer_age BETWEEN 20 AND 39 THEN '20-39'
      WHEN customer_age BETWEEN 40 AND 59 THEN '40-59'
      ELSE '60+' END AS age_group
  FROM public.transactions
  WHERE (p_start_date IS NULL OR checkout_time >= p_start_date)
    AND (p_end_date   IS NULL OR checkout_time <= p_end_date)
)
SELECT
  age_group,
  COUNT(*)                         AS count,
  ROUND( COUNT(*)::NUMERIC
       / SUM(COUNT(*)) OVER () * 100, 2) AS percentage
FROM base
GROUP BY age_group;
$;

COMMIT;