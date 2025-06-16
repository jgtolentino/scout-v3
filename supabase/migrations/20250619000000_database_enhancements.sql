-- Required Views
-- Daily Sales Summary
CREATE MATERIALIZED VIEW daily_sales AS
SELECT DATE(transaction_date) AS sale_date,
       store_id,
       SUM(total_amount) AS daily_revenue,
       COUNT(*) AS transaction_count
FROM transactions
GROUP BY 1, 2;

-- Product Performance (Refresh nightly)
CREATE MATERIALIZED VIEW product_performance AS
SELECT p.id AS product_id,
       p.name AS product_name,
       b.name AS brand_name,
       SUM(ti.quantity) AS units_sold,
       SUM(ti.total_price) AS total_revenue
FROM transaction_items ti
JOIN products p ON ti.product_id = p.id
JOIN brands b ON p.brand_id = b.id
GROUP BY 1,2,3;

-- Customer Segmentation
CREATE VIEW customer_segments AS
SELECT customer_id,
       CASE 
         WHEN COUNT(*) > 5 THEN 'Frequent'
         WHEN AVG(total_amount) > 5000 THEN 'Premium'
         ELSE 'Standard'
       END AS segment
FROM transactions
GROUP BY customer_id;

-- Essential Stored Procedures
-- Daily Data Refresh
CREATE PROCEDURE refresh_analytics()
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW daily_sales;
  REFRESH MATERIALIZED VIEW product_performance;
  -- Add other views as needed
END;
$$;

-- FMCG Transaction Identifier
CREATE PROCEDURE flag_fmcg_transactions()
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE transactions t
  SET is_fmcg = EXISTS (
    SELECT 1 FROM transaction_items ti
    JOIN products p ON ti.product_id = p.id
    WHERE ti.transaction_id = t.id
    AND p.is_fmcg = true
  );
END;
$$;

-- Anomaly Detection
CREATE PROCEDURE detect_sales_anomalies()
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO anomalies (type, details)
  SELECT 'SUSPICIOUS_TRANSACTION',
         json_build_object('transaction_id', id, 'amount', total_amount)
  FROM transactions
  WHERE total_amount > (SELECT AVG(total_amount)*3 FROM transactions);
END;
$$;

-- RLS Policy Enhancements
-- Granular customer access
CREATE POLICY "Customer data access" ON customers
FOR SELECT USING (
  auth.uid() = id OR -- Own profile
  auth.jwt() ->> 'role' = 'manager' -- Managers
);

-- Time-based restriction
CREATE POLICY "Business hours access" ON transactions
FOR SELECT USING (
  EXTRACT(HOUR FROM CURRENT_TIME) BETWEEN 8 AND 20
);

-- Security Improvements
-- Audit trail trigger
CREATE FUNCTION log_data_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, table_name, action, old_data, new_data)
  VALUES (auth.uid(), TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to sensitive tables
CREATE TRIGGER products_audit
AFTER UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION log_data_changes();

-- Performance Optimization
-- Indexes for common queries
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_items_product ON transaction_items(product_id);

-- Query optimization config
-- Note: ALTER DATABASE commands require SUPERUSER privileges and cannot be part of a standard migration
-- You'll need to run these manually with a user that has sufficient privileges, or configure in your RDS parameter group.
-- ALTER DATABASE your_db_name SET work_mem = '16MB';
-- ALTER DATABASE your_db_name SET maintenance_work_mem = '1GB';

-- Data Retention Policy
-- Automated data purge
CREATE PROCEDURE purge_old_data(retention_months INT DEFAULT 12)
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM transactions 
  WHERE transaction_date < NOW() - INTERVAL '1 month' * retention_months;
  
  DELETE FROM audit_log
  WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$; 