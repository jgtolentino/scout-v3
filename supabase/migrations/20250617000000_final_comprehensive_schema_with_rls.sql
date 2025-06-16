-- Final Comprehensive FMCG Market Schema with RLS Policies (TBWA Client Identifiers)

BEGIN;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables and sequences to ensure a clean reset
-- Order of drops matters due to foreign key constraints
DROP TABLE IF EXISTS public.transaction_items CASCADE;
DROP TABLE IF EXISTS public.substitutions CASCADE;
DROP TABLE IF EXISTS public.request_behaviors CASCADE;
DROP TABLE IF EXISTS public.customer_requests CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.product_detections CASCADE;
DROP TABLE IF EXISTS public.edge_logs CASCADE;
DROP TABLE IF EXISTS public.device_health CASCADE;
DROP TABLE IF EXISTS public.devices CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.stores CASCADE;


DROP SEQUENCE IF EXISTS brands_id_seq CASCADE;
DROP SEQUENCE IF EXISTS customer_requests_id_seq CASCADE;
DROP SEQUENCE IF EXISTS customers_id_seq CASCADE;
DROP SEQUENCE IF EXISTS products_id_seq CASCADE;
DROP SEQUENCE IF EXISTS request_behaviors_id_seq CASCADE;
DROP SEQUENCE IF EXISTS stores_id_seq CASCADE;
DROP SEQUENCE IF EXISTS substitutions_id_seq CASCADE;
DROP SEQUENCE IF EXISTS transaction_items_id_seq CASCADE;
DROP SEQUENCE IF EXISTS transactions_id_seq CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS public.daily_sales CASCADE;
DROP VIEW IF EXISTS public.product_performance CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_age_distribution_simple(filters jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.get_gender_distribution_simple(filters jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.get_top_products(filters jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.get_income_distribution(filters jsonb) CASCADE;


-- Sequences for integer primary keys
CREATE SEQUENCE brands_id_seq;
CREATE SEQUENCE customer_requests_id_seq;
CREATE SEQUENCE customers_id_seq;
CREATE SEQUENCE products_id_seq;
CREATE SEQUENCE request_behaviors_id_seq;
CREATE SEQUENCE stores_id_seq;
CREATE SEQUENCE substitutions_id_seq;
CREATE SEQUENCE transaction_items_id_seq;
CREATE SEQUENCE transactions_id_seq;

-- Table: public.brands
CREATE TABLE public.brands (
  id integer NOT NULL DEFAULT nextval('brands_id_seq'::regclass),
  name character varying NOT NULL,
  company TEXT NOT NULL,
  category character varying,
  is_tbwa boolean DEFAULT false,
  market_share DECIMAL(5,2),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT brands_pkey PRIMARY KEY (id)
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Table: public.stores
CREATE TABLE public.stores (
  id integer NOT NULL DEFAULT nextval('stores_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  location text,
  barangay text,
  city text,
  region text,
  latitude numeric,
  longitude numeric,
  store_type TEXT,
  size_category TEXT,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stores_pkey PRIMARY KEY (id)
);
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Table: public.customers
CREATE TABLE public.customers (
  id integer NOT NULL DEFAULT nextval('customers_id_seq'::regclass),
  customer_id text NOT NULL UNIQUE,
  name text NOT NULL,
  age integer,
  gender text CHECK (gender = ANY (ARRAY['Male'::text, 'Female'::text, 'Other'::text])),
  region text NOT NULL,
  city text,
  barangay text,
  loyalty_tier text DEFAULT 'regular'::text,
  total_spent numeric DEFAULT 0,
  visit_count integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Table: public.products
CREATE TABLE public.products (
  id integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
  name character varying NOT NULL,
  brand_id integer,
  created_at timestamp with time zone DEFAULT now(),
  category character varying,
  subcategory TEXT,
  unit_cost DECIMAL(10,2),
  retail_price DECIMAL(10,2),
  size TEXT,
  unit TEXT,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Table: public.devices
CREATE TABLE public.devices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  device_id text NOT NULL UNIQUE,
  device_type text NOT NULL DEFAULT 'RaspberryPi5'::text,
  firmware_version text NOT NULL DEFAULT '1.0.0'::text,
  store_id integer, -- Changed to integer to reference stores(id)
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'maintenance'::text])),
  registration_time timestamp with time zone DEFAULT now(),
  last_seen timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  location text,
  network_info jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT devices_pkey PRIMARY KEY (id),
  CONSTRAINT devices_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) -- Added FK
);
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Table: public.transactions
CREATE TABLE public.transactions (
  id integer NOT NULL DEFAULT nextval('transactions_id_seq'::regclass),
  created_at timestamp with time zone DEFAULT now(),
  transaction_date TIMESTAMPTZ NOT NULL,
  total_amount numeric DEFAULT 0,
  customer_age integer,
  customer_gender character varying,
  customer_id text, -- References customers(customer_id)
  store_id integer, -- References stores(id)
  checkout_seconds integer,
  is_weekend boolean,
  nlp_processed boolean DEFAULT false,
  nlp_processed_at timestamp with time zone,
  nlp_confidence_score numeric,
  device_id text, -- References devices(device_id)
  payment_method character varying DEFAULT 'cash'::character varying,
  checkout_time timestamp with time zone DEFAULT now(),
  request_type character varying DEFAULT 'branded'::character varying,
  transcription_text text,
  suggestion_accepted boolean DEFAULT false,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id),
  CONSTRAINT transactions_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(device_id)
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Table: public.transaction_items
CREATE TABLE public.transaction_items (
  id integer NOT NULL DEFAULT nextval('transaction_items_id_seq'::regclass),
  transaction_id integer,
  product_id integer,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transaction_items_pkey PRIMARY KEY (id),
  CONSTRAINT transaction_items_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT transaction_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Table: public.customer_requests
CREATE TABLE public.customer_requests (
  id integer NOT NULL DEFAULT nextval('customer_requests_id_seq'::regclass),
  transaction_id integer,
  request_type character varying,
  request_mode character varying,
  accepted_suggestion boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customer_requests_pkey PRIMARY KEY (id),
  CONSTRAINT customer_requests_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id)
);
ALTER TABLE public.customer_requests ENABLE ROW LEVEL SECURITY;

-- Table: public.device_health
CREATE TABLE public.device_health (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  cpu_usage numeric,
  memory_usage numeric,
  disk_usage numeric,
  temperature numeric,
  uptime_seconds bigint,
  network_connected boolean DEFAULT true,
  battery_level numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT device_health_pkey PRIMARY KEY (id),
  CONSTRAINT device_health_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(device_id)
);
ALTER TABLE public.device_health ENABLE ROW LEVEL SECURITY;

-- Table: public.edge_logs
CREATE TABLE public.edge_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  log_level text NOT NULL DEFAULT 'INFO'::text CHECK (log_level = ANY (ARRAY['DEBUG'::text, 'INFO'::text, 'WARN'::text, 'ERROR'::text, 'FATAL'::text])),
  message text NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  component text,
  error_code text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT edge_logs_pkey PRIMARY KEY (id),
  CONSTRAINT edge_logs_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(device_id)
);
ALTER TABLE public.edge_logs ENABLE ROW LEVEL SECURITY;

-- Table: public.product_detections
CREATE TABLE public.product_detections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  store_id integer, -- References stores(id)
  detected_at timestamp with time zone DEFAULT now(),
  brand_detected text NOT NULL,
  confidence_score numeric CHECK (confidence_score >= 0::numeric AND confidence_score <= 1::numeric),
  customer_age integer,
  customer_gender text CHECK (customer_gender = ANY (ARRAY['Male'::text, 'Female'::text, 'Other'::text])),
  image_path text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_detections_pkey PRIMARY KEY (id),
  CONSTRAINT product_detections_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(device_id),
  CONSTRAINT product_detections_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
ALTER TABLE public.product_detections ENABLE ROW LEVEL SECURITY;

-- Table: public.request_behaviors
CREATE TABLE public.request_behaviors (
  id integer NOT NULL DEFAULT nextval('request_behaviors_id_seq'::regclass),
  transaction_id integer,
  transaction_item_id integer,
  request_type character varying CHECK (request_type::text = ANY (ARRAY['branded'::character varying, 'unbranded'::character varying, 'unsure'::character varying]::text[])),
  request_method character varying CHECK (request_method::text = ANY (ARRAY['verbal'::character varying, 'pointing'::character varying, 'indirect'::character varying]::text[])),
  suggestion_offered boolean DEFAULT false,
  suggestion_accepted boolean DEFAULT false,
  extracted_phrase text,
  nlp_confidence numeric,
  nlp_model_version character varying,
  processing_timestamp timestamp with time zone DEFAULT now(),
  raw_nlp_output jsonb,
  extracted_entities jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT request_behaviors_pkey PRIMARY KEY (id),
  CONSTRAINT request_behaviors_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT request_behaviors_transaction_item_id_fkey FOREIGN KEY (transaction_item_id) REFERENCES public.transaction_items(id)
);
ALTER TABLE public.request_behaviors ENABLE ROW LEVEL SECURITY;

-- Table: public.substitutions
CREATE TABLE public.substitutions (
  id integer NOT NULL DEFAULT nextval('substitutions_id_seq'::regclass),
  original_product_id integer,
  substitute_product_id integer,
  transaction_id integer,
  reason text CHECK (reason = ANY (ARRAY['Out of stock'::text, 'Price preference'::text, 'Taste preference'::text, 'Brand loyalty'::text, 'Promotion'::text])),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT substitutions_pkey PRIMARY KEY (id),
  CONSTRAINT substitutions_original_product_id_fkey FOREIGN KEY (original_product_id) REFERENCES public.products(id),
  CONSTRAINT substitutions_substitute_product_id_fkey FOREIGN KEY (substitute_product_id) REFERENCES public.products(id),
  CONSTRAINT substitutions_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id)
);
ALTER TABLE public.substitutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Brands table policies
DROP POLICY IF EXISTS "Allow public read access to brands" ON public.brands;
CREATE POLICY "Allow public read access to brands" ON public.brands FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin and service_role full access on brands" ON public.brands;
CREATE POLICY "Allow admin and service_role full access on brands" ON public.brands
  FOR ALL USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- Products policies
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on products" ON public.products;
CREATE POLICY "Allow analyst, admin, service_role read access on products" ON public.products
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));
DROP POLICY IF EXISTS "Allow admin and service_role write access on products" ON public.products;
CREATE POLICY "Allow admin and service_role write access on products" ON public.products
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- Stores policies
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on stores" ON public.stores;
CREATE POLICY "Allow analyst, admin, service_role read access on stores" ON public.stores
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));
DROP POLICY IF EXISTS "Allow admin and service_role write access on stores" ON public.stores;
CREATE POLICY "Allow admin and service_role write access on stores" ON public.stores
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- Customers policies (read-only for roles, ETL only write for service_role)
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on customers" ON public.customers;
CREATE POLICY "Allow analyst, admin, service_role read access on customers" ON public.customers
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));
-- No INSERT, UPDATE, DELETE policies for authenticated/admin/analyst, implying ETL via service_role or backend only

