-- Scout Analytics v3 - Sample Data for Azure Databases
-- Insert sample data that mirrors the existing Supabase data structure

-- Insert sample brands
INSERT INTO brands (name, company, category, is_tbwa, market_share) VALUES
('Coca-Cola', 'The Coca-Cola Company', 'Beverages', false, 45.20),
('Pepsi', 'PepsiCo', 'Beverages', false, 23.10),
('Sprite', 'The Coca-Cola Company', 'Beverages', false, 8.50),
('San Miguel Beer', 'San Miguel Corporation', 'Alcoholic Beverages', true, 67.30),
('Red Horse', 'San Miguel Corporation', 'Alcoholic Beverages', true, 15.20),
('Lucky Me!', 'Monde Nissin Corporation', 'Instant Noodles', false, 52.80),
('Pancit Canton', 'Monde Nissin Corporation', 'Instant Noodles', false, 28.40),
('Maggi', 'Nestlé Philippines', 'Instant Noodles', false, 12.60),
('Tide', 'Procter & Gamble', 'Detergent', true, 34.70),
('Surf', 'Unilever Philippines', 'Detergent', true, 29.50),
('Ariel', 'Procter & Gamble', 'Detergent', true, 18.20),
('Safeguard', 'Procter & Gamble', 'Personal Care', true, 25.80),
('Palmolive', 'Colgate-Palmolive', 'Personal Care', true, 22.10),
('Head & Shoulders', 'Procter & Gamble', 'Personal Care', true, 19.40),
('Nescafé', 'Nestlé Philippines', 'Coffee', false, 41.60);

-- Insert sample stores
INSERT INTO stores (name, location, barangay, city, region, latitude, longitude, store_type, size_category) VALUES
('SM Megamall', 'EDSA corner Julia Vargas Avenue', 'Wack Wack', 'Mandaluyong', 'Metro Manila', 14.5851, 121.0565, 'supermarket', 'large'),
('Robinsons Galleria', 'EDSA corner Ortigas Avenue', 'Ugong Norte', 'Quezon City', 'Metro Manila', 14.6199, 121.0564, 'supermarket', 'large'),
('Ayala Malls Greenbelt', 'Ayala Center', 'Bel-Air', 'Makati', 'Metro Manila', 14.5501, 121.0198, 'supermarket', 'medium'),
('Gateway Mall', 'Araneta Coliseum Complex', 'Socorro', 'Quezon City', 'Metro Manila', 14.6260, 121.0368, 'supermarket', 'medium'),
('Trinoma', 'EDSA corner North Avenue', 'North Triangle', 'Quezon City', 'Metro Manila', 14.6565, 121.0332, 'supermarket', 'large'),
('Sari-Sari Store - Taguig', '123 Main Street', 'Fort Bonifacio', 'Taguig', 'Metro Manila', 14.5176, 121.0509, 'convenience', 'small'),
('Mini Mart - Pasig', '456 Market Street', 'Kapitolyo', 'Pasig', 'Metro Manila', 14.5683, 121.0614, 'convenience', 'small'),
('Cebu IT Park Store', 'Lahug IT Park', 'Lahug', 'Cebu City', 'Central Visayas', 10.3157, 123.8854, 'supermarket', 'medium'),
('Davao Central Mall', 'C.M. Recto Street', 'Poblacion', 'Davao City', 'Davao Region', 7.0731, 125.6128, 'supermarket', 'large'),
('Baguio Session Road Store', 'Session Road', 'Burnham-Legarda', 'Baguio City', 'Cordillera Administrative Region', 16.4095, 120.5969, 'convenience', 'medium');

-- Insert sample customers
INSERT INTO customers (customer_id, name, age, gender, region, city, barangay, loyalty_tier, total_spent) VALUES
('CUST001', 'Maria Santos', 28, 'Female', 'Metro Manila', 'Makati', 'Poblacion', 'gold', 15750.50),
('CUST002', 'Juan Dela Cruz', 35, 'Male', 'Metro Manila', 'Quezon City', 'Diliman', 'silver', 8920.25),
('CUST003', 'Anna Reyes', 42, 'Female', 'Metro Manila', 'Manila', 'Ermita', 'regular', 3240.00),
('CUST004', 'Carlos Garcia', 29, 'Male', 'Central Visayas', 'Cebu City', 'Lahug', 'platinum', 22100.75),
('CUST005', 'Rosa Martinez', 38, 'Female', 'Davao Region', 'Davao City', 'Poblacion', 'gold', 12850.00),
('CUST006', 'Miguel Torres', 45, 'Male', 'Metro Manila', 'Pasig', 'Kapitolyo', 'silver', 6750.50),
('CUST007', 'Elena Rodriguez', 31, 'Female', 'Metro Manila', 'Taguig', 'Fort Bonifacio', 'regular', 4320.25),
('CUST008', 'Roberto Cruz', 52, 'Male', 'Cordillera Administrative Region', 'Baguio City', 'Burnham-Legarda', 'gold', 9876.00),
('CUST009', 'Carmen Lopez', 26, 'Female', 'Metro Manila', 'Mandaluyong', 'Wack Wack', 'silver', 7543.75),
('CUST010', 'Francisco Gonzales', 39, 'Male', 'Metro Manila', 'Quezon City', 'North Triangle', 'platinum', 18900.50);

