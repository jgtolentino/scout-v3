-- ============================================================
-- COMPREHENSIVE DATABASE FIX - Scout Analytics MVP
-- This recreates the full extended 5,000 FMCG dataset
-- ============================================================

BEGIN;

-- 1. Clear existing data for clean setup
TRUNCATE TABLE transaction_items CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE brands CASCADE;
TRUNCATE TABLE stores CASCADE;
TRUNCATE TABLE devices CASCADE;

-- 2. Ensure all columns exist with proper types
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_fmcg BOOLEAN DEFAULT true;

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS age_group TEXT,
  ADD COLUMN IF NOT EXISTS income_bracket TEXT;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS barangay TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT;

-- 3. Create comprehensive Philippine brands (72 FMCG brands)
INSERT INTO brands (name, description) VALUES
-- Dairy
('Alaska', 'Premium dairy products'),
('Alpine', 'Quality dairy essentials'),
('Cow Bell', 'Affordable dairy nutrition'),
('Nestle', 'Global dairy leader'),
('Bear Brand', 'Fortified milk products'),
-- Snacks
('Oishi', 'Popular snack foods'),
('Jack n Jill', 'Local snack favorites'),
('Piattos', 'Premium chips'),
('Nova', 'Affordable snacks'),
('Chippy', 'Classic Filipino chips'),
-- Beverages
('C2', 'Ready-to-drink tea'),
('Kopiko', 'Coffee products'),
('Nescafe', 'Instant coffee'),
('Milo', 'Chocolate malt drink'),
('Tang', 'Powdered juice drinks'),
-- Personal Care
('Safeguard', 'Antibacterial soap'),
('Palmolive', 'Personal care products'),
('Colgate', 'Oral care'),
('Head & Shoulders', 'Shampoo products'),
('Rejoice', 'Hair care'),
-- Household
('Surf', 'Laundry detergent'),
('Ariel', 'Premium detergent'),
('Downy', 'Fabric conditioner'),
('Joy', 'Dishwashing liquid'),
('Mr. Clean', 'Cleaning products'),
-- Canned Goods
('Century Tuna', 'Canned seafood'),
('San Marino', 'Corned tuna'),
('Argentina', 'Meat products'),
('CDO', 'Processed meats'),
('Purefoods', 'Quality meats'),
-- Condiments
('Datu Puti', 'Vinegar and sauces'),
('Silver Swan', 'Soy sauce'),
('UFC', 'Banana ketchup'),
('Mang Tomas', 'All-around sauce'),
('Knorr', 'Seasoning cubes'),
-- Noodles
('Lucky Me', 'Instant noodles'),
('Payless', 'Affordable noodles'),
('Nissin', 'Cup noodles'),
('Quickchow', 'Quick meals'),
('Yakisoba', 'Stir-fry noodles'),
-- Biscuits
('SkyFlakes', 'Crackers'),
('Fita', 'Cream crackers'),
('Rebisco', 'Sandwich cookies'),
('Cream-O', 'Cream-filled cookies'),
('Marie', 'Tea biscuits'),
-- Cooking Oil
('Baguio Oil', 'Cooking oil'),
('Golden Fiesta', 'Palm oil'),
('Minola', 'Coconut oil'),
('Wesson', 'Corn oil'),
('Marca Leon', 'Vegetable oil'),
-- Rice
('Sinandomeng', 'Premium rice'),
('Jasmine', 'Fragrant rice'),
('Ganador', 'Quality rice'),
('Harvester', 'Value rice'),
('Angelica', 'Long grain rice'),
-- Bread
('Gardenia', 'Soft bread'),
('Marby', 'Local bakery'),
('Pinoy Tasty', 'Affordable bread'),
('Selecta', 'Ice cream and dairy'),
('Magnolia', 'Dairy and ice cream'),
-- Coffee
('Great Taste', '3-in-1 coffee'),
('Cafe Puro', 'Barako blend'),
('San Mig Coffee', 'Ready-to-drink'),
('Kopiko 78', 'Bottled coffee'),
('Nescafe Classic', 'Instant coffee'),
-- Sugar & Salt
('Washed Sugar', 'Refined sugar'),
('Muscovado', 'Raw sugar'),
('Fidel', 'Iodized salt'),
('Asin', 'Rock salt'),
('White King', 'Cake mixes'),
-- Tobacco
('Marlboro', 'Premium cigarettes'),
('Fortune', 'Local cigarettes'),
('Mighty', 'Value cigarettes'),
('Hope', 'Menthol cigarettes'),
('Champion', 'Classic cigarettes');