-- Devices policies
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on devices" ON public.devices;
CREATE POLICY "Allow analyst, admin, service_role read access on devices" ON public.devices
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));
DROP POLICY IF EXISTS "Allow admin and service_role write access on devices" ON public.devices;
CREATE POLICY "Allow admin and service_role write access on devices" ON public.devices
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- Transactions policies
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on transactions" ON public.transactions;
CREATE POLICY "Allow analyst, admin, service_role read access on transactions" ON public.transactions
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));
DROP POLICY IF EXISTS "Allow admin and service_role write access on transactions" ON public.transactions;
CREATE POLICY "Allow admin and service_role write access on transactions" ON public.transactions
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- Transaction_items policies
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on transaction_items" ON public.transaction_items;
CREATE POLICY "Allow analyst, admin, service_role read access on transaction_items" ON public.transaction_items
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));
DROP POLICY IF EXISTS "Allow admin and service_role write access on transaction_items" ON public.transaction_items;
CREATE POLICY "Allow admin and service_role write access on transaction_items" ON public.transaction_items
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- Customer_requests policies
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on customer_requests" ON public.customer_requests;
CREATE POLICY "Allow analyst, admin, service_role read access on customer_requests" ON public.customer_requests
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));
DROP POLICY IF EXISTS "Allow admin and service_role write access on customer_requests" ON public.customer_requests;
CREATE POLICY "Allow admin and service_role write access on customer_requests" ON public.customer_requests
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- Device_health policies (write only by service_role, read by others)
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on device_health" ON public.device_health;
CREATE POLICY "Allow analyst, admin, service_role read access on device_health" ON public.device_health
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));
DROP POLICY IF EXISTS "Allow service_role write access on device_health" ON public.device_health;
CREATE POLICY "Allow service_role write access on device_health" ON public.device_health
  FOR INSERT, UPDATE, DELETE USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Edge_logs policies (write only by service_role, read by others)
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on edge_logs" ON public.edge_logs;
CREATE POLICY "Allow analyst, admin, service_role read access on edge_logs" ON public.edge_logs
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));
DROP POLICY IF EXISTS "Allow service_role write access on edge_logs" ON public.edge_logs;
CREATE POLICY "Allow service_role write access on edge_logs" ON public.edge_logs
  FOR INSERT, UPDATE, DELETE USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Product_detections policies (write only by service_role, read by others)
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on product_detections" ON public.product_detections;
CREATE POLICY "Allow analyst, admin, service_role read access on product_detections" ON public.product_detections
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));
DROP POLICY IF EXISTS "Allow service_role write access on product_detections" ON public.product_detections;
CREATE POLICY "Allow service_role write access on product_detections" ON public.product_detections
  FOR INSERT, UPDATE, DELETE USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Request_behaviors policies
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on request_behaviors" ON public.request_behaviors;
CREATE POLICY "Allow analyst, admin, service_role read access on request_behaviors" ON public.request_behaviors
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));
DROP POLICY IF EXISTS "Allow admin and service_role write access on request_behaviors" ON public.request_behaviors;
CREATE POLICY "Allow admin and service_role write access on request_behaviors" ON public.request_behaviors
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- Substitutions policies
DROP POLICY IF EXISTS "Allow analyst, admin, service_role read access on substitutions" ON public.substitutions;
CREATE POLICY "Allow analyst, admin, service_role read access on substitutions" ON public.substitutions
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));
DROP POLICY IF EXISTS "Allow admin and service_role write access on substitutions" ON public.substitutions;
CREATE POLICY "Allow admin and service_role write access on substitutions" ON public.substitutions
  FOR INSERT, UPDATE, DELETE USING (auth.role() IN ('admin', 'service_role'))
  WITH CHECK (auth.role() IN ('admin', 'service_role'));

