-- Scout Analytics v3 - Azure PostgreSQL Database Schema
-- Mirrors Supabase schema with Azure PostgreSQL compatibility

-- Create database (run this separately in Azure PostgreSQL)
-- CREATE DATABASE scout_analytics_v3;
-- \c scout_analytics_v3;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables and sequences to ensure a clean reset
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

-- Drop existing sequences
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

-- Create sequences for integer primary keys
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
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);

-- Table: public.products
CREATE TABLE public.products (
  id integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
  product_name text NOT NULL,
  brand_id integer NOT NULL,
  category text,
  subcategory text,
  unit_cost numeric,
  retail_price numeric,
  size_ml integer,
  size_g integer,
  packaging_type text,
  is_fmcg boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);

-- Table: public.devices
CREATE TABLE public.devices (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  device_name text NOT NULL,
  store_id integer NOT NULL,
  device_type text DEFAULT 'pos'::text,
  status text DEFAULT 'active'::text,
  last_ping timestamp with time zone,
  firmware_version text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT devices_pkey PRIMARY KEY (id),
  CONSTRAINT devices_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- Table: public.transactions
CREATE TABLE public.transactions (
  id bigint NOT NULL DEFAULT nextval('transactions_id_seq'::regclass),
  transaction_id text NOT NULL UNIQUE,
  store_id integer NOT NULL,
  customer_id integer,
  device_id uuid,
  transaction_date timestamp with time zone NOT NULL,
  total_amount numeric NOT NULL,
  payment_method text,
  discount_amount numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT transactions_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id)
);

-- Table: public.transaction_items
CREATE TABLE public.transaction_items (
  id bigint NOT NULL DEFAULT nextval('transaction_items_id_seq'::regclass),
  transaction_id bigint NOT NULL,
  product_id integer NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  discount_applied numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transaction_items_pkey PRIMARY KEY (id),
  CONSTRAINT transaction_items_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE,
  CONSTRAINT transaction_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Table: public.substitutions
CREATE TABLE public.substitutions (
  id integer NOT NULL DEFAULT nextval('substitutions_id_seq'::regclass),
  original_product_id integer NOT NULL,
  substitute_product_id integer NOT NULL,
  substitution_reason text,
  frequency integer DEFAULT 1,
  confidence_score numeric(3,2),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT substitutions_pkey PRIMARY KEY (id),
  CONSTRAINT substitutions_original_product_id_fkey FOREIGN KEY (original_product_id) REFERENCES public.products(id),
  CONSTRAINT substitutions_substitute_product_id_fkey FOREIGN KEY (substitute_product_id) REFERENCES public.products(id)
);

-- Table: public.customer_requests
CREATE TABLE public.customer_requests (
  id integer NOT NULL DEFAULT nextval('customer_requests_id_seq'::regclass),
  customer_id integer NOT NULL,
  store_id integer NOT NULL,
  requested_product text,
  request_type text,
  status text DEFAULT 'pending'::text,
  request_date timestamp with time zone DEFAULT now(),
  response_date timestamp with time zone,
  notes text,
  CONSTRAINT customer_requests_pkey PRIMARY KEY (id),
  CONSTRAINT customer_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT customer_requests_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- Table: public.request_behaviors
CREATE TABLE public.request_behaviors (
  id integer NOT NULL DEFAULT nextval('request_behaviors_id_seq'::regclass),
  customer_request_id integer NOT NULL,
  behavior_type text,
  behavior_data jsonb,
  recorded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT request_behaviors_pkey PRIMARY KEY (id),
  CONSTRAINT request_behaviors_customer_request_id_fkey FOREIGN KEY (customer_request_id) REFERENCES public.customer_requests(id)
);

-- Table: public.device_health
CREATE TABLE public.device_health (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  device_id uuid NOT NULL,
  cpu_usage numeric(5,2),
  memory_usage numeric(5,2),
  disk_usage numeric(5,2),
  network_status text,
  temperature numeric(5,2),
  uptime_hours integer,
  last_restart timestamp with time zone,
  health_score numeric(3,2),
  recorded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT device_health_pkey PRIMARY KEY (id),
  CONSTRAINT device_health_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id)
);

-- Table: public.edge_logs
CREATE TABLE public.edge_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  device_id uuid NOT NULL,
  log_level text,
  message text,
  component text,
  error_code text,
  metadata jsonb,
  logged_at timestamp with time zone DEFAULT now(),
  CONSTRAINT edge_logs_pkey PRIMARY KEY (id),
  CONSTRAINT edge_logs_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id)
);

-- Table: public.product_detections
CREATE TABLE public.product_detections (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  device_id uuid NOT NULL,
  product_id integer,
  detected_name text,
  confidence_score numeric(5,4),
  bounding_box jsonb,
  image_path text,
  detection_method text,
  verified boolean DEFAULT false,
  detected_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_detections_pkey PRIMARY KEY (id),
  CONSTRAINT product_detections_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id),
  CONSTRAINT product_detections_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_store ON public.transactions(store_id);
CREATE INDEX idx_transaction_items_transaction ON public.transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product ON public.transaction_items(product_id);
CREATE INDEX idx_products_brand ON public.products(brand_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_customers_region ON public.customers(region);
CREATE INDEX idx_stores_region ON public.stores(region);

-- Create views for dashboard analytics
CREATE VIEW public.daily_sales AS
SELECT 
    DATE(t.transaction_date) as sale_date,
    s.region,
    s.city,
    SUM(t.total_amount) as total_revenue,
    COUNT(t.id) as transaction_count,
    COUNT(DISTINCT t.customer_id) as unique_customers
FROM public.transactions t
JOIN public.stores s ON t.store_id = s.id
GROUP BY DATE(t.transaction_date), s.region, s.city;

CREATE VIEW public.product_performance AS
SELECT 
    p.id as product_id,
    p.product_name,
    b.name as brand_name,
    p.category,
    SUM(ti.quantity) as total_quantity_sold,
    SUM(ti.total_price) as total_revenue,
    COUNT(DISTINCT ti.transaction_id) as transaction_count,
    AVG(ti.unit_price) as avg_selling_price
FROM public.products p
JOIN public.brands b ON p.brand_id = b.id
JOIN public.transaction_items ti ON p.id = ti.product_id
GROUP BY p.id, p.product_name, b.name, p.category;

-- Set sequence ownership
ALTER SEQUENCE brands_id_seq OWNED BY public.brands.id;
ALTER SEQUENCE customer_requests_id_seq OWNED BY public.customer_requests.id;
ALTER SEQUENCE customers_id_seq OWNED BY public.customers.id;
ALTER SEQUENCE products_id_seq OWNED BY public.products.id;
ALTER SEQUENCE request_behaviors_id_seq OWNED BY public.request_behaviors.id;
ALTER SEQUENCE stores_id_seq OWNED BY public.stores.id;
ALTER SEQUENCE substitutions_id_seq OWNED BY public.substitutions.id;
ALTER SEQUENCE transaction_items_id_seq OWNED BY public.transaction_items.id;
ALTER SEQUENCE transactions_id_seq OWNED BY public.transactions.id;

-- Success message
SELECT 'Azure PostgreSQL Database schema created successfully!' as status;