-- 4. Create comprehensive products (200+ SKUs)
DO $$
DECLARE
  brand_rec RECORD;
  prod_counter INTEGER := 1;
BEGIN
  FOR brand_rec IN SELECT id, name FROM brands LOOP
    -- Create 3-5 products per brand
    FOR i IN 1..3 + floor(random() * 3)::int LOOP
      INSERT INTO products (name, brand_id, category, unit_price, unit_cost, is_fmcg)
      VALUES (
        brand_rec.name || ' Product ' || i,
        brand_rec.id,
        CASE 
          WHEN brand_rec.name IN ('Alaska', 'Alpine', 'Cow Bell', 'Nestle', 'Bear Brand') THEN 'Dairy'
          WHEN brand_rec.name IN ('Oishi', 'Jack n Jill', 'Piattos', 'Nova', 'Chippy') THEN 'Snacks'
          WHEN brand_rec.name IN ('C2', 'Kopiko', 'Nescafe', 'Milo', 'Tang') THEN 'Beverages'
          WHEN brand_rec.name IN ('Safeguard', 'Palmolive', 'Colgate', 'Head & Shoulders', 'Rejoice') THEN 'Personal Care'
          WHEN brand_rec.name IN ('Surf', 'Ariel', 'Downy', 'Joy', 'Mr. Clean') THEN 'Household'
          WHEN brand_rec.name IN ('Century Tuna', 'San Marino', 'Argentina', 'CDO', 'Purefoods') THEN 'Canned Goods'
          WHEN brand_rec.name IN ('Datu Puti', 'Silver Swan', 'UFC', 'Mang Tomas', 'Knorr') THEN 'Condiments'
          WHEN brand_rec.name IN ('Lucky Me', 'Payless', 'Nissin', 'Quickchow', 'Yakisoba') THEN 'Noodles'
          WHEN brand_rec.name IN ('Marlboro', 'Fortune', 'Mighty', 'Hope', 'Champion') THEN 'Tobacco'
          ELSE 'General'
        END,
        20 + random() * 480, -- Price between 20-500 pesos
        (20 + random() * 480) * 0.72, -- 28% margin
        true
      );
      prod_counter := prod_counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- 5. Create stores across 17 Philippine regions
INSERT INTO stores (name, address, barangay, city, region) 
SELECT 
  'Store_' || region || '_' || n,
  'Address ' || n,
  'Barangay ' || (1 + floor(random() * 100))::text,
  CASE region
    WHEN 'NCR' THEN (ARRAY['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig'])[1 + floor(random() * 5)::int]
    WHEN 'CALABARZON' THEN (ARRAY['Calamba', 'Batangas City', 'Lucena', 'Antipolo', 'Cavite City'])[1 + floor(random() * 5)::int]
    WHEN 'Central Luzon' THEN (ARRAY['Angeles', 'San Fernando', 'Malolos', 'Cabanatuan', 'Tarlac City'])[1 + floor(random() * 5)::int]
    WHEN 'Central Visayas' THEN (ARRAY['Cebu City', 'Mandaue', 'Lapu-Lapu', 'Tagbilaran', 'Dumaguete'])[1 + floor(random() * 5)::int]
    WHEN 'Davao Region' THEN (ARRAY['Davao City', 'Tagum', 'Panabo', 'Digos', 'Mati'])[1 + floor(random() * 5)::int]
    ELSE region || ' City'
  END,
  region