-- Views policies (read-only for analyst, admin, service_role)
DROP POLICY IF EXISTS "Allow analytics roles read on daily_sales" ON public.daily_sales;
CREATE POLICY "Allow analytics roles read on daily_sales" ON public.daily_sales
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

DROP POLICY IF EXISTS "Allow analytics roles read on product_performance" ON public.product_performance;
CREATE POLICY "Allow analytics roles read on product_performance" ON public.product_performance
  FOR SELECT USING (auth.role() IN ('analyst', 'admin', 'service_role'));

-- Insert Major Brands with TBWA Client Identifiers
INSERT INTO public.brands (name, company, category, is_tbwa, market_share) VALUES
-- Alaska Milk Corporation (TBWA Client ID: ALK)
('Alaska Milk Corporation', 'Alaska Milk Corporation', 'Dairy', TRUE, 25.5),
('Krem-Top', 'Alaska Milk Corporation', 'Dairy', TRUE, 15.2),
('Alpine', 'Alaska Milk Corporation', 'Dairy', TRUE, 12.8),
('Cow Bell', 'Alaska Milk Corporation', 'Dairy', TRUE, 8.5),

-- Oishi (Liwayway Marketing) (TBWA Client ID: OSH)
('Oishi', 'Liwayway Marketing Corporation', 'Snacks', TRUE, 30.2),
('Smart C+', 'Liwayway Marketing Corporation', 'Beverages', TRUE, 18.5),
('Gourmet Picks', 'Liwayway Marketing Corporation', 'Snacks', TRUE, 12.3),
('Deli Mex', 'Liwayway Marketing Corporation', 'Snacks', TRUE, 9.8),

