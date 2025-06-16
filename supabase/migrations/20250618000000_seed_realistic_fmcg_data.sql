-- 1. Create Philippine Regions Table
CREATE TABLE ph_regions (
    id SERIAL PRIMARY KEY,
    mega_region VARCHAR(50),
    region VARCHAR(50) NOT NULL,
    weight NUMERIC(5,4) NOT NULL
);

INSERT INTO ph_regions (mega_region, region, weight) VALUES
('Luzon', 'NCR', 0.18), ('Luzon', 'CAR', 0.05), ('Luzon', 'Ilocos', 0.07),
('Luzon', 'Cagayan Valley', 0.06), ('Luzon', 'Central Luzon', 0.12),
('Luzon', 'CALABARZON', 0.15), ('Luzon', 'MIMAROPA', 0.08), ('Luzon', 'Bicol', 0.09),
('Visayas', 'Western Visayas', 0.10), ('Visayas', 'Central Visayas', 0.11),
('Visayas', 'Eastern Visayas', 0.09), ('Mindanao', 'Zamboanga', 0.08),
('Mindanao', 'Northern Mindanao', 0.10), ('Mindanao', 'Davao', 0.12),
('Mindanao', 'SOCCSKSARGEN', 0.09), ('Mindanao', 'Caraga', 0.07),
('Mindanao', 'BARMM', 0.06);