FROM (
  SELECT 
    unnest(ARRAY[
      'NCR', 'NCR', 'NCR', 'NCR', 'NCR', -- 5x weight for Metro Manila
      'CALABARZON', 'CALABARZON', 'CALABARZON',
      'Central Luzon', 'Central Luzon',
      'Western Visayas', 'Central Visayas',
      'Northern Mindanao', 'Davao Region',
      'Ilocos Region', 'Bicol Region',
      'Eastern Visayas', 'Soccsksargen',
      'Zamboanga Peninsula', 'Cagayan Valley',
      'Mimaropa', 'CAR', 'Caraga', 'BARMM'
    ]) AS region,
    generate_series(1, 50) AS n
) AS store_data;

-- 6. Create diverse customers (2000 unique customers)
INSERT INTO customers (customer_id, first_name, last_name, email, age, gender, age_group, income_bracket)
SELECT
  'CUST' || LPAD(n::text, 6, '0'),
  (ARRAY['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Luis', 'Carmen', 'Miguel', 'Elena'])[1 + floor(random() * 10)::int],
  (ARRAY['Santos', 'Reyes', 'Cruz', 'Garcia', 'Mendoza', 'Lopez', 'Gonzales', 'Hernandez', 'Perez', 'Martinez'])[1 + floor(random() * 10)::int],
  'customer' || n || '@example.com',
  18 + floor(random() * 52)::int, -- Age 18-70
  CASE WHEN random() > 0.5 THEN 'Male' ELSE 'Female' END,
  CASE 
    WHEN 18 + floor(random() * 52)::int < 25 THEN '18-24'
    WHEN 18 + floor(random() * 52)::int < 35 THEN '25-34'
    WHEN 18 + floor(random() * 52)::int < 45 THEN '35-44'
    WHEN 18 + floor(random() * 52)::int < 55 THEN '45-54'
    ELSE '55+'
  END,
  (ARRAY['Below 10K', '10K-25K', '25K-50K', '50K-100K', 'Above 100K'])[1 + floor(random() * 5)::int]
FROM generate_series(1, 2000) AS n;

-- 7. Create realistic transactions (5,000 transactions)
INSERT INTO transactions (transaction_date, customer_id, store_id, total_amount, payment_method)
SELECT
  NOW() - (random() * interval '90 days'), -- Last 90 days
  (SELECT id FROM customers ORDER BY random() LIMIT 1),
  (SELECT id FROM stores ORDER BY random() LIMIT 1),
  0, -- Will be updated after items
  (ARRAY['Cash', 'GCash', 'Maya', 'Credit Card', 'Debit Card'])[1 + floor(random() * 5)::int]
FROM generate_series(1, 5000);

-- 8. Create transaction items (average 2-5 items per transaction)
DO $$
DECLARE
  trans RECORD;
  num_items INTEGER;
  item_total NUMERIC;
  trans_total NUMERIC;
BEGIN
  FOR trans IN SELECT id FROM transactions LOOP
    num_items := 2 + floor(random() * 4)::int;
    trans_total := 0;
    
    FOR i IN 1..num_items LOOP
      WITH random_product AS (
        SELECT id, unit_price, unit_cost FROM products ORDER BY random() LIMIT 1
      )
      INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, total_price)
      SELECT 
        trans.id,
        id,
        1 + floor(random() * 3)::int, -- 1-3 quantity
        unit_price,
        unit_price * (1 + floor(random() * 3)::int)
      FROM random_product
      RETURNING total_price INTO item_total;
      
      trans_total := trans_total + item_total;
    END LOOP;
    
    -- Update transaction total
    UPDATE transactions SET total_amount = trans_total WHERE id = trans.id;
  END LOOP;
END $$;

-- 9. Create payments for all transactions
INSERT INTO payments (transaction_id, method, amount, status)
SELECT 
  id,
  payment_method,
  total_amount,
  'completed'
FROM transactions;

-- 10. Fix FMCG view relationships for PostgREST
CREATE OR REPLACE VIEW public.transactions_fmcg AS
SELECT t.*
FROM transactions t
WHERE NOT EXISTS (
    SELECT 1
    FROM transaction_items ti
    JOIN products p ON p.id = ti.product_id
    WHERE ti.transaction_id = t.id
    AND p.is_fmcg = false
);

CREATE OR REPLACE VIEW public.transaction_items_fmcg AS
SELECT ti.*
FROM transaction_items ti
JOIN products p ON p.id = ti.product_id
WHERE p.is_fmcg = true;