-- Peerless Products (TBWA Client ID: PPL)
('Champion', 'Peerless Products Manufacturing Corporation', 'Household', TRUE, 22.5),
('Calla', 'Peerless Products Manufacturing Corporation', 'Personal Care', TRUE, 18.7),
('Hana', 'Peerless Products Manufacturing Corporation', 'Personal Care', TRUE, 15.3),
('Cyclone', 'Peerless Products Manufacturing Corporation', 'Household', TRUE, 12.8),
('Pride', 'Peerless Products Manufacturing Corporation', 'Household', TRUE, 10.2),
('Care Plus', 'Peerless Products Manufacturing Corporation', 'Personal Care', TRUE, 8.5),

-- Del Monte Philippines (TBWA Client ID: DMP)
('Del Monte', 'Del Monte Philippines', 'Food & Beverages', TRUE, 28.5),
('S&W', 'Del Monte Philippines', 'Food & Beverages', TRUE, 15.7),
('Today''s', 'Del Monte Philippines', 'Food & Beverages', TRUE, 12.3),
('Fit ''n Right', 'Del Monte Philippines', 'Beverages', TRUE, 9.8),

-- Japan Tobacco International (TBWA Client ID: JTI)
('Winston', 'Japan Tobacco International', 'Tobacco', TRUE, 20.5),
('Camel', 'Japan Tobacco International', 'Tobacco', TRUE, 18.2),
('Mevius', 'Japan Tobacco International', 'Tobacco', TRUE, 15.8),
('LD', 'Japan Tobacco International', 'Tobacco', TRUE, 12.5),
('Mighty', 'Japan Tobacco International', 'Tobacco', TRUE, 10.2),
('Caster', 'Japan Tobacco International', 'Tobacco', TRUE, 8.7),
('Glamour', 'Japan Tobacco International', 'Tobacco', TRUE, 7.5);


-- Insert Products for Each Brand with TBWA Product Codes
INSERT INTO public.products (brand_id, name, category, subcategory, unit_cost, retail_price, size, unit)
SELECT
    b.id,
    CASE b.name
        WHEN 'Alaska Milk Corporation' THEN 'ALK-' || LPAD((ROW_NUMBER() OVER (PARTITION BY b.name))::text, 3, '0') || ' ' || p.name
        WHEN 'Oishi' THEN 'OSH-' || LPAD((ROW_NUMBER() OVER (PARTITION BY b.name))::text, 3, '0') || ' ' || p.name
        WHEN 'Peerless Products Manufacturing Corporation' THEN 'PPL-' || LPAD((ROW_NUMBER() OVER (PARTITION BY b.name))::text, 3, '0') || ' ' || p.name
        WHEN 'Del Monte Philippines' THEN 'DMP-' || LPAD((ROW_NUMBER() OVER (PARTITION BY b.name))::text, 3, '0') || ' ' || p.name
        WHEN 'Japan Tobacco International' THEN 'JTI-' || LPAD((ROW_NUMBER() OVER (PARTITION BY b.name))::text, 3, '0') || ' ' || p.name
        ELSE 'GEN-' || LPAD((ROW_NUMBER() OVER (PARTITION BY b.name))::text, 3, '0') || ' ' || p.name
    END,
    p.category,
    p.subcategory,
    p.unit_cost,
    p.retail_price,
    p.size,
    p.unit
