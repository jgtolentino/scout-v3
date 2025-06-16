-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to get FMCG category insights
CREATE OR REPLACE FUNCTION get_fmcg_category_insights(category_name TEXT DEFAULT NULL)
RETURNS TABLE (
  category TEXT,
  trend TEXT,
  recommendation TEXT,
  confidence NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH category_metrics AS (
    SELECT 
      c.name as category,
      COUNT(DISTINCT t.id) as transaction_count,
      SUM(ti.quantity) as total_quantity,
      AVG(ti.unit_price) as avg_price,
      COUNT(DISTINCT t.region_id) as region_count
    FROM categories_fmcg c
    JOIN products_fmcg p ON p.category_id = c.id
    JOIN transaction_items_fmcg ti ON ti.product_id = p.id
    JOIN transactions_fmcg t ON t.id = ti.transaction_id
    WHERE (category_name IS NULL OR c.name = category_name)
    GROUP BY c.name
  ),
  trend_analysis AS (
    SELECT 
      category,
      CASE 
        WHEN transaction_count > 1000 THEN 'High demand'
        WHEN transaction_count > 500 THEN 'Moderate demand'
        ELSE 'Low demand'
      END as trend,
      CASE 
        WHEN avg_price > 100 THEN 'Premium pricing opportunity'
        WHEN avg_price > 50 THEN 'Standard pricing'
        ELSE 'Value pricing recommended'
      END as recommendation,
      CASE 
        WHEN region_count > 10 THEN 90
        WHEN region_count > 5 THEN 75
        ELSE 60
      END as confidence
    FROM category_metrics
  )
  SELECT * FROM trend_analysis;
END;
$$;

-- Function to get FMCG product recommendations
CREATE OR REPLACE FUNCTION get_fmcg_product_recommendations(product_sku TEXT DEFAULT NULL)
RETURNS TABLE (
  sku TEXT,
  action TEXT,
  impact TEXT,
  priority TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH product_metrics AS (
    SELECT 
      p.sku,
      COUNT(DISTINCT t.id) as transaction_count,
      SUM(ti.quantity) as total_quantity,
      AVG(ti.unit_price) as avg_price,
      COUNT(DISTINCT t.region_id) as region_count
    FROM products_fmcg p
    JOIN transaction_items_fmcg ti ON ti.product_id = p.id
    JOIN transactions_fmcg t ON t.id = ti.transaction_id
    WHERE (product_sku IS NULL OR p.sku = product_sku)
    GROUP BY p.sku
  ),
  recommendation_analysis AS (
    SELECT 
      sku,
      CASE 
        WHEN transaction_count < 50 THEN 'Increase marketing'
        WHEN avg_price < 50 THEN 'Price optimization'
        WHEN region_count < 5 THEN 'Regional expansion'
        ELSE 'Maintain current strategy'
      END as action,
      CASE 
        WHEN transaction_count < 50 THEN 'Potential 30% growth'
        WHEN avg_price < 50 THEN '15% margin improvement'
        WHEN region_count < 5 THEN '20% market expansion'
        ELSE 'Stable performance'
      END as impact,
      CASE 
        WHEN transaction_count < 50 THEN 'high'
        WHEN avg_price < 50 THEN 'medium'
        WHEN region_count < 5 THEN 'medium'
        ELSE 'low'
      END as priority
    FROM product_metrics
  )
  SELECT * FROM recommendation_analysis;
END;
$$;

-- Function to get FMCG market trends
CREATE OR REPLACE FUNCTION get_fmcg_market_trends(metric_name TEXT DEFAULT NULL)
RETURNS TABLE (
  metric TEXT,
  value NUMERIC,
  change NUMERIC,
  period TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH monthly_metrics AS (
    SELECT 
      DATE_TRUNC('month', t.transaction_date) as month,
      COUNT(DISTINCT t.id) as transaction_count,
      SUM(ti.quantity) as total_quantity,
      AVG(ti.unit_price) as avg_price
    FROM transactions_fmcg t
    JOIN transaction_items_fmcg ti ON t.id = ti.transaction_id
    GROUP BY DATE_TRUNC('month', t.transaction_date)
    ORDER BY month DESC
    LIMIT 12
  ),
  trend_calculation AS (
    SELECT 
      'Transaction Volume' as metric,
      transaction_count as value,
      ((transaction_count - LAG(transaction_count) OVER (ORDER BY month)) / 
       LAG(transaction_count) OVER (ORDER BY month) * 100) as change,
      TO_CHAR(month, 'YYYY-MM') as period
    FROM monthly_metrics
    UNION ALL
    SELECT 
      'Total Quantity' as metric,
      total_quantity as value,
      ((total_quantity - LAG(total_quantity) OVER (ORDER BY month)) / 
       LAG(total_quantity) OVER (ORDER BY month) * 100) as change,
      TO_CHAR(month, 'YYYY-MM') as period
    FROM monthly_metrics
    UNION ALL
    SELECT 
      'Average Price' as metric,
      avg_price as value,
      ((avg_price - LAG(avg_price) OVER (ORDER BY month)) / 
       LAG(avg_price) OVER (ORDER BY month) * 100) as change,
      TO_CHAR(month, 'YYYY-MM') as period
    FROM monthly_metrics
  )
  SELECT * FROM trend_calculation
  WHERE (metric_name IS NULL OR metric = metric_name)
  ORDER BY period DESC, metric;
END;
$$;

-- Function to get FMCG competitive benchmarks
CREATE OR REPLACE FUNCTION get_fmcg_competitive_benchmarks(category_name TEXT DEFAULT NULL)
RETURNS TABLE (
  category TEXT,
  metric TEXT,
  value NUMERIC,
  benchmark NUMERIC,
  difference NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH category_metrics AS (
    SELECT 
      c.name as category,
      COUNT(DISTINCT t.id) as transaction_count,
      SUM(ti.quantity) as total_quantity,
      AVG(ti.unit_price) as avg_price
    FROM categories_fmcg c
    JOIN products_fmcg p ON p.category_id = c.id
    JOIN transaction_items_fmcg ti ON ti.product_id = p.id
    JOIN transactions_fmcg t ON t.id = ti.transaction_id
    WHERE (category_name IS NULL OR c.name = category_name)
    GROUP BY c.name
  ),
  benchmark_calculation AS (
    SELECT 
      category,
      'Transaction Volume' as metric,
      transaction_count as value,
      AVG(transaction_count) OVER () as benchmark,
      transaction_count - AVG(transaction_count) OVER () as difference
    FROM category_metrics
    UNION ALL
    SELECT 
      category,
      'Total Quantity' as metric,
      total_quantity as value,
      AVG(total_quantity) OVER () as benchmark,
      total_quantity - AVG(total_quantity) OVER () as difference
    FROM category_metrics
    UNION ALL
    SELECT 
      category,
      'Average Price' as metric,
      avg_price as value,
      AVG(avg_price) OVER () as benchmark,
      avg_price - AVG(avg_price) OVER () as difference
    FROM category_metrics
  )
  SELECT * FROM benchmark_calculation
  ORDER BY category, metric;
END;
$$;

-- Function to get FMCG inventory insights
CREATE OR REPLACE FUNCTION get_fmcg_inventory_insights(product_sku TEXT DEFAULT NULL)
RETURNS TABLE (
  sku TEXT,
  current_stock NUMERIC,
  reorder_point NUMERIC,
  lead_time NUMERIC,
  recommendation TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH inventory_metrics AS (
    SELECT 
      p.sku,
      COALESCE(i.current_stock, 0) as current_stock,
      COALESCE(i.reorder_point, 0) as reorder_point,
      COALESCE(i.lead_time_days, 0) as lead_time,
      AVG(ti.quantity) as avg_daily_sales
    FROM products_fmcg p
    LEFT JOIN inventory_fmcg i ON i.product_id = p.id
    LEFT JOIN transaction_items_fmcg ti ON ti.product_id = p.id
    LEFT JOIN transactions_fmcg t ON t.id = ti.transaction_id
    WHERE (product_sku IS NULL OR p.sku = product_sku)
    GROUP BY p.sku, i.current_stock, i.reorder_point, i.lead_time_days
  )
  SELECT 
    sku,
    current_stock,
    reorder_point,
    lead_time,
    CASE 
      WHEN current_stock <= reorder_point THEN 'Immediate reorder required'
      WHEN current_stock <= (reorder_point * 1.5) THEN 'Plan reorder soon'
      WHEN current_stock > (reorder_point * 2) THEN 'Excess stock - consider promotion'
      ELSE 'Stock level optimal'
    END as recommendation
  FROM inventory_metrics;
END;
$$;

-- Function to get FMCG promotion analysis
CREATE OR REPLACE FUNCTION get_fmcg_promotion_analysis(campaign_id TEXT DEFAULT NULL)
RETURNS TABLE (
  campaign_id TEXT,
  effectiveness NUMERIC,
  roi NUMERIC,
  recommendation TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH promotion_metrics AS (
    SELECT 
      p.campaign_id,
      COUNT(DISTINCT t.id) as transaction_count,
      SUM(ti.quantity) as total_quantity,
      SUM(ti.quantity * ti.unit_price) as total_revenue,
      SUM(ti.quantity * (ti.unit_price - p.discount_amount)) as net_revenue,
      p.discount_amount * SUM(ti.quantity) as total_discount
    FROM promotions_fmcg p
    JOIN transaction_items_fmcg ti ON ti.promotion_id = p.id
    JOIN transactions_fmcg t ON t.id = ti.transaction_id
    WHERE (campaign_id IS NULL OR p.campaign_id = campaign_id)
    GROUP BY p.campaign_id, p.discount_amount
  )
  SELECT 
    campaign_id,
    ((net_revenue - total_discount) / NULLIF(total_revenue, 0) * 100) as effectiveness,
    ((net_revenue - total_discount) / NULLIF(total_discount, 0) * 100) as roi,
    CASE 
      WHEN ((net_revenue - total_discount) / NULLIF(total_revenue, 0) * 100) > 20 THEN 'Highly effective - consider scaling'
      WHEN ((net_revenue - total_discount) / NULLIF(total_revenue, 0) * 100) > 10 THEN 'Effective - maintain current strategy'
      WHEN ((net_revenue - total_discount) / NULLIF(total_revenue, 0) * 100) > 0 THEN 'Moderate - review pricing'
      ELSE 'Ineffective - revise strategy'
    END as recommendation
  FROM promotion_metrics;
END;
$$;

-- Function to get FMCG competitor analysis
CREATE OR REPLACE FUNCTION get_fmcg_competitor_analysis(brand_name TEXT DEFAULT NULL)
RETURNS TABLE (
  brand TEXT,
  market_share NUMERIC,
  price_position TEXT,
  threat_level TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH brand_metrics AS (
    SELECT 
      b.name as brand,
      COUNT(DISTINCT t.id) as transaction_count,
      AVG(ti.unit_price) as avg_price,
      SUM(ti.quantity * ti.unit_price) as total_revenue
    FROM brands_fmcg b
    JOIN products_fmcg p ON p.brand_id = b.id
    JOIN transaction_items_fmcg ti ON ti.product_id = p.id
    JOIN transactions_fmcg t ON t.id = ti.transaction_id
    WHERE (brand_name IS NULL OR b.name = brand_name)
    GROUP BY b.name
  ),
  market_share_calc AS (
    SELECT 
      brand,
      (total_revenue / SUM(total_revenue) OVER () * 100) as market_share,
      CASE 
        WHEN avg_price > (SELECT AVG(avg_price) FROM brand_metrics) THEN 'Premium'
        WHEN avg_price < (SELECT AVG(avg_price) FROM brand_metrics) THEN 'Value'
        ELSE 'Mid-range'
      END as price_position,
      CASE 
        WHEN (total_revenue / SUM(total_revenue) OVER () * 100) > 20 THEN 'high'
        WHEN (total_revenue / SUM(total_revenue) OVER () * 100) > 10 THEN 'medium'
        ELSE 'low'
      END as threat_level
    FROM brand_metrics
  )
  SELECT * FROM market_share_calc;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_fmcg_category_insights TO authenticated;
GRANT EXECUTE ON FUNCTION get_fmcg_product_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION get_fmcg_market_trends TO authenticated;
GRANT EXECUTE ON FUNCTION get_fmcg_competitive_benchmarks TO authenticated;
GRANT EXECUTE ON FUNCTION get_fmcg_inventory_insights TO authenticated;
GRANT EXECUTE ON FUNCTION get_fmcg_promotion_analysis TO authenticated;
GRANT EXECUTE ON FUNCTION get_fmcg_competitor_analysis TO authenticated; 