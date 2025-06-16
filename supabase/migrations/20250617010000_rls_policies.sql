-- RLS Policies for Project Scout

BEGIN;

-- Create custom roles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
        CREATE ROLE admin NOINHERIT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analyst') THEN
        CREATE ROLE analyst NOINHERIT;
    END IF;
END
$$;

-- Enable RLS for all public tables
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edge_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ───── BRANDS (public read-only) ─────
DROP POLICY IF EXISTS "Allow public read access to brands" ON public.brands;
CREATE POLICY "Allow public read access to brands" ON public.brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin and service_role full access on brands" ON public.brands;
CREATE POLICY "Allow admin and service_role full access on brands" ON public.brands
  FOR ALL USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- ───── PRODUCTS ─────
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on products" ON public.products;
CREATE POLICY "Allow analyst, admin, service_role read access on products" ON public.products
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

DROP POLICY IF EXISTS "Allow admin and service_role write access on products" ON public.products;
CREATE POLICY "Allow admin and service_role write access on products" ON public.products
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- ───── STORES ─────
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on stores" ON public.stores;
CREATE POLICY "Allow analyst, admin, service_role read access on stores" ON public.stores
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

DROP POLICY IF EXISTS "Allow admin and service_role write access on stores" ON public.stores;
CREATE POLICY "Allow admin and service_role write access on stores" ON public.stores
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- ───── CUSTOMERS (read-only for roles, ETL only write) ─────
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on customers" ON public.customers;
CREATE POLICY "Allow analyst, admin, service_role read access on customers" ON public.customers
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));
-- No INSERT, UPDATE, DELETE policies for authenticated/admin/analyst, implying ETL via service_role or backend only

-- ───── DEVICES ─────
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on devices" ON public.devices;
CREATE POLICY "Allow analyst, admin, service_role read access on devices" ON public.devices
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

DROP POLICY IF EXISTS "Allow admin and service_role write access on devices" ON public.devices;
CREATE POLICY "Allow admin and service_role write access on devices" ON public.devices
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- ───── TRANSACTIONS ─────
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on transactions" ON public.transactions;
CREATE POLICY "Allow analyst, admin, service_role read access on transactions" ON public.transactions
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

DROP POLICY IF EXISTS "Allow admin and service_role write access on transactions" ON public.transactions;
CREATE POLICY "Allow admin and service_role write access on transactions" ON public.transactions
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- ───── TRANSACTION_ITEMS ─────
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on transaction_items" ON public.transaction_items;
CREATE POLICY "Allow analyst, admin, service_role read access on transaction_items" ON public.transaction_items
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

DROP POLICY IF EXISTS "Allow admin and service_role write access on transaction_items" ON public.transaction_items;
CREATE POLICY "Allow admin and service_role write access on transaction_items" ON public.transaction_items
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- ───── CUSTOMER_REQUESTS ─────
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on customer_requests" ON public.customer_requests;
CREATE POLICY "Allow analyst, admin, service_role read access on customer_requests" ON public.customer_requests
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

DROP POLICY IF EXISTS "Allow admin and service_role write access on customer_requests" ON public.customer_requests;
CREATE POLICY "Allow admin and service_role write access on customer_requests" ON public.customer_requests
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- ───── DEVICE_HEALTH ─────
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on device_health" ON public.device_health;
CREATE POLICY "Allow analyst, admin, service_role read access on device_health" ON public.device_health
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

DROP POLICY IF EXISTS "Allow service_role write access on device_health" ON public.device_health;
CREATE POLICY "Allow service_role write access on device_health" ON public.device_health
  FOR INSERT, UPDATE, DELETE USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ───── EDGE_LOGS ─────
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on edge_logs" ON public.edge_logs;
CREATE POLICY "Allow analyst, admin, service_role read access on edge_logs" ON public.edge_logs
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

DROP POLICY IF EXISTS "Allow service_role write access on edge_logs" ON public.edge_logs;
CREATE POLICY "Allow service_role write access on edge_logs" ON public.edge_logs
  FOR INSERT, UPDATE, DELETE USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ───── PRODUCT_DETECTIONS ─────
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on product_detections" ON public.product_detections;
CREATE POLICY "Allow analyst, admin, service_role read access on product_detections" ON public.product_detections
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

DROP POLICY IF EXISTS "Allow service_role write access on product_detections" ON public.product_detections;
CREATE POLICY "Allow service_role write access on product_detections" ON public.product_detections
  FOR INSERT, UPDATE, DELETE USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ───── REQUEST_BEHAVIORS ─────
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on request_behaviors" ON public.request_behaviors;
CREATE POLICY "Allow analyst, admin, service_role read access on request_behaviors" ON public.request_behaviors
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

DROP POLICY IF EXISTS "Allow admin and service_role write access on request_behaviors" ON public.request_behaviors;
CREATE POLICY "Allow admin and service_role write access on request_behaviors" ON public.request_behaviors
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- ───── SUBSTITUTIONS ─────
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on substitutions" ON public.substitutions;
CREATE POLICY "Allow analyst, admin, service_role read access on substitutions" ON public.substitutions
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

DROP POLICY IF EXISTS "Allow admin and service_role write access on substitutions" ON public.substitutions;
CREATE POLICY "Allow admin and service_role write access on substitutions" ON public.substitutions
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));


-- ───── VIEWS (read-only for analyst, admin, service_role) ─────
DROP POLICY IF EXISTS "Allow analytics roles read on daily_sales" ON public.daily_sales;
CREATE POLICY "Allow analytics roles read on daily_sales" ON public.daily_sales
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

DROP POLICY IF EXISTS "Allow analytics roles read on product_performance" ON public.product_performance;
CREATE POLICY "Allow analytics roles read on product_performance" ON public.product_performance
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

COMMIT; 