FROM public.brands b
CROSS JOIN (VALUES
    -- Alaska Milk Corporation Products
    ('Evaporated Milk', 'Dairy', 'Milk', 25.50, 32.00, '370ml', 'can', 'Alaska Milk Corporation'),
    ('Condensed Milk', 'Dairy', 'Milk', 28.75, 36.00, '300ml', 'can', 'Alaska Milk Corporation'),
    ('Powdered Milk', 'Dairy', 'Milk', 120.00, 150.00, '1kg', 'pack', 'Alaska Milk Corporation'),
    ('Coffee Creamer', 'Dairy', 'Creamer', 35.00, 45.00, '250ml', 'pack', 'Krem-Top'),
    ('Evaporated Milk', 'Dairy', 'Milk', 24.50, 31.00, '370ml', 'can', 'Alpine'),
    ('Powdered Milk', 'Dairy', 'Milk', 115.00, 145.00, '1kg', 'pack', 'Cow Bell'),

    -- Oishi Products
    ('Prawn Crackers', 'Snacks', 'Crackers', 15.00, 20.00, '100g', 'pack', 'Oishi'),
    ('Pillows', 'Snacks', 'Crackers', 12.00, 16.00, '80g', 'pack', 'Oishi'),
    ('Marty''s', 'Snacks', 'Crackers', 14.00, 18.00, '90g', 'pack', 'Oishi'),
    ('Ridges', 'Snacks', 'Chips', 16.00, 22.00, '75g', 'pack', 'Oishi'),
    ('Bread Pan', 'Snacks', 'Bread', 18.00, 25.00, '120g', 'pack', 'Oishi'),
    ('Gourmet Picks', 'Snacks', 'Nuts', 45.00, 60.00, '150g', 'pack', 'Gourmet Picks'),
    ('Crispy Patata', 'Snacks', 'Chips', 13.00, 17.00, '60g', 'pack', 'Oishi'),
    ('Vitamin Drinks', 'Beverages', 'Juice', 18.00, 25.00, '250ml', 'bottle', 'Smart C+'),
    ('Oaties', 'Breakfast', 'Cereal', 70.00, 95.00, '500g', 'box', 'Oishi'),
    ('Hi-Ho', 'Snacks', 'Crackers', 11.00, 15.00, '70g', 'pack', 'Oishi'),
    ('Rinbee', 'Snacks', 'Puffs', 10.00, 14.00, '50g', 'pack', 'Oishi'),
    ('Deli Mex', 'Snacks', 'Chips', 20.00, 28.00, '120g', 'pack', 'Deli Mex'),

    -- Peerless Products
    ('Detergent Powder', 'Household', 'Laundry', 85.00, 110.00, '1kg', 'pack', 'Champion'),
    ('Fabric Conditioner', 'Household', 'Laundry', 75.00, 95.00, '1L', 'bottle', 'Champion'),
    ('Personal Care Soap', 'Personal Care', 'Soap', 25.00, 35.00, '100g', 'bar', 'Calla'),
    ('Shampoo', 'Personal Care', 'Hair Care', 65.00, 85.00, '200ml', 'bottle', 'Hana'),
    ('Conditioner', 'Personal Care', 'Hair Care', 70.00, 90.00, '200ml', 'bottle', 'Hana'),
    ('Bleach', 'Household', 'Cleaning', 45.00, 60.00, '500ml', 'bottle', 'Cyclone'),
    ('Dishwashing Liquid', 'Household', 'Cleaning', 55.00, 75.00, '500ml', 'bottle', 'Pride'),
    ('Alcohol', 'Personal Care', 'Sanitizer', 40.00, 55.00, '100ml', 'bottle', 'Care Plus'),
    ('Hand Sanitizer', 'Personal Care', 'Sanitizer', 40.00, 55.00, '100ml', 'bottle', 'Care Plus'),

    -- Del Monte Products
    ('Pineapple Juice', 'Beverages', 'Juice', 35.00, 45.00, '240ml', 'can', 'Del Monte'),
    ('Pineapple Chunks', 'Food & Beverages', 'Canned Fruits', 30.00, 40.00, '227g', 'can', 'Del Monte'),
    ('Pineapple Slices', 'Food & Beverages', 'Canned Fruits', 32.00, 42.00, '227g', 'can', 'Del Monte'),
    ('Tomato Sauce', 'Food & Beverages', 'Sauces', 25.00, 35.00, '250g', 'can', 'Del Monte'),
    ('Ketchup', 'Food & Beverages', 'Condiments', 28.00, 38.00, '320g', 'bottle', 'Del Monte'),
    ('Spaghetti Sauce', 'Food & Beverages', 'Sauces', 20.00, 30.00, '250g', 'pack', 'Del Monte'),
    ('Fruit Cocktail', 'Food & Beverages', 'Canned Fruits', 45.00, 60.00, '432g', 'can', 'S&W'),
    ('Premium Fruit', 'Food & Beverages', 'Canned Fruits', 55.00, 75.00, '400g', 'can', 'S&W'),
    ('Vegetable Products', 'Food & Beverages', 'Canned Vegetables', 40.00, 55.00, '400g', 'can', 'S&W'),
    ('Budget Spaghetti Sauce', 'Food & Beverages', 'Sauces', 18.00, 28.00, '250g', 'pack', 'Today''s'),
    ('Juice Drinks', 'Beverages', 'Juice', 30.00, 40.00, '240ml', 'bottle', 'Fit ''n Right'),

    -- JTI Products
    ('Red', 'Tobacco', 'Cigarettes', 45.00, 60.00, '20s', 'pack', 'Winston'),
    ('Camel Blue', 'Tobacco', 'Cigarettes', 50.00, 65.00, '20s', 'pack', 'Camel'),
    ('Mevius (Mild Seven)', 'Tobacco', 'Cigarettes', 48.00, 63.00, '20s', 'pack', 'Mevius'),
    ('LD Red', 'Tobacco', 'Cigarettes', 42.00, 58.00, '20s', 'pack', 'LD'),
    ('Mighty Red', 'Tobacco', 'Cigarettes', 40.00, 55.00, '20s', 'pack', 'Mighty'),
    ('Caster Blue', 'Tobacco', 'Cigarettes', 38.00, 52.00, '20s', 'pack', 'Caster'),
    ('Glamour Blue', 'Tobacco', 'Cigarettes', 52.00, 68.00, '20s', 'pack', 'Glamour')
) AS p(name, category, subcategory, unit_cost, retail_price, size, unit, brand_name)
WHERE b.name = p.brand_name;


-- Insert 17 Regions (Barangays)
INSERT INTO public.stores (name, location, barangay, city, region, latitude, longitude, store_type, size_category)
SELECT
    'Store ' || i,
    'Location for Store ' || i,
    'Barangay ' || i,
    'Manila',
    'National Capital Region',
    3.0 + random() * 1,
    101.0 + random() * 1,
    CASE
        WHEN i % 3 = 0 THEN 'Supermarket'
        WHEN i % 3 = 1 THEN 'Convenience Store'
        ELSE 'Sari-sari Store'
    END,
    CASE
        WHEN i % 3 = 0 THEN 'Large'
        WHEN i % 3 = 1 THEN 'Medium'
        ELSE 'Small'
    END
FROM generate_series(1, 17) i;