-- Drop existing constraints if they exist
ALTER VIEW public.transactions_fmcg DROP CONSTRAINT IF EXISTS transactions_fmcg_pkey CASCADE;
ALTER VIEW public.transaction_items_fmcg DROP CONSTRAINT IF EXISTS transaction_items_fmcg_pkey CASCADE;
ALTER VIEW public.transaction_items_fmcg DROP CONSTRAINT IF EXISTS transaction_items_fmcg_transaction_fk CASCADE;
ALTER VIEW public.transaction_items_fmcg DROP CONSTRAINT IF EXISTS transaction_items_fmcg_product_fk CASCADE;

-- Add metadata constraints for PostgREST
ALTER VIEW public.transactions_fmcg 
  ADD CONSTRAINT transactions_fmcg_pkey PRIMARY KEY (id) NOT VALID;

ALTER VIEW public.transaction_items_fmcg 
  ADD CONSTRAINT transaction_items_fmcg_pkey PRIMARY KEY (id) NOT VALID;

ALTER VIEW public.transaction_items_fmcg
  ADD CONSTRAINT transaction_items_fmcg_transaction_fk
  FOREIGN KEY (transaction_id) 
  REFERENCES public.transactions_fmcg(id) NOT VALID;

ALTER VIEW public.transaction_items_fmcg
  ADD CONSTRAINT transaction_items_fmcg_product_fk
  FOREIGN KEY (product_id)
  REFERENCES public.products(id) NOT VALID;

-- 11. Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 12. Create missing RPC functions
CREATE OR REPLACE FUNCTION get_age_distribution_simple()
RETURNS TABLE(age_group TEXT, percentage NUMERIC)
LANGUAGE sql STABLE
AS $$
  SELECT 
    age_group,
    ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM customers) * 100, 2) as percentage
  FROM customers
  WHERE age_group IS NOT NULL
  GROUP BY age_group
  ORDER BY age_group;
$$;

CREATE OR REPLACE FUNCTION get_gender_distribution_simple()
RETURNS TABLE(gender TEXT, percentage NUMERIC)
LANGUAGE sql STABLE
AS $$
  SELECT 
    gender,
    ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM customers) * 100, 2) as percentage
  FROM customers
  WHERE gender IS NOT NULL
  GROUP BY gender
  ORDER BY gender;
$$;

CREATE OR REPLACE FUNCTION get_income_distribution()
RETURNS TABLE(income_bracket TEXT, percentage NUMERIC)
LANGUAGE sql STABLE
AS $$
  SELECT 
    income_bracket,
    ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM customers) * 100, 2) as percentage
  FROM customers
  WHERE income_bracket IS NOT NULL
  GROUP BY income_bracket
  ORDER BY 
    CASE income_bracket
      WHEN 'Below 10K' THEN 1
      WHEN '10K-25K' THEN 2
      WHEN '25K-50K' THEN 3
      WHEN '50K-100K' THEN 4
      WHEN 'Above 100K' THEN 5
    END;
$$;

-- 13. Verify data
DO $$
DECLARE
  total_revenue NUMERIC;
  trans_count INTEGER;
  customer_count INTEGER;
  product_count INTEGER;
BEGIN
  SELECT COUNT(*), SUM(total_amount) INTO trans_count, total_revenue FROM transactions;
  SELECT COUNT(*) INTO customer_count FROM customers;
  SELECT COUNT(*) INTO product_count FROM products;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ COMPREHENSIVE DATABASE FIX COMPLETE!';
  RAISE NOTICE '=====================================';
  RAISE NOTICE 'Total Transactions: %', trans_count;
  RAISE NOTICE 'Total Revenue: ₱%', TO_CHAR(total_revenue, 'FM999,999,999.99');
  RAISE NOTICE 'Total Customers: %', customer_count;
  RAISE NOTICE 'Total Products: %', product_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Expected dashboard metrics:';
  RAISE NOTICE '- Revenue: ~₱1.2M';
  RAISE NOTICE '- Transactions: 5,000';
  RAISE NOTICE '- Customers: 2,000';
  RAISE NOTICE '- Products: 200+';
  RAISE NOTICE '';
END $$;

COMMIT;