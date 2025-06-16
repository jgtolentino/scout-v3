-- Fix unit cost values to ensure positive gross margins
-- This script ensures unit_cost is always 50-80% of the average selling price

-- First, calculate average selling prices for each product from actual transactions
WITH product_avg_prices AS (
  SELECT 
    p.id as product_id,
    p.name,
    p.category,
    AVG(ti.unit_price) as avg_selling_price,
    COUNT(*) as transaction_count
  FROM products p
  LEFT JOIN transaction_items_fmcg ti ON ti.product_id = p.id
  WHERE p.is_fmcg = true
  GROUP BY p.id, p.name, p.category
),
realistic_costs AS (
  SELECT 
    product_id,
    name,
    category,
    avg_selling_price,
    transaction_count,
    CASE 
      -- For products with actual sales, set cost to 50-80% of average selling price
      WHEN avg_selling_price > 0 THEN 
        ROUND((avg_selling_price * (0.5 + (RANDOM() * 0.3)))::numeric, 2)
      -- For products without sales, set reasonable defaults by category
      ELSE 
        CASE 
          WHEN category = 'Dairy' THEN ROUND((RANDOM() * 40 + 30)::numeric, 2) -- 30-70
          WHEN category = 'Snacks' THEN ROUND((RANDOM() * 25 + 15)::numeric, 2) -- 15-40
          WHEN category = 'Personal Care' THEN ROUND((RANDOM() * 80 + 40)::numeric, 2) -- 40-120
          WHEN category = 'Household' THEN ROUND((RANDOM() * 60 + 30)::numeric, 2) -- 30-90
          WHEN category = 'Condiments' THEN ROUND((RANDOM() * 35 + 20)::numeric, 2) -- 20-55
          WHEN category = 'Canned Goods' THEN ROUND((RANDOM() * 50 + 25)::numeric, 2) -- 25-75
          WHEN category = 'Beverages' THEN ROUND((RANDOM() * 30 + 20)::numeric, 2) -- 20-50
          WHEN category = 'Tobacco' THEN ROUND((RANDOM() * 120 + 80)::numeric, 2) -- 80-200
          ELSE ROUND((RANDOM() * 50 + 25)::numeric, 2) -- Default 25-75
        END
    END as realistic_unit_cost
  FROM product_avg_prices
)
UPDATE products 
SET unit_cost = realistic_costs.realistic_unit_cost
FROM realistic_costs 
WHERE products.id = realistic_costs.product_id 
  AND products.is_fmcg = true;

-- Verify the fix by checking gross margins
SELECT 
  'Post-fix validation' as check_type,
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE unit_cost < 100) as products_under_100,
  COUNT(*) FILTER (WHERE unit_cost > 0) as products_with_cost,
  ROUND(AVG(unit_cost), 2) as avg_unit_cost,
  ROUND(MIN(unit_cost), 2) as min_unit_cost,
  ROUND(MAX(unit_cost), 2) as max_unit_cost
FROM products 
WHERE is_fmcg = true;

-- Check sample gross margins after fix
SELECT 
  'Sample gross margins' as check_type,
  COUNT(*) as transaction_items,
  ROUND(SUM((ti.unit_price - COALESCE(p.unit_cost,0)) * ti.quantity), 2) as total_gross_profit,
  ROUND(SUM(ti.unit_price * ti.quantity), 2) as total_revenue,
  ROUND(
    SUM((ti.unit_price - COALESCE(p.unit_cost,0)) * ti.quantity) / 
    NULLIF(SUM(ti.unit_price * ti.quantity), 0) * 100, 
    2
  ) as gross_margin_pct
FROM transaction_items_fmcg ti
JOIN products p ON p.id = ti.product_id
WHERE p.is_fmcg = true;