-- Generate Customers
INSERT INTO public.customers (customer_id, name, age, gender, region, city, barangay, loyalty_tier, total_spent, visit_count)
SELECT
    'CUST-' || LPAD((ROW_NUMBER() OVER ())::text, 5, '0'),
    'Customer ' || LPAD((ROW_NUMBER() OVER ())::text, 5, '0'),
    (random() * 60 + 18)::integer as age,
    CASE
        WHEN random() < 0.48 THEN 'Male'
        ELSE 'Female'
    END as gender,
    'National Capital Region',
    'Manila',
    s.barangay, -- Assign customer to an existing store's barangay
    CASE
        WHEN random() < 0.1 THEN 'Gold'
        WHEN random() < 0.3 THEN 'Silver'
        ELSE 'Regular'
    END,
    (random() * 5000 + 50)::numeric, -- Random total_spent
    (random() * 50 + 1)::integer -- Random visit_count
FROM generate_series(1, 5000) AS _(rn)
JOIN public.stores s ON s.id = (SELECT id FROM public.stores ORDER BY random() LIMIT 1);


-- Generate Devices for Stores
INSERT INTO public.devices (device_id, device_type, firmware_version, store_id, status, location, network_info)
SELECT
    'DEV-' || LPAD(s.id::text, 3, '0'),
    'RaspberryPi5',
    '1.0.0',
    s.id, -- Use integer store_id
    'active',
    s.location,
    jsonb_build_object('ip_address', '192.168.1.' || (s.id + 10)::text, 'signal_strength', (random() * 100)::integer)
FROM public.stores s;

-- Generate Transactions (5000+)
INSERT INTO public.transactions (transaction_date, total_amount, customer_age, customer_gender, customer_id, store_id, checkout_seconds, is_weekend, device_id, payment_method, checkout_time, request_type, transcription_text, suggestion_accepted)
SELECT
    NOW() - (random() * interval '1 year') as transaction_date,
    (random() * 1000 + 50)::numeric as total_amount,
    c.age,
    c.gender,
    c.customer_id,
    s.id as store_id,
    (random() * 120 + 10)::integer as checkout_seconds,
    (CASE WHEN EXTRACT(DOW FROM NOW() - (random() * interval '1 year')) IN (0,6) THEN TRUE ELSE FALSE END) as is_weekend,
    d.device_id,
    CASE
        WHEN random() < 0.7 THEN 'cash'
        WHEN random() < 0.9 THEN 'card'
        ELSE 'mobile_payment'
    END as payment_method,
    NOW() - (random() * interval '1 year') + (random() * interval '1 hour') as checkout_time,
    CASE
        WHEN random() < 0.7 THEN 'branded'
        WHEN random() < 0.9 THEN 'unbranded'
        ELSE 'unsure'
    END as request_type,
    'Sample transcription text for ' || LPAD((ROW_NUMBER() OVER ())::text, 5, '0'),
    (random() < 0.5) as suggestion_accepted
FROM generate_series(1, 5000) AS _(rn)
JOIN public.customers c ON c.id = (SELECT id FROM public.customers ORDER BY random() LIMIT 1)
JOIN public.stores s ON s.id = (SELECT id FROM public.stores ORDER BY random() LIMIT 1)
JOIN public.devices d ON d.store_id = s.id; -- Link device to store using store ID


-- Generate Transaction Items (multiple per transaction)
INSERT INTO public.transaction_items (transaction_id, product_id, quantity, unit_price, total_price)
SELECT
    t.id as transaction_id,
    p.id as product_id,
    (random() * 5 + 1)::integer as quantity,
    p.retail_price as unit_price,
    (random() * 5 + 1)::integer * p.retail_price as total_price
FROM public.transactions t
CROSS JOIN LATERAL (
    SELECT id, retail_price
    FROM public.products
    ORDER BY random()
    LIMIT (random() * 3 + 1)::integer -- 1 to 4 items per transaction
) p;

-- Generate Product Detections (simplified)
INSERT INTO public.product_detections (device_id, store_id, brand_detected, confidence_score, customer_age, customer_gender, image_path)
SELECT
    d.device_id,
    s.id,
    b.name,
    (random() * 0.2 + 0.8)::numeric(3,2), -- 80-100% confidence
    (random() * 60 + 18)::integer,
    CASE WHEN random() < 0.5 THEN 'Male' ELSE 'Female' END,
    'path/to/image/' || uuid_generate_v4() || '.jpg'
FROM public.devices d
JOIN public.stores s ON d.store_id = s.id
JOIN public.brands b ON b.id = (SELECT id FROM public.brands ORDER BY random() LIMIT 1)
LIMIT 10000; -- Generate 10k detections

-- Generate Customer Requests
INSERT INTO public.customer_requests (transaction_id, request_type, request_mode, accepted_suggestion)
SELECT
    t.id,
    t.request_type,
    CASE
        WHEN random() < 0.6 THEN 'verbal'
        WHEN random() < 0.9 THEN 'pointing'
        ELSE 'indirect'
    END,
    t.suggestion_accepted
FROM public.transactions t
LIMIT 5000;

-- Generate Request Behaviors
INSERT INTO public.request_behaviors (transaction_id, transaction_item_id, request_type, request_method, suggestion_offered, suggestion_accepted, extracted_phrase, nlp_confidence, nlp_model_version, raw_nlp_output, extracted_entities)
SELECT
    cr.transaction_id,
    ti.id,
    cr.request_type,
    cr.request_mode,
    (random() < 0.7) as suggestion_offered,
    cr.accepted_suggestion,
    'Phrase for ' || cr.request_type,
    random() as nlp_confidence,
    'v1.0',
    jsonb_build_object('intent', 'buy', 'product', 'random'),
    jsonb_build_object('brand', 'random', 'quantity', 1)