-- 2. Insert TBWA Client Brands and Products
INSERT INTO brands (name, category) VALUES
('Alaska', 'Dairy'), ('Oishi', 'Snacks'), ('Peerless', 'Cleaning'),
('Del Monte', 'Food'), ('JTI', 'Tobacco'), ('Cow Bell', 'Dairy'),
('Krem-Top', 'Dairy'), ('Alpine', 'Dairy'), ('Calla', 'Personal Care'),
('Hana', 'Personal Care'), ('Cyclone', 'Cleaning'), ('Pride', 'Cleaning'),
('Care Plus', 'Personal Care'), ('S&W', 'Food'), ('Fit 'n Right', 'Beverage'),
('Winston', 'Tobacco'), ('Camel', 'Tobacco'), ('Mevius', 'Tobacco'),
('LD', 'Tobacco'), ('Mighty', 'Tobacco'), ('Caster', 'Tobacco'), 
('Glamour', 'Tobacco');

INSERT INTO products (name, brand_id, category, is_fmcg, unit_price) VALUES
-- Alaska Products
('Evaporated Milk', 1, 'Dairy', true, 25.50),
('Condensed Milk', 1, 'Dairy', true, 28.75),
('Powdered Milk', 1, 'Dairy', true, 120.00),
-- Oishi Products
('Prawn Crackers', 2, 'Snacks', true, 15.00),
('Pillows', 2, 'Snacks', true, 12.50),
('Marty's Crackers', 2, 'Snacks', true, 18.25),
-- Peerless Products
('Champion Detergent', 3, 'Cleaning', true, 45.00),
('Calla Shampoo', 9, 'Personal Care', true, 32.50),
('Hana Conditioner', 10, 'Personal Care', true, 35.25),
-- Del Monte Products
('Pineapple Juice', 4, 'Beverage', true, 38.00),
('Tomato Sauce', 4, 'Food', true, 22.75),
('Fruit Cocktail', 4, 'Food', true, 42.50),
-- Competitor Products (20% of market)
('Bear Brand', 6, 'Dairy', true, 130.00),
('Nissin Crackers', 2, 'Snacks', true, 16.75),
('Surf Detergent', 3, 'Cleaning', true, 48.50),
('Sunsilk Shampoo', 9, 'Personal Care', true, 34.25),
('Dole Juice', 4, 'Beverage', true, 40.00),
('Marlboro', 5, 'Tobacco', true, 95.00);

-- 3. Generate 90 Stores Across 17 Regions
INSERT INTO stores (name, address, region)
SELECT 
    'Store ' || s.id || ' - ' || r.region,
    'Brgy. ' || (ROW_NUMBER() OVER(PARTITION BY r.region)) || ', ' || r.region,
    r.region
FROM generate_series(1,90) s(id)
JOIN (
    SELECT region, weight 
    FROM ph_regions
    ORDER BY weight DESC 
    LIMIT 17
) r ON true;

-- 4. Generate 90 Devices
INSERT INTO device_master (device_id, mac_address, store_id, status)
SELECT 
    'Pi5-' || store_id || '-' || SUBSTRING(md5(random()::text), 1, 6),
    mac,
    store_id,
    'active'
FROM (
    SELECT 
        id AS store_id,
        'AA:BB:CC:' || 
        LPAD(FLOOR(RANDOM()*99)::text, 2, '0') || ':' ||
        LPAD(FLOOR(RANDOM()*99)::text, 2, '0') || ':' ||
        LPAD(FLOOR(RANDOM()*99)::text, 2, '0') AS mac
    FROM stores
) d;

-- 5. Generate 5,000 Sales Interactions
WITH interactions AS (
    INSERT INTO sales_interactions (
        store_id, 
        device_id, 
        transaction_date, 
        gender, 
        age, 
        emotion,
        duration,
        total_amount,
        is_attendant_influenced,
        substitution_occurred
    )
    SELECT
        s.id AS store_id,
        d.device_id,
        NOW() - (RANDOM() * INTERVAL '180 days') - (RANDOM() * INTERVAL '12 hours'),
        CASE WHEN RANDOM() > 0.4 THEN 'F' ELSE 'M' END,
        FLOOR(18 + RANDOM() * 50),
        (ARRAY['happy','neutral','sad','angry'])[FLOOR(1 + RANDOM()*4)],
        (1 + RANDOM() * 4) * INTERVAL '1 minute',
        0, -- Placeholder
        RANDOM() < 0.3, -- 30% attendant influenced
        RANDOM() < 0.15 -- 15% substitutions
    FROM generate_series(1,5000) i
    JOIN stores s ON true
    JOIN device_master d ON d.store_id = s.id
    ORDER BY RANDOM() 
    RETURNING interaction_id, store_id
),
-- 6. Generate Transaction Items (15,000 items)
items AS (
    INSERT INTO transaction_items (interaction_id, product_id, quantity)
    SELECT
        i.interaction_id,
        p.id AS product_id,
        CASE 
            WHEN p.name LIKE '%Milk%' THEN FLOOR(1 + RANDOM() * 3)
            WHEN p.category = 'Snacks' THEN FLOOR(1 + RANDOM() * 5)
            ELSE FLOOR(1 + RANDOM() * 2)
        END AS quantity
    FROM interactions i
    CROSS JOIN LATERAL (
        SELECT id 
        FROM products 
        WHERE RANDOM() < CASE 
            WHEN s.region IN ('NCR', 'CALABARZON') THEN 0.85  -- High brand penetration
            ELSE 0.65  -- Competitor preference in provinces
        END
        ORDER BY RANDOM() 
        LIMIT (1 + FLOOR(RANDOM() * 4))  -- 1-5 items per transaction
    ) p
    JOIN stores s ON i.store_id = s.id
    RETURNING interaction_id, product_id, quantity
)
-- 7. Update Total Amounts
UPDATE sales_interactions si
SET total_amount = (
    SELECT COALESCE(SUM(p.unit_price * ti.quantity), 0)
    FROM transaction_items ti
    JOIN products p ON ti.product_id = p.id
    WHERE ti.interaction_id = si.interaction_id
)
WHERE EXISTS (SELECT 1 FROM interactions i WHERE i.interaction_id = si.interaction_id);

-- 8. Generate Request Methods
INSERT INTO request_methods (interaction_id, method, details)
SELECT
    i.interaction_id,
    (ARRAY['vocal','pointing','generic_ask','assisted'])[FLOOR(1 + RANDOM()*4)],
    CASE 
        WHEN RANDOM() < 0.2 THEN 'Requested in Tagalog' 
        WHEN RANDOM() < 0.1 THEN 'Pointed to competitor product'
    END
FROM interactions i;

-- 9. Add Market Noise (Competitor Transactions)
WITH competitor_stores AS (
    SELECT id FROM stores WHERE region IN ('Bicol', 'Eastern Visayas', 'BARMM')
    ORDER BY RANDOM() LIMIT 25
),
noise_transactions AS (
    INSERT INTO sales_interactions (
        store_id, 
        device_id, 
        transaction_date, 
        total_amount
    )
    SELECT
        s.id,
        d.device_id,
        NOW() - (RANDOM() * INTERVAL '180 days') - (RANDOM() * INTERVAL '12 hours'),
        50 + RANDOM() * 150
    FROM generate_series(1,300) n
    JOIN competitor_stores s ON true
    JOIN device_master d ON d.store_id = s.id
    RETURNING interaction_id
)
INSERT INTO transaction_items (interaction_id, product_id, quantity)
SELECT
    nt.interaction_id,
    p.id,
    FLOOR(1 + RANDOM() * 3)
FROM noise_transactions nt
CROSS JOIN LATERAL (
    SELECT id 
    FROM products 
    WHERE name IN ('Bear Brand', 'Nissin Crackers', 'Surf Detergent', 'Marlboro')
    ORDER BY RANDOM() 
    LIMIT (1 + FLOOR(RANDOM() * 2))
) p;

-- 10. Generate Session Matches
INSERT INTO session_matches (
    interaction_id, 
    transcript_id, 
    detection_id, 
    match_confidence
)
SELECT
    i.interaction_id,
    'trans-' || LEFT(md5(i.interaction_id::text), 8),
    'detect-' || LEFT(md5(i.interaction_id::text), 8),
    0.85 + (RANDOM() * 0.14)  -- 85-99% confidence
FROM interactions i;

-- 11. Create Regional Sales View
CREATE MATERIALIZED VIEW regional_sales AS
SELECT 
    r.mega_region,
    r.region,
    COUNT(DISTINCT si.interaction_id) AS total_transactions,
    SUM(si.total_amount) AS total_revenue,
    AVG(si.total_amount) AS avg_transaction_value,
    COUNT(DISTINCT CASE WHEN p.brand_id = 1 THEN ti.id END) AS alaska_sales,
    COUNT(DISTINCT CASE WHEN p.brand_id = 2 THEN ti.id END) AS oishi_sales,
    COUNT(DISTINCT CASE WHEN p.brand_id NOT IN (1,2,3,4,5) THEN ti.id END) AS competitor_sales
FROM sales_interactions si
JOIN stores s ON si.store_id = s.id
JOIN ph_regions r ON s.region = r.region
JOIN transaction_items ti ON si.interaction_id = ti.interaction_id
JOIN products p ON ti.product_id = p.id
GROUP BY 1, 2;

-- 12. Create Brand Competition Dashboard View
CREATE VIEW brand_competition AS
SELECT 
    p.name AS product,
    b.name AS brand,
    COUNT(ti.id) AS units_sold,
    SUM(ti.quantity * p.unit_price) AS revenue,
    (SELECT COUNT(*) FROM transaction_items WHERE product_id = p.id) * 100.0 / 
        (SELECT COUNT(*) FROM transaction_items) AS market_share,
    (SELECT COUNT(*) FROM transaction_items ti2
      JOIN products p2 ON ti2.product_id = p2.id
      WHERE p2.category = p.category) AS category_total
FROM transaction_items ti
JOIN products p ON ti.product_id = p.id
JOIN brands b ON p.brand_id = b.id
GROUP BY 1, 2, p.category; 