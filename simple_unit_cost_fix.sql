-- Simple unit cost backfill to fix negative gross margin
-- Sets unit_cost to 72% of unit_price for FMCG products with zero cost

UPDATE products
SET unit_cost = ROUND(unit_price * 0.72, 2)
WHERE is_fmcg = true
  AND unit_cost = 0;

-- Verify the fix
SELECT 
  'Unit cost fix results' as status,
  COUNT(*) as total_fmcg_products,
  COUNT(*) FILTER (WHERE unit_cost > 0) as products_with_cost,
  COUNT(*) FILTER (WHERE unit_cost = 0) as products_without_cost,
  ROUND(AVG(unit_cost), 2) as avg_unit_cost,
  ROUND(AVG(unit_price), 2) as avg_unit_price,
  ROUND(AVG(unit_cost / NULLIF(unit_price, 0) * 100), 1) as avg_cost_percentage
FROM products 
WHERE is_fmcg = true;