FROM public.customer_requests cr
JOIN public.transaction_items ti ON cr.transaction_id = ti.transaction_id
LIMIT 5000; -- Limit to 5k for reasonable size

-- Generate Substitutions (example)
INSERT INTO public.substitutions (original_product_id, substitute_product_id, transaction_id, reason)
SELECT
    p1.id,
    p2.id,
    t.id,
    CASE (random() * 4)::int
        WHEN 0 THEN 'Out of stock'
        WHEN 1 THEN 'Price preference'
        WHEN 2 THEN 'Taste preference'
        WHEN 3 THEN 'Brand loyalty'
        ELSE 'Promotion'
    END
FROM public.products p1, public.products p2, public.transactions t
WHERE p1.id != p2.id AND random() < 0.1 -- ~10% of transactions have a substitution
LIMIT 1000;

-- Generate Device Health Logs (simplified)
INSERT INTO public.device_health (device_id, cpu_usage, memory_usage, disk_usage, temperature, uptime_seconds, network_connected, battery_level)
SELECT
    d.device_id,
    (random() * 100)::numeric(5,2),
    (random() * 100)::numeric(5,2),
    (random() * 100)::numeric(5,2),
    (random() * 40 + 20)::numeric(5,2),
    (random() * 86400 * 30)::bigint, -- Up to 30 days
    (random() < 0.95),
    (random() * 100)::numeric(5,2)
FROM public.devices d
LIMIT 10000; -- Generate 10k health logs

-- Generate Edge Logs (simplified)
INSERT INTO public.edge_logs (device_id, log_level, message, component, error_code)
SELECT
    d.device_id,
    CASE (random() * 4)::int
        WHEN 0 THEN 'INFO'
        WHEN 1 THEN 'WARN'
        WHEN 2 THEN 'ERROR'
        WHEN 3 THEN 'FATAL'
        ELSE 'DEBUG'
    END,
    'Log message from ' || d.device_id || ' at ' || NOW(),
    CASE (random() * 3)::int
        WHEN 0 THEN 'Sensor';
        WHEN 1 THEN 'Network';
        ELSE 'AI-Module';
    END,
    CASE WHEN random() < 0.1 THEN 'ERR-' || (random() * 999)::integer ELSE NULL END
FROM public.devices d
LIMIT 20000; -- Generate 20k edge logs


-- Create Analytics Views (updated for new schema)
CREATE OR REPLACE VIEW public.daily_sales AS
SELECT
    DATE(t.transaction_date) as date,
    COUNT(DISTINCT t.id) as transaction_count,
    SUM(ti.total_price) as total_revenue,
    AVG(ti.total_price) as avg_transaction_value
FROM public.transactions t
JOIN public.transaction_items ti ON t.id = ti.transaction_id
GROUP BY DATE(t.transaction_date)
ORDER BY date;

CREATE OR REPLACE VIEW public.product_performance AS
SELECT
    p.name as product_name,
    b.name as brand_name,
    p.category,
    SUM(ti.quantity) as units_sold,
    SUM(ti.total_price) as total_revenue,
    AVG(ti.unit_price) as avg_price
FROM public.products p
JOIN public.brands b ON p.brand_id = b.id
JOIN public.transaction_items ti ON p.id = ti.product_id
JOIN public.transactions t ON ti.transaction_id = t.id
GROUP BY p.name, b.name, p.category
ORDER BY total_revenue DESC;