-- Insert sample products
INSERT INTO products (product_name, brand_id, category, subcategory, unit_cost, retail_price, size_ml, packaging_type, is_fmcg) VALUES
('Coca-Cola Regular 355ml', 1, 'Beverages', 'Soft Drinks', 12.50, 18.00, 355, 'can', true),
('Coca-Cola Regular 1.5L', 1, 'Beverages', 'Soft Drinks', 35.00, 52.00, 1500, 'bottle', true),
('Pepsi Regular 355ml', 2, 'Beverages', 'Soft Drinks', 11.80, 17.50, 355, 'can', true),
('Sprite 355ml', 3, 'Beverages', 'Soft Drinks', 12.00, 17.00, 355, 'can', true),
('San Miguel Beer Pale Pilsen 330ml', 4, 'Alcoholic Beverages', 'Beer', 25.00, 42.00, 330, 'bottle', true),
('Red Horse Beer 500ml', 5, 'Alcoholic Beverages', 'Beer', 32.00, 55.00, 500, 'bottle', true),
('Lucky Me! Beef na Beef', 6, 'Instant Noodles', 'Cup Noodles', 8.50, 15.00, 0, 'cup', true),
('Pancit Canton Sweet Style', 7, 'Instant Noodles', 'Pancit', 6.25, 12.50, 0, 'pack', true),
('Maggi Magic Sarap 50g', 8, 'Seasoning', 'Seasoning Granules', 18.00, 28.00, 0, 'sachet', true),
('Tide Powder 1kg', 9, 'Detergent', 'Laundry Powder', 145.00, 198.00, 0, 'box', true),
('Surf Powder 1kg', 10, 'Detergent', 'Laundry Powder', 135.00, 185.00, 0, 'box', true),
('Ariel Powder 1kg', 11, 'Detergent', 'Laundry Powder', 142.00, 195.00, 0, 'box', true),
('Safeguard Soap Classic', 12, 'Personal Care', 'Bar Soap', 15.00, 25.00, 0, 'bar', true),
('Palmolive Naturals', 13, 'Personal Care', 'Bar Soap', 12.50, 22.00, 0, 'bar', true),
('Head & Shoulders Shampoo 340ml', 14, 'Personal Care', 'Shampoo', 125.00, 189.00, 340, 'bottle', true),
('Nescafé 3-in-1 Original', 15, 'Coffee', 'Instant Coffee', 45.00, 78.00, 0, 'pack', true);

-- Insert sample devices
INSERT INTO devices (device_name, store_id, device_type, status, firmware_version) VALUES
('POS-001-MEGA', 1, 'pos', 'active', '2.1.4'),
('POS-002-MEGA', 1, 'pos', 'active', '2.1.4'),
('POS-001-ROBIN', 2, 'pos', 'active', '2.1.3'),
('POS-001-GREN', 3, 'pos', 'active', '2.1.4'),
('POS-001-GATE', 4, 'pos', 'maintenance', '2.1.2'),
('POS-001-TRINO', 5, 'pos', 'active', '2.1.4'),
('POS-001-SARI', 6, 'pos', 'active', '2.0.8'),
('POS-001-MINI', 7, 'pos', 'active', '2.0.9'),
('POS-001-CEBU', 8, 'pos', 'active', '2.1.3'),
('POS-001-DAVAO', 9, 'pos', 'active', '2.1.4');

-- Insert sample transactions (last 30 days)
-- Note: Using recent dates for realistic analytics

-- Generate transactions for the last 30 days
-- This is a simplified version - in practice you'd want more sophisticated data generation

INSERT INTO transactions (transaction_id, store_id, customer_id, transaction_date, total_amount, payment_method) VALUES
('TXN20250601001', 1, 1, '2025-06-01 10:30:00', 356.50, 'cash'),
('TXN20250601002', 1, 2, '2025-06-01 11:15:00', 189.75, 'card'),
('TXN20250601003', 2, 3, '2025-06-01 14:22:00', 245.00, 'gcash'),
('TXN20250601004', 3, 4, '2025-06-01 16:45:00', 567.25, 'card'),
('TXN20250602001', 4, 5, '2025-06-02 09:15:00', 423.50, 'cash'),
('TXN20250602002', 5, 6, '2025-06-02 12:30:00', 198.00, 'card'),
('TXN20250602003', 6, 7, '2025-06-02 15:20:00', 89.50, 'cash'),
('TXN20250603001', 7, 8, '2025-06-03 08:45:00', 156.75, 'gcash'),
('TXN20250603002', 8, 9, '2025-06-03 13:10:00', 334.25, 'card'),
('TXN20250603003', 9, 10, '2025-06-03 17:30:00', 789.00, 'card'),
('TXN20250604001', 1, 1, '2025-06-04 11:20:00', 445.75, 'cash'),
('TXN20250604002', 2, 2, '2025-06-04 14:15:00', 267.50, 'card'),
('TXN20250605001', 3, 3, '2025-06-05 10:05:00', 123.25, 'gcash'),
('TXN20250605002', 4, 4, '2025-06-05 16:40:00', 678.90, 'card'),
('TXN20250606001', 5, 5, '2025-06-06 09:30:00', 234.50, 'cash'),
('TXN20250606002', 6, 6, '2025-06-06 12:45:00', 156.00, 'cash'),
('TXN20250607001', 7, 7, '2025-06-07 14:20:00', 89.75, 'gcash'),
('TXN20250607002', 8, 8, '2025-06-07 16:15:00', 345.25, 'card'),
('TXN20250608001', 9, 9, '2025-06-08 11:10:00', 567.50, 'card'),
('TXN20250608002', 10, 10, '2025-06-08 15:30:00', 423.75, 'cash');

-- Insert corresponding transaction items
INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, total_price) VALUES
-- Transaction 1: TXN20250601001 (Total: 356.50)
(1, 1, 3, 18.00, 54.00),    -- Coca-Cola cans
(1, 2, 2, 52.00, 104.00),   -- Coca-Cola 1.5L
(1, 6, 4, 15.00, 60.00),    -- Lucky Me noodles
(1, 12, 5, 25.00, 125.00),  -- Safeguard soap
(1, 16, 1, 78.00, 78.00),   -- Nescafé

-- Transaction 2: TXN20250601002 (Total: 189.75)
(2, 3, 2, 17.50, 35.00),    -- Pepsi cans
(2, 7, 3, 12.50, 37.50),    -- Pancit Canton
(2, 10, 1, 185.00, 185.00), -- Surf powder

-- Transaction 3: TXN20250601003 (Total: 245.00)
(3, 4, 4, 17.00, 68.00),    -- Sprite cans
(3, 8, 6, 12.50, 75.00),    -- Pancit Canton
(3, 13, 2, 22.00, 44.00),   -- Palmolive soap
(3, 14, 3, 22.00, 66.00),   -- More Palmolive

-- Continue with more transaction items for remaining transactions...
-- For brevity, showing pattern for first few transactions

-- Transaction 4: TXN20250601004 (Total: 567.25)
(4, 5, 3, 42.00, 126.00),   -- San Miguel Beer
(4, 9, 2, 28.00, 56.00),    -- Maggi
(4, 11, 2, 195.00, 390.00), -- Ariel powder

-- Transaction 5: TXN20250602001 (Total: 423.50)
(5, 1, 5, 18.00, 90.00),    -- Coca-Cola cans
(5, 6, 8, 15.00, 120.00),   -- Lucky Me noodles
(5, 15, 1, 189.00, 189.00), -- Head & Shoulders

-- Add more transaction items for remaining transactions...
(6, 2, 3, 52.00, 156.00),
(6, 7, 2, 12.50, 25.00),
(7, 1, 2, 18.00, 36.00),
(7, 12, 2, 25.00, 50.00),
(8, 3, 3, 17.50, 52.50),
(8, 8, 4, 12.50, 50.00),
(9, 4, 5, 17.00, 85.00),
(9, 9, 3, 28.00, 84.00),
(10, 5, 6, 42.00, 252.00),
(10, 10, 2, 185.00, 370.00);

-- Insert sample substitutions
INSERT INTO substitutions (original_product_id, substitute_product_id, substitution_reason, frequency, confidence_score) VALUES
(1, 3, 'Out of stock', 5, 0.85),      -- Coca-Cola -> Pepsi
(6, 7, 'Price preference', 3, 0.72),   -- Lucky Me -> Pancit Canton
(9, 10, 'Brand loyalty', 4, 0.68),     -- Tide -> Surf
(12, 13, 'Price comparison', 2, 0.79); -- Safeguard -> Palmolive

-- Insert sample customer requests
INSERT INTO customer_requests (customer_id, store_id, requested_product, request_type, status) VALUES
(1, 1, 'Diet Coke 355ml', 'product_request', 'fulfilled'),
(2, 2, 'Pringles Original', 'product_request', 'pending'),
(4, 8, 'Imported Beer', 'category_request', 'pending'),
(5, 9, 'Organic Shampoo', 'product_request', 'declined');

SELECT 'Sample data inserted successfully into Azure databases!' as status;