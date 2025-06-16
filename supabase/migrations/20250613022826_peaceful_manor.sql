/*
  # Sample Data for Retail Analytics

  1. Sample Data
    - Philippine retail brands
    - Common products with categories
    - Store locations in Makati
    - Customer demographics
    - Realistic transaction data

  2. Data Volume
    - 10 brands
    - 50+ products
    - 4 stores
    - 1000 customers
    - 5000+ transactions with items
*/

-- Insert sample brands
INSERT INTO brands (name) VALUES
  ('Nestlé'),
  ('Unilever'),
  ('Procter & Gamble'),
  ('Coca-Cola'),
  ('Pepsi'),
  ('Del Monte'),
  ('Lucky Me!'),
  ('Colgate'),
  ('Palmolive'),
  ('Safeguard')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
WITH brand_ids AS (
  SELECT id, name FROM brands
)
INSERT INTO products (name, category, brand_id, unit_price) 
SELECT p.name, p.category, b.id, p.unit_price
FROM (VALUES
  ('Nescafé Original', 'Beverages', 'Nestlé', 45.00),
  ('Nescafé 3-in-1', 'Beverages', 'Nestlé', 8.50),
  ('Maggi Noodles', 'Food', 'Nestlé', 12.00),
  ('Nestlé Milk', 'Beverages', 'Nestlé', 65.00),
  ('KitKat', 'Food', 'Nestlé', 25.00),
  
  ('Dove Soap', 'Personal Care', 'Unilever', 35.00),
  ('Knorr Seasoning', 'Food', 'Unilever', 15.00),
  ('Surf Detergent', 'Home Care', 'Unilever', 28.00),
  ('Rexona Deodorant', 'Personal Care', 'Unilever', 85.00),
  ('Lipton Tea', 'Beverages', 'Unilever', 55.00),
  
  ('Head & Shoulders', 'Personal Care', 'Procter & Gamble', 125.00),
  ('Tide Detergent', 'Home Care', 'Procter & Gamble', 145.00),
  ('Pantene Shampoo', 'Personal Care', 'Procter & Gamble', 165.00),
  ('Ariel Detergent', 'Home Care', 'Procter & Gamble', 135.00),
  ('Olay Lotion', 'Personal Care', 'Procter & Gamble', 285.00),
  
  ('Coca-Cola Classic', 'Beverages', 'Coca-Cola', 25.00),
  ('Sprite', 'Beverages', 'Coca-Cola', 25.00),
  ('Fanta Orange', 'Beverages', 'Coca-Cola', 25.00),
  ('Coke Zero', 'Beverages', 'Coca-Cola', 28.00),
  ('Royal Tru-Orange', 'Beverages', 'Coca-Cola', 22.00),
  
  ('Pepsi Cola', 'Beverages', 'Pepsi', 25.00),
  ('Mountain Dew', 'Beverages', 'Pepsi', 28.00),
  ('7UP', 'Beverages', 'Pepsi', 25.00),
  ('Mirinda', 'Beverages', 'Pepsi', 25.00),
  
  ('Del Monte Corned Beef', 'Food', 'Del Monte', 85.00),
  ('Del Monte Fruit Cocktail', 'Food', 'Del Monte', 45.00),
  ('Del Monte Tomato Sauce', 'Food', 'Del Monte', 18.00),
  ('Del Monte Sweet Corn', 'Food', 'Del Monte', 35.00),
  ('Del Monte Pineapple Juice', 'Beverages', 'Del Monte', 55.00),
  
  ('Lucky Me! Instant Noodles', 'Food', 'Lucky Me!', 8.50),
  ('Lucky Me! Pancit Canton', 'Food', 'Lucky Me!', 9.00),
  ('Lucky Me! Supreme', 'Food', 'Lucky Me!', 12.00),
  ('Lucky Me! Go Cup', 'Food', 'Lucky Me!', 15.00),
  
  ('Colgate Toothpaste', 'Personal Care', 'Colgate', 65.00),
  ('Colgate Mouthwash', 'Personal Care', 'Colgate', 125.00),
  ('Colgate Toothbrush', 'Personal Care', 'Colgate', 45.00),
  
  ('Palmolive Shampoo', 'Personal Care', 'Palmolive', 85.00),
  ('Palmolive Soap', 'Personal Care', 'Palmolive', 25.00),
  ('Palmolive Dishwashing Liquid', 'Home Care', 'Palmolive', 45.00),
  
  ('Safeguard Soap', 'Personal Care', 'Safeguard', 28.00),
  ('Safeguard Body Wash', 'Personal Care', 'Safeguard', 125.00),
  ('Safeguard Hand Sanitizer', 'Personal Care', 'Safeguard', 85.00)
) AS p(name, category, brand_name, unit_price)
JOIN brand_ids b ON b.name = p.brand_name
ON CONFLICT DO NOTHING;

-- Insert sample stores
INSERT INTO stores (name, barangay, city, region) VALUES
  ('SM Supermarket Makati', 'Poblacion', 'Makati', 'NCR'),
  ('Robinson''s Supermarket', 'Bel-Air', 'Makati', 'NCR'),
  ('Mercury Drug Salcedo', 'Salcedo Village', 'Makati', 'NCR'),
  ('Puregold San Lorenzo', 'San Lorenzo', 'Makati', 'NCR')
ON CONFLICT DO NOTHING;

-- Insert sample customers (1000 customers)
INSERT INTO customers (age_group, gender, income_bracket)
SELECT 
  CASE 
    WHEN random() < 0.2 THEN '18-25'
    WHEN random() < 0.4 THEN '26-35'
    WHEN random() < 0.6 THEN '36-45'
    WHEN random() < 0.8 THEN '46-55'
    ELSE '56+'
  END,
  CASE WHEN random() < 0.55 THEN 'F' ELSE 'M' END,
  CASE 
    WHEN random() < 0.3 THEN 'Low'
    WHEN random() < 0.7 THEN 'Medium'
    ELSE 'High'
  END
FROM generate_series(1, 1000);