-- Create Analytics Functions (updated for new schema)
CREATE OR REPLACE FUNCTION public.get_age_distribution_simple(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(
    age_group text,
    total_revenue numeric,
    transaction_count bigint,
    percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_date timestamptz;
    end_date timestamptz;
    filter_barangays text[];
    filter_categories text[];
    filter_brands text[];
    filter_stores text[];
BEGIN
    -- Extract filters
    start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
    end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
    filter_barangays := CASE WHEN filters ? 'p_barangays' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
    filter_categories := CASE WHEN filters ? 'p_categories' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
    filter_brands := CASE WHEN filters ? 'p_brands' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
    filter_stores := CASE WHEN filters ? 'p_stores' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

    RETURN QUERY
    WITH age_groups AS (
        SELECT
            CASE
                WHEN c.age BETWEEN 18 AND 25 THEN '18-25'
                WHEN c.age BETWEEN 26 AND 35 THEN '26-35'
                WHEN c.age BETWEEN 36 AND 45 THEN '36-45'
                WHEN c.age BETWEEN 46 AND 55 THEN '46-55'
                WHEN c.age > 55 THEN '56+'
                ELSE 'Unknown'
            END as age_group,
            SUM(ti.total_price) as total_revenue,
            COUNT(t.id) as transaction_count
        FROM transactions t
        JOIN customers c ON t.customer_id = c.customer_id
        JOIN transaction_items ti ON t.id = ti.transaction_id
        JOIN products p ON ti.product_id = p.id
        JOIN brands b ON p.brand_id = b.id
        JOIN stores s ON t.store_id = s.id
        WHERE t.transaction_date >= start_date
            AND t.transaction_date <= end_date
            AND (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
            AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
            AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
            AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
        GROUP BY age_group
    ),
    total_revenue AS (
        SELECT SUM(total_revenue) as total FROM age_groups
    )
    SELECT
        ag.age_group,
        ag.total_revenue,
        ag.transaction_count,
        CASE
            WHEN tr.total > 0 THEN (ag.total_revenue / tr.total * 100)
            ELSE 0
        END as percentage
    FROM age_groups ag
    CROSS JOIN total_revenue tr
    ORDER BY ag.total_revenue DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_gender_distribution_simple(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(
    gender text,
    total_revenue numeric,
    transaction_count bigint,
    percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_date timestamptz;
    end_date timestamptz;
    filter_barangays text[];
    filter_categories text[];
    filter_brands text[];
    filter_stores text[];
BEGIN
    -- Extract filters
    start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
    end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
    filter_barangays := CASE WHEN filters ? 'p_barangays' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
    filter_categories := CASE WHEN filters ? 'p_categories' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
    filter_brands := CASE WHEN filters ? 'p_brands' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
    filter_stores := CASE WHEN filters ? 'p_stores' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

    RETURN QUERY
    WITH gender_stats AS (
        SELECT
            COALESCE(c.gender, 'Unknown') as gender,
            SUM(ti.total_price) as total_revenue,
            COUNT(t.id) as transaction_count
        FROM transactions t
        JOIN customers c ON t.customer_id = c.customer_id
        JOIN transaction_items ti ON t.id = ti.transaction_id
        JOIN products p ON ti.product_id = p.id
        JOIN brands b ON p.brand_id = b.id
        JOIN stores s ON t.store_id = s.id
        WHERE t.transaction_date >= start_date
            AND t.transaction_date <= end_date
            AND (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
            AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
            AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
            AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
        GROUP BY COALESCE(c.gender, 'Unknown')
    ),
    total_revenue AS (
        SELECT SUM(total_revenue) as total FROM gender_stats
    )
    SELECT
        gs.gender,
        gs.total_revenue,
        gs.transaction_count,
        CASE
            WHEN tr.total > 0 THEN (gs.total_revenue / tr.total * 100)
            ELSE 0
        END as percentage
    FROM gender_stats gs
    CROSS JOIN total_revenue tr
    ORDER BY gs.total_revenue DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_top_products(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(
    product_name text,
    brand_name text,
    category text,
    units_sold bigint,
    total_revenue numeric,
    market_share numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_date timestamptz;
    end_date timestamptz;
    filter_barangays text[];
    filter_categories text[];
    filter_brands text[];
    filter_stores text[];
BEGIN
    -- Extract filters
    start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
    end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
    filter_barangays := CASE WHEN filters ? 'p_barangays' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
    filter_categories := CASE WHEN filters ? 'p_categories' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
    filter_brands := CASE WHEN filters ? 'p_brands' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
    filter_stores := CASE WHEN filters ? 'p_stores' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

    RETURN QUERY
    WITH product_stats AS (
        SELECT
            p.name as product_name,
            b.name as brand_name,
            p.category,
            SUM(ti.quantity) as units_sold,
            SUM(ti.total_price) as total_revenue
        FROM products p
        JOIN brands b ON p.brand_id = b.id
        JOIN transaction_items ti ON p.id = ti.product_id
        JOIN transactions t ON ti.transaction_id = t.id
        JOIN stores s ON t.store_id = s.id
        WHERE t.transaction_date >= start_date
            AND t.transaction_date <= end_date
            AND (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
            AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
            AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
            AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
        GROUP BY p.name, b.name, p.category
    ),
    total_revenue AS (
        SELECT SUM(total_revenue) as total FROM product_stats
    )
    SELECT
        ps.product_name,
        ps.brand_name,
        ps.category,
        ps.units_sold,
        ps.total_revenue,
        CASE
            WHEN tr.total > 0 THEN (ps.total_revenue / tr.total * 100)
            ELSE 0
        END as market_share
    FROM product_stats ps
    CROSS JOIN total_revenue tr
    ORDER BY ps.total_revenue DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_income_distribution(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(
    income_level text,
    total_revenue numeric,
    transaction_count bigint,
    percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_date timestamptz;
    end_date timestamptz;
    filter_barangays text[];
    filter_categories text[];
    filter_brands text[];
    filter_stores text[];
BEGIN
    -- Extract filters
    start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
    end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
    filter_barangays := CASE WHEN filters ? 'p_barangays' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
    filter_categories := CASE WHEN filters ? 'p_categories' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
    filter_brands := CASE WHEN filters ? 'p_brands' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
    filter_stores := CASE WHEN filters ? 'p_stores' THEN
        ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

    RETURN QUERY
    WITH income_stats AS (
        SELECT
            COALESCE(c.income_level, 'Unknown') as income_level,
            SUM(ti.total_price) as total_revenue,
            COUNT(t.id) as transaction_count
        FROM transactions t
        JOIN customers c ON t.customer_id = c.customer_id
        JOIN transaction_items ti ON t.id = ti.transaction_id
        JOIN products p ON ti.product_id = p.id
        JOIN brands b ON p.brand_id = b.id
        JOIN stores s ON t.store_id = s.id
        WHERE t.transaction_date >= start_date
            AND t.transaction_date <= end_date
            AND (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
            AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
            AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
            AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
        GROUP BY COALESCE(c.income_level, 'Unknown')
    ),
    total_revenue AS (
        SELECT SUM(total_revenue) as total FROM income_stats
    )
    SELECT
        is.income_level,
        is.total_revenue,
        is.transaction_count,
        CASE
            WHEN tr.total > 0 THEN (is.total_revenue / tr.total * 100)
            ELSE 0
        END as percentage
    FROM income_stats is
    CROSS JOIN total_revenue tr
    ORDER BY is.total_revenue DESC;
END;
$$;

COMMIT; 