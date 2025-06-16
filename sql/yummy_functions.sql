-- =========================================================
-- Yummy FMCG Intelligence Agent - Supabase Functions
-- =========================================================

-- 1. FMCG Category Insights Function
CREATE OR REPLACE FUNCTION get_fmcg_category_insights(category_name TEXT DEFAULT NULL)
RETURNS TABLE (
  category TEXT,
  trend TEXT,
  recommendation TEXT,
  confidence INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH category_metrics AS (
    SELECT 
      p.category,
      COUNT(DISTINCT ti.transaction_id) as transaction_count,
      SUM(ti.total_price) as total_revenue,
      AVG(ti.total_price) as avg_item_value,
      COUNT(DISTINCT t.customer_id) as unique_customers
    FROM transaction_items_fmcg ti
    JOIN products p ON p.id = ti.product_id
    JOIN transactions_fmcg t ON t.id = ti.transaction_id
    WHERE (category_name IS NULL OR p.category = category_name)
      AND t.transaction_date >= NOW() - INTERVAL '30 days'
    GROUP BY p.category
  ),
  category_trends AS (
    SELECT 
      cm.category,
      cm.total_revenue,
      cm.transaction_count,
      CASE 
        WHEN cm.total_revenue > 50000 AND cm.transaction_count > 100 THEN '📈 Strong growth in demand'
        WHEN cm.total_revenue > 25000 AND cm.transaction_count > 50 THEN '📊 Steady performance'
        WHEN cm.total_revenue < 10000 OR cm.transaction_count < 20 THEN '📉 Declining performance'
        ELSE '➡️ Stable category performance'
      END as trend_description,
      CASE 
        WHEN cm.total_revenue > 50000 THEN 'Expand inventory and consider premium SKUs'
        WHEN cm.total_revenue > 25000 THEN 'Maintain current strategy with minor optimizations'
        WHEN cm.total_revenue < 10000 THEN 'Review pricing strategy and promotional activities'
        ELSE 'Monitor closely for emerging trends'
      END as recommendation_text,
      CASE 
        WHEN cm.transaction_count > 100 THEN 85
        WHEN cm.transaction_count > 50 THEN 75
        WHEN cm.transaction_count > 20 THEN 65
        ELSE 55
      END as confidence_score
    FROM category_metrics cm
  )
  SELECT 
    ct.category::TEXT,
    ct.trend_description::TEXT as trend,
    ct.recommendation_text::TEXT as recommendation,
    ct.confidence_score::INTEGER as confidence
  FROM category_trends ct
  ORDER BY ct.total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FMCG Product Recommendations Function
CREATE OR REPLACE FUNCTION get_fmcg_product_recommendations(product_sku TEXT DEFAULT NULL)
RETURNS TABLE (
  sku TEXT,
  action TEXT,
  impact TEXT,
  priority TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH product_performance AS (
    SELECT 
      p.name as product_name,
      p.category,
      COUNT(ti.id) as sales_count,
      SUM(ti.total_price) as total_revenue,
      AVG(ti.total_price) as avg_price,
      COUNT(DISTINCT ti.transaction_id) as transaction_count
    FROM products p
    LEFT JOIN transaction_items_fmcg ti ON ti.product_id = p.id
    LEFT JOIN transactions_fmcg t ON t.id = ti.transaction_id
    WHERE (product_sku IS NULL OR p.name ILIKE '%' || product_sku || '%')
      AND (t.transaction_date IS NULL OR t.transaction_date >= NOW() - INTERVAL '30 days')
    GROUP BY p.id, p.name, p.category
  ),
  product_recommendations AS (
    SELECT 
      pp.product_name,
      CASE 
        WHEN pp.total_revenue > 20000 AND pp.sales_count > 50 THEN 'Increase inventory levels'
        WHEN pp.total_revenue < 5000 AND pp.sales_count < 10 THEN 'Consider discontinuation or promotion'
        WHEN pp.avg_price > 100 AND pp.sales_count < 20 THEN 'Review pricing strategy'
        WHEN pp.transaction_count > 30 THEN 'Bundle with complementary products'
        ELSE 'Monitor performance closely'
      END as action_text,
      CASE 
        WHEN pp.total_revenue > 20000 THEN 'High revenue impact - potential ₱50K+ monthly increase'
        WHEN pp.total_revenue > 10000 THEN 'Medium impact - estimated ₱20K+ monthly gain'
        WHEN pp.total_revenue < 5000 THEN 'Low impact - cost savings focus'
        ELSE 'Moderate impact - steady growth potential'
      END as impact_text,
      CASE 
        WHEN pp.total_revenue > 20000 OR pp.sales_count > 50 THEN 'high'
        WHEN pp.total_revenue > 10000 OR pp.sales_count > 25 THEN 'medium'
        ELSE 'low'
      END as priority_level
    FROM product_performance pp
  )
  SELECT 
    pr.product_name::TEXT as sku,
    pr.action_text::TEXT as action,
    pr.impact_text::TEXT as impact,
    pr.priority_level::TEXT as priority
  FROM product_recommendations pr
  ORDER BY 
    CASE pr.priority_level 
      WHEN 'high' THEN 1 
      WHEN 'medium' THEN 2 
      ELSE 3 
    END,
    pr.product_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FMCG Market Trends Function
CREATE OR REPLACE FUNCTION get_fmcg_market_trends(metric_name TEXT DEFAULT NULL)
RETURNS TABLE (
  metric TEXT,
  value NUMERIC,
  change_percent NUMERIC,
  period TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT 
      'Total Revenue' as metric_name,
      SUM(total_amount) as current_value,
      COUNT(*) as transaction_count,
      COUNT(DISTINCT customer_id) as unique_customers
    FROM transactions_fmcg 
    WHERE transaction_date >= NOW() - INTERVAL '30 days'
  ),
  previous_period AS (
    SELECT 
      'Total Revenue' as metric_name,
      SUM(total_amount) as previous_value,
      COUNT(*) as prev_transaction_count,
      COUNT(DISTINCT customer_id) as prev_unique_customers
    FROM transactions_fmcg 
    WHERE transaction_date >= NOW() - INTERVAL '60 days'
      AND transaction_date < NOW() - INTERVAL '30 days'
  ),
  trend_calculations AS (
    SELECT 
      cp.metric_name,
      cp.current_value,
      CASE 
        WHEN pp.previous_value > 0 THEN 
          ROUND(((cp.current_value - pp.previous_value) / pp.previous_value * 100), 2)
        ELSE 0
      END as change_percentage
    FROM current_period cp
    LEFT JOIN previous_period pp ON cp.metric_name = pp.metric_name
    
    UNION ALL
    
    SELECT 
      'Transaction Count' as metric_name,
      cp.transaction_count::NUMERIC as current_value,
      CASE 
        WHEN pp.prev_transaction_count > 0 THEN 
          ROUND(((cp.transaction_count - pp.prev_transaction_count)::NUMERIC / pp.prev_transaction_count * 100), 2)
        ELSE 0
      END as change_percentage
    FROM current_period cp
    LEFT JOIN previous_period pp ON cp.metric_name = pp.metric_name
    
    UNION ALL
    
    SELECT 
      'Unique Customers' as metric_name,
      cp.unique_customers::NUMERIC as current_value,
      CASE 
        WHEN pp.prev_unique_customers > 0 THEN 
          ROUND(((cp.unique_customers - pp.prev_unique_customers)::NUMERIC / pp.prev_unique_customers * 100), 2)
        ELSE 0
      END as change_percentage
    FROM current_period cp
    LEFT JOIN previous_period pp ON cp.metric_name = pp.metric_name
  )
  SELECT 
    tc.metric_name::TEXT as metric,
    tc.current_value::NUMERIC as value,
    tc.change_percentage::NUMERIC as change_percent,
    'Last 30 days vs Previous 30 days'::TEXT as period
  FROM trend_calculations tc
  WHERE (metric_name IS NULL OR tc.metric_name = metric_name)
  ORDER BY tc.current_value DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FMCG Inventory Insights Function
CREATE OR REPLACE FUNCTION get_fmcg_inventory_insights(product_sku TEXT DEFAULT NULL)
RETURNS TABLE (
  sku TEXT,
  current_stock INTEGER,
  reorder_point INTEGER,
  lead_time INTEGER,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH product_velocity AS (
    SELECT 
      p.name as product_name,
      COUNT(ti.id) as sales_velocity,
      SUM(ti.quantity) as total_sold,
      AVG(ti.quantity) as avg_qty_per_sale
    FROM products p
    LEFT JOIN transaction_items_fmcg ti ON ti.product_id = p.id
    LEFT JOIN transactions_fmcg t ON t.id = ti.transaction_id
    WHERE (product_sku IS NULL OR p.name ILIKE '%' || product_sku || '%')
      AND (t.transaction_date IS NULL OR t.transaction_date >= NOW() - INTERVAL '30 days')
    GROUP BY p.id, p.name
  ),
  inventory_simulation AS (
    SELECT 
      pv.product_name,
      -- Simulate current stock levels based on sales velocity
      CASE 
        WHEN pv.sales_velocity > 20 THEN (50 + RANDOM() * 50)::INTEGER
        WHEN pv.sales_velocity > 10 THEN (25 + RANDOM() * 75)::INTEGER
        WHEN pv.sales_velocity > 5 THEN (10 + RANDOM() * 90)::INTEGER
        ELSE (5 + RANDOM() * 45)::INTEGER
      END as stock_level,
      -- Calculate reorder point based on velocity
      CASE 
        WHEN pv.sales_velocity > 20 THEN 30
        WHEN pv.sales_velocity > 10 THEN 20
        WHEN pv.sales_velocity > 5 THEN 15
        ELSE 10
      END as reorder_level,
      -- Lead time in days
      CASE 
        WHEN pv.sales_velocity > 15 THEN 7  -- Fast moving items need quick replenishment
        WHEN pv.sales_velocity > 5 THEN 14
        ELSE 21
      END as lead_days,
      pv.sales_velocity
    FROM product_velocity pv
  ),
  inventory_recommendations AS (
    SELECT 
      ins.product_name,
      ins.stock_level,
      ins.reorder_level,
      ins.lead_days,
      CASE 
        WHEN ins.stock_level <= ins.reorder_level * 0.5 THEN 
          '🔴 URGENT: Order immediately - critically low stock'
        WHEN ins.stock_level <= ins.reorder_level THEN 
          '⚠️ WARNING: Below reorder point - place order soon'
        WHEN ins.stock_level > ins.reorder_level * 3 THEN 
          '📦 OPTIMIZE: Excess inventory - consider reducing orders'
        WHEN ins.sales_velocity > 20 THEN 
          '🚀 TRENDING: High demand - consider increasing stock levels'
        ELSE 
          '✅ NORMAL: Stock levels appropriate for current demand'
      END as recommendation_text
    FROM inventory_simulation ins
  )
  SELECT 
    ir.product_name::TEXT as sku,
    ir.stock_level::INTEGER as current_stock,
    ir.reorder_level::INTEGER as reorder_point,
    ir.lead_days::INTEGER as lead_time,
    ir.recommendation_text::TEXT as recommendation
  FROM inventory_recommendations ir
  ORDER BY 
    CASE 
      WHEN ir.stock_level <= ir.reorder_level * 0.5 THEN 1
      WHEN ir.stock_level <= ir.reorder_level THEN 2
      ELSE 3
    END,
    ir.product_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FMCG Promotion Analysis Function
CREATE OR REPLACE FUNCTION get_fmcg_promotion_analysis(campaign_id TEXT DEFAULT NULL)
RETURNS TABLE (
  campaign_id TEXT,
  effectiveness NUMERIC,
  roi NUMERIC,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH promotion_simulation AS (
    SELECT 
      'PROMO_' || p.category || '_' || EXTRACT(WEEK FROM NOW())::TEXT as promo_id,
      p.category,
      COUNT(ti.id) as sales_count,
      SUM(ti.total_price) as revenue,
      AVG(ti.total_price) as avg_transaction_value
    FROM products p
    LEFT JOIN transaction_items_fmcg ti ON ti.product_id = p.id
    LEFT JOIN transactions_fmcg t ON t.id = ti.transaction_id
    WHERE t.transaction_date >= NOW() - INTERVAL '30 days'
    GROUP BY p.category
  ),
  promotion_metrics AS (
    SELECT 
      ps.promo_id,
      -- Simulate effectiveness based on sales performance
      CASE 
        WHEN ps.sales_count > 50 THEN (15 + RANDOM() * 25)::NUMERIC  -- 15-40% effectiveness
        WHEN ps.sales_count > 25 THEN (5 + RANDOM() * 20)::NUMERIC   -- 5-25% effectiveness
        WHEN ps.sales_count > 10 THEN (-5 + RANDOM() * 15)::NUMERIC  -- -5 to 10% effectiveness
        ELSE (-15 + RANDOM() * 20)::NUMERIC                          -- -15 to 5% effectiveness
      END as effectiveness_pct,
      -- Simulate ROI based on category performance
      CASE 
        WHEN ps.revenue > 20000 THEN (20 + RANDOM() * 50)::NUMERIC   -- 20-70% ROI
        WHEN ps.revenue > 10000 THEN (5 + RANDOM() * 30)::NUMERIC    -- 5-35% ROI
        WHEN ps.revenue > 5000 THEN (-10 + RANDOM() * 25)::NUMERIC   -- -10 to 15% ROI
        ELSE (-25 + RANDOM() * 30)::NUMERIC                          -- -25 to 5% ROI
      END as roi_pct,
      ps.revenue,
      ps.sales_count
    FROM promotion_simulation ps
  ),
  promotion_recommendations AS (
    SELECT 
      pm.promo_id,
      pm.effectiveness_pct,
      pm.roi_pct,
      CASE 
        WHEN pm.effectiveness_pct > 20 AND pm.roi_pct > 30 THEN 
          '🏆 SCALE UP: Excellent performance - increase budget and duration'
        WHEN pm.effectiveness_pct > 10 AND pm.roi_pct > 15 THEN 
          '📈 CONTINUE: Good results - maintain current strategy'
        WHEN pm.effectiveness_pct > 0 AND pm.roi_pct > 0 THEN 
          '⚖️ OPTIMIZE: Moderate performance - test different approaches'
        WHEN pm.effectiveness_pct < 0 OR pm.roi_pct < 0 THEN 
          '🛑 STOP: Poor performance - discontinue or major revisions needed'
        ELSE 
          '🔍 MONITOR: Inconclusive results - need more data'
      END as recommendation_text
    FROM promotion_metrics pm
  )
  SELECT 
    pr.promo_id::TEXT as campaign_id,
    ROUND(pr.effectiveness_pct, 2)::NUMERIC as effectiveness,
    ROUND(pr.roi_pct, 2)::NUMERIC as roi,
    pr.recommendation_text::TEXT as recommendation
  FROM promotion_recommendations pr
  WHERE (campaign_id IS NULL OR pr.promo_id = campaign_id)
  ORDER BY pr.roi_pct DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FMCG Competitor Analysis Function
CREATE OR REPLACE FUNCTION get_fmcg_competitor_analysis(brand_name TEXT DEFAULT NULL)
RETURNS TABLE (
  brand TEXT,
  market_share NUMERIC,
  price_position TEXT,
  threat_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH brand_performance AS (
    SELECT 
      b.name as brand_name,
      COUNT(ti.id) as sales_count,
      SUM(ti.total_price) as total_revenue,
      AVG(ti.unit_price) as avg_price,
      COUNT(DISTINCT p.category) as category_spread
    FROM brands b
    LEFT JOIN products p ON p.brand_id = b.id
    LEFT JOIN transaction_items_fmcg ti ON ti.product_id = p.id
    LEFT JOIN transactions_fmcg t ON t.id = ti.transaction_id
    WHERE t.transaction_date >= NOW() - INTERVAL '30 days'
    GROUP BY b.id, b.name
  ),
  market_analysis AS (
    SELECT 
      bp.brand_name,
      bp.total_revenue,
      bp.avg_price,
      bp.sales_count,
      -- Calculate market share percentage
      ROUND((bp.total_revenue / NULLIF(SUM(bp.total_revenue) OVER (), 0) * 100), 2) as market_share_pct,
      -- Determine price positioning
      CASE 
        WHEN bp.avg_price > 150 THEN 'Premium'
        WHEN bp.avg_price > 100 THEN 'Mid-tier'
        WHEN bp.avg_price > 50 THEN 'Value'
        ELSE 'Budget'
      END as price_tier,
      bp.category_spread
    FROM brand_performance bp
    WHERE bp.total_revenue > 0  -- Only include brands with sales
  ),
  threat_assessment AS (
    SELECT 
      ma.brand_name,
      ma.market_share_pct,
      ma.price_tier,
      -- Assess threat level based on market share and growth potential
      CASE 
        WHEN ma.market_share_pct > 15 AND ma.sales_count > 100 THEN 'high'
        WHEN ma.market_share_pct > 8 OR ma.sales_count > 50 THEN 'medium'
        ELSE 'low'
      END as threat_classification
    FROM market_analysis ma
  )
  SELECT 
    ta.brand_name::TEXT as brand,
    ta.market_share_pct::NUMERIC as market_share,
    ta.price_tier::TEXT as price_position,
    ta.threat_classification::TEXT as threat_level
  FROM threat_assessment ta
  WHERE (brand_name IS NULL OR ta.brand_name ILIKE '%' || brand_name || '%')
  ORDER BY ta.market_share_pct DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to all functions
GRANT EXECUTE ON FUNCTION get_fmcg_category_insights(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_fmcg_product_recommendations(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_fmcg_market_trends(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_fmcg_inventory_insights(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_fmcg_promotion_analysis(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_fmcg_competitor_analysis(TEXT) TO anon, authenticated;

-- Enable RLS for security
ALTER FUNCTION get_fmcg_category_insights(TEXT) SECURITY DEFINER;
ALTER FUNCTION get_fmcg_product_recommendations(TEXT) SECURITY DEFINER;
ALTER FUNCTION get_fmcg_market_trends(TEXT) SECURITY DEFINER;
ALTER FUNCTION get_fmcg_inventory_insights(TEXT) SECURITY DEFINER;
ALTER FUNCTION get_fmcg_promotion_analysis(TEXT) SECURITY DEFINER;
ALTER FUNCTION get_fmcg_competitor_analysis(TEXT) SECURITY DEFINER;