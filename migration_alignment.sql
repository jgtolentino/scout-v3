-- Migration: Schema, Views, Functions & Triggers for Consumer Insights,  
-- Product Mix Analysis & Transaction Trends pages

BEGIN;

--------------------------------------------------------------------------------
-- 1. Ensure Required Tables Exist (no-op if already created)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stores (
  id          SERIAL PRIMARY KEY,
  name        TEXT        UNIQUE NOT NULL,
  location    TEXT,
  barangay    TEXT,
  city        TEXT,
  region      TEXT,
  latitude    NUMERIC,
  longitude   NUMERIC,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.brands (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR     NOT NULL,
  category    VARCHAR,
  is_tbwa     BOOLEAN     DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR     NOT NULL,
  brand_id    INT         REFERENCES public.brands(id),
  category    VARCHAR,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id                  SERIAL      PRIMARY KEY,
  created_at          TIMESTAMPTZ DEFAULT now(),
  total_amount        NUMERIC     DEFAULT 0,
  customer_age        INT,
  customer_gender     VARCHAR,
  store_id            INT         REFERENCES public.stores(id),
  checkout_time       TIMESTAMPTZ DEFAULT now(),
  device_id           TEXT,
  request_type        VARCHAR     DEFAULT 'branded',
  suggestion_accepted BOOLEAN     DEFAULT false,
  is_weekend          BOOLEAN,
  nlp_processed       BOOLEAN     DEFAULT false,
  nlp_processed_at    TIMESTAMPTZ,
  nlp_confidence_score NUMERIC
);

CREATE TABLE IF NOT EXISTS public.transaction_items (
  id             SERIAL      PRIMARY KEY,
  transaction_id INT         REFERENCES public.transactions(id),
  product_id     INT         REFERENCES public.products(id),
  quantity       INT         NOT NULL,
  price          NUMERIC     NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now()
);

--------------------------------------------------------------------------------
-- 2. MATERIALIZED VIEW & REFRESH FUNCTION
--------------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_daily_metrics AS
SELECT
  date_trunc('day', checkout_time)::date AS day,
  COUNT(*)                          AS total_transactions,
  SUM(total_amount)                 AS total_revenue,
  AVG(total_amount)                 AS avg_transaction_value
FROM public.transactions
GROUP BY date_trunc('day', checkout_time)::date
ORDER BY day;

CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql AS $
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_daily_metrics;
END;
$;

--------------------------------------------------------------------------------
-- 3. VIEWS FOR TRENDS & DISTRIBUTIONS
--------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.daily_trends AS
SELECT * FROM public.mv_daily_metrics;

CREATE OR REPLACE VIEW public.hourly_trends AS
SELECT
  date_trunc('hour', checkout_time) AS hour,
  COUNT(*)                          AS transactions,
  SUM(total_amount)                 AS total_revenue,
  AVG(total_amount)                 AS avg_transaction_value
FROM public.transactions
GROUP BY date_trunc('hour', checkout_time)
ORDER BY hour;

CREATE OR REPLACE VIEW public.day_of_week_performance AS
SELECT
  to_char(checkout_time,'FMDay') AS day_of_week,
  COUNT(*)                       AS transactions,
  SUM(total_amount)              AS total_revenue,
  AVG(total_amount)              AS avg_transaction_value
FROM public.transactions
GROUP BY day_of_week, extract(dow from checkout_time)
ORDER BY extract(dow from checkout_time);

CREATE OR REPLACE VIEW public.location_distribution AS
SELECT
  store_id,
  COUNT(*)       AS transactions,
  SUM(total_amount) AS total_revenue,
  AVG(total_amount) AS avg_transaction_value
FROM public.transactions
GROUP BY store_id
ORDER BY total_revenue DESC;

CREATE OR REPLACE VIEW public.store_performance AS
SELECT
  s.id       AS store_id,
  s.name     AS store_name,
  COUNT(t.*) AS transactions,
  SUM(t.total_amount) AS total_revenue,
  AVG(t.total_amount) AS avg_transaction_value
FROM public.stores s
LEFT JOIN public.transactions t ON t.store_id = s.id
GROUP BY s.id, s.name
ORDER BY total_revenue DESC;

--------------------------------------------------------------------------------
-- 4. TRIGGER: Mark Weekend Transactions
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_is_weekend()
RETURNS trigger
LANGUAGE plpgsql AS $
BEGIN
  NEW.is_weekend := extract(dow from NEW.checkout_time) IN (0,6);
  RETURN NEW;
END;
$;

DROP TRIGGER IF EXISTS trg_set_is_weekend ON public.transactions;
CREATE TRIGGER trg_set_is_weekend
BEFORE INSERT OR UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.set_is_weekend();

--------------------------------------------------------------------------------
-- 5. ANALYTICS FUNCTIONS
--------------------------------------------------------------------------------

-- 5.1 Age Distribution
CREATE OR REPLACE FUNCTION public.get_age_distribution_simple(
  p_start_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE(age_group TEXT, count BIGINT, percentage NUMERIC)
LANGUAGE sql STABLE AS $
WITH agg AS (
  SELECT
    CASE
      WHEN customer_age < 20 THEN '<20'
      WHEN customer_age BETWEEN 20 AND 39 THEN '20-39'
      WHEN customer_age BETWEEN 40 AND 59 THEN '40-59'
      ELSE '60+' END
      AS age_group,
    COUNT(*) AS count
  FROM public.transactions
  WHERE checkout_time >= p_start_date
  GROUP BY 1
)
SELECT
  age_group,
  count,
  ROUND(count::NUMERIC / SUM(count) OVER() * 100, 2) AS percentage
FROM agg;
$;

-- 5.2 Gender Distribution
CREATE OR REPLACE FUNCTION public.get_gender_distribution_simple(
  p_start_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE(gender TEXT, count BIGINT, percentage NUMERIC)
LANGUAGE sql STABLE AS $
WITH agg AS (
  SELECT
    customer_gender AS gender,
    COUNT(*) AS count
  FROM public.transactions
  WHERE checkout_time >= p_start_date
  GROUP BY 1
)
SELECT
  gender,
  count,
  ROUND(count::NUMERIC / SUM(count) OVER() * 100, 2) AS percentage
FROM agg;
$;

-- 5.3 Consumer Profile (JSON)
CREATE OR REPLACE FUNCTION public.get_consumer_profile(
  p_start_date TIMESTAMPTZ DEFAULT now()
)
RETURNS JSONB
LANGUAGE sql STABLE AS $
SELECT jsonb_build_object(
  'total_transactions', COUNT(*),
  'total_revenue',        SUM(total_amount),
  'avg_transaction_value', AVG(total_amount),
  'gender_breakdown', (
    SELECT jsonb_agg(jsonb_build_object(
      'gender', gender,
      'count', count,
      'pct', ROUND(count::NUMERIC / SUM(count) OVER() * 100,2)
    ))
    FROM (
      SELECT customer_gender AS gender, COUNT(*) AS count
      FROM public.transactions
      WHERE checkout_time >= p_start_date
      GROUP BY 1
    ) sub
  ),
  'age_distribution', (
    SELECT jsonb_agg(jsonb_build_object(
      'age_group', age_group,
      'count', count,
      'pct', ROUND(count::NUMERIC / SUM(count) OVER() * 100,2)
    ))
    FROM (
      SELECT
        CASE
          WHEN customer_age<20 THEN '<20'
          WHEN customer_age BETWEEN 20 AND 39 THEN '20-39'
          WHEN customer_age BETWEEN 40 AND 59 THEN '40-59'
          ELSE '60+' END AS age_group,
        COUNT(*) AS count
      FROM public.transactions
      WHERE checkout_time >= p_start_date
      GROUP BY 1
    ) sub2
  )
);
$;

-- 5.4 Category Metrics (JSON)
CREATE OR REPLACE FUNCTION public.get_category_metrics(
  p_start_date TIMESTAMPTZ DEFAULT now()
)
RETURNS JSONB
LANGUAGE sql STABLE AS $
SELECT jsonb_agg(jsonb_build_object(
  'category', category,
  'transactions', tx_count,
  'revenue', revenue,
  'avg_value', avg_value
))
FROM (
  SELECT
    p.category,
    COUNT(DISTINCT t.id)     AS tx_count,
    SUM(ti.quantity*ti.price) AS revenue,
    AVG(ti.quantity*ti.price) AS avg_value
  FROM public.transaction_items ti
  JOIN public.transactions t ON ti.transaction_id = t.id
  JOIN public.products p ON ti.product_id = p.id
  WHERE t.checkout_time >= p_start_date
  GROUP BY p.category
) cat;
$;

-- 5.5 Brand Performance (JSON)
CREATE OR REPLACE FUNCTION public.get_brand_performance(
  p_start_date TIMESTAMPTZ DEFAULT now()
)
RETURNS JSONB
LANGUAGE sql STABLE AS $
SELECT jsonb_agg(jsonb_build_object(
  'brand', brand_name,
  'transactions', tx_count,
  'items_sold', items_sold,
  'revenue', revenue
))
FROM (
  SELECT
    b.name    AS brand_name,
    COUNT(DISTINCT t.id)  AS tx_count,
    SUM(ti.quantity)      AS items_sold,
    SUM(ti.quantity*ti.price) AS revenue
  FROM public.transaction_items ti
  JOIN public.transactions t ON ti.transaction_id = t.id
  JOIN public.products p ON ti.product_id = p.id
  JOIN public.brands b ON p.brand_id = b.id
  WHERE t.checkout_time >= p_start_date
  GROUP BY b.name
) br;
$;

-- 5.6 Bundle Analysis
CREATE OR REPLACE FUNCTION public.get_bundle_analysis(
  p_limit INT DEFAULT 5
)
RETURNS TABLE(product_1 TEXT, product_2 TEXT, frequency BIGINT)
LANGUAGE sql STABLE AS $
SELECT
  p1.name  AS product_1,
  p2.name  AS product_2,
  COUNT(*) AS frequency
FROM public.transaction_items ti1
JOIN public.transaction_items ti2
  ON ti1.transaction_id = ti2.transaction_id
  AND ti1.product_id < ti2.product_id
JOIN public.products p1 ON ti1.product_id = p1.id
JOIN public.products p2 ON ti2.product_id = p2.id
GROUP BY p1.name, p2.name
ORDER BY frequency DESC
LIMIT p_limit;
$;

-- 5.7 Filter Options (JSON)
CREATE OR REPLACE FUNCTION public.get_filter_options()
RETURNS JSONB
LANGUAGE sql STABLE AS $
SELECT jsonb_build_object(
  'categories', (SELECT array_agg(DISTINCT category) FROM public.products),
  'brands',     (SELECT array_agg(DISTINCT name)     FROM public.brands),
  'stores',     (SELECT array_agg(DISTINCT name)     FROM public.stores)
);
$;

-- 5.8 Daily Trends Function
CREATE OR REPLACE FUNCTION public.get_daily_trends(
  p_start_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE(day DATE, transactions BIGINT, revenue NUMERIC, avg_tx NUMERIC)
LANGUAGE sql STABLE AS $
SELECT
  day,
  total_transactions AS transactions,
  total_revenue      AS revenue,
  avg_transaction_value AS avg_tx
FROM public.mv_daily_metrics
WHERE day >= p_start_date::date
ORDER BY day;
$;

-- 5.9 Hourly Trends Function
CREATE OR REPLACE FUNCTION public.get_hourly_trends(
  p_start_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE(hour TIMESTAMPTZ, transactions BIGINT, revenue NUMERIC, avg_tx NUMERIC)
LANGUAGE sql STABLE AS $
SELECT
  date_trunc('hour', checkout_time) AS hour,
  COUNT(*)                          AS transactions,
  SUM(total_amount)                 AS revenue,
  AVG(total_amount)                 AS avg_tx
FROM public.transactions
WHERE checkout_time >= p_start_date
GROUP BY date_trunc('hour', checkout_time)
ORDER BY hour;
$;

-- 5.10 Day-of-Week Function
CREATE OR REPLACE FUNCTION public.get_day_of_week_performance(
  p_start_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE(day_of_week TEXT, transactions BIGINT, revenue NUMERIC, avg_tx NUMERIC)
LANGUAGE sql STABLE AS $
SELECT
  to_char(checkout_time,'FMDay') AS day_of_week,
  COUNT(*)                       AS transactions,
  SUM(total_amount)              AS revenue,
  AVG(total_amount)              AS avg_tx
FROM public.transactions
WHERE checkout_time >= p_start_date
GROUP BY day_of_week, extract(dow from checkout_time)
ORDER BY extract(dow from checkout_time);
$;

-- 5.11 Location Distribution Function
CREATE OR REPLACE FUNCTION public.get_location_distribution(
  p_start_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE(store_id INT, transactions BIGINT, revenue NUMERIC, avg_tx NUMERIC)
LANGUAGE sql STABLE AS $
SELECT
  store_id,
  COUNT(*)          AS transactions,
  SUM(total_amount) AS revenue,
  AVG(total_amount) AS avg_tx
FROM public.transactions
WHERE checkout_time >= p_start_date
GROUP BY store_id
ORDER BY revenue DESC;
$;

-- 5.12 Store Performance Function
CREATE OR REPLACE FUNCTION public.get_store_performance(
  p_start_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE(store_id INT, store_name TEXT, transactions BIGINT, revenue NUMERIC, avg_tx NUMERIC)
LANGUAGE sql STABLE AS $
SELECT
  s.id,
  s.name,
  COUNT(t.id)           AS transactions,
  SUM(t.total_amount)   AS revenue,
  AVG(t.total_amount)   AS avg_tx
FROM public.stores s
JOIN public.transactions t
  ON t.store_id = s.id
WHERE t.checkout_time >= p_start_date
GROUP BY s.id, s.name
ORDER BY revenue DESC;
$;

--------------------------------------------------------------------------------
COMMIT;