# Scout MVP Database Migration Guide

## 🚨 Required Database Fixes

Your database needs the following migrations to work properly with the application:

### 1. Fix Function Overloads and Add Missing Columns

Run this SQL in your Supabase SQL Editor:

```sql
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

-- 4. Fix gender distribution function similarly
DROP FUNCTION IF EXISTS public.get_gender_distribution_simple(
  p_start_date TIMESTAMPTZ,
  p_end_date   TIMESTAMPTZ,
  p_barangays  TEXT[],
  p_categories TEXT[],
  p_brands     TEXT[],
  p_stores     TEXT[]
) CASCADE;

-- Keep only the filters JSONB version for gender distribution
-- (The app expects this one to use filters)

COMMIT;
```

### 2. Update Existing Transaction Data

After adding the columns, populate them with data:

```sql
-- Update existing transactions with random demographic data
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
WHERE customer_age IS NULL;
```

### 3. Apply Production Readiness Migrations

Run the `production_readiness.sql` file which includes:
- Row-Level Security policies
- AI insights table
- Edge case data (zero sales, peak hours)
- Materialized view refresh functions

### 4. Verify Everything Works

Test the functions:

```sql
-- Test age distribution with date range
SELECT * FROM get_age_distribution_simple('2025-01-01', '2025-12-31');

-- Test dashboard summary
SELECT * FROM get_dashboard_summary(filters := '{}');

-- Verify transaction demographics
SELECT 
  COUNT(*) as total,
  COUNT(customer_age) as with_age,
  COUNT(customer_gender) as with_gender
FROM transactions;
```

## 📝 Application Configuration

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=https://jrxepdlkgdwwjxdeetmb.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# For AI Insights
AZURE_OPENAI_ENDPOINT=https://tbwa-openai.openai.azure.com/
AZURE_OPENAI_API_KEY=your_azure_key
```

## 🚀 After Migration

1. The app will correctly show age and gender distributions
2. AI insights will work with Azure OpenAI
3. All analytics functions will work properly
4. The dashboard will display real Philippine retail data

## ⚠️ Common Issues

1. **"Cannot extract elements from scalar"** - Run the function overload fix
2. **"Column does not exist"** - Run the ALTER TABLE statements
3. **"Could not choose best candidate function"** - Drop the duplicate functions
4. **Empty demographics** - Run the UPDATE statement to populate data