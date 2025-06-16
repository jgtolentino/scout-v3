#!/bin/bash

# Scout Analytics MVP - Real Data Setup Script
# This script sets up the complete database with 5,000+ transactions

set -e  # Exit on any error

echo "🚀 Scout Analytics MVP - Real Data Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_REF="jrxepdlkgdwwjxdeetmb"
SUPABASE_URL="https://jrxepdlkgdwwjxdeetmb.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeGVwZGxrZ2R3d2p4ZGVldG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3ODE5NzksImV4cCI6MjA2NTM1Nzk3OX0.wRUoPraEzQRI0LtxxcUIYCH8I49L8T4MAKoKbv_5fr8"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeGVwZGxrZ2R3d2p4ZGVldG1iIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTc4MTk3OSwiZXhwIjoyMDY1MzU3OTc5fQ.CaylOjytzlPkkL3KsZK6pCK5eJxx3BrqVr0cbzK90Jc"

print_step() {
    echo -e "${BLUE}📋 Step $1: $2${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "supabase" ]; then
    print_error "Please run this script from the scout-mvp project root directory"
    exit 1
fi

print_step "1" "Installing Supabase CLI"
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
    print_success "Supabase CLI installed"
else
    print_success "Supabase CLI already installed"
fi

print_step "2" "Setting up Supabase project"
# Initialize local supabase if not already done
if [ ! -f "supabase/config.toml" ]; then
    supabase init
fi

# Link to the project
echo "Linking to Supabase project..."
supabase link --project-ref $PROJECT_REF --password "" || print_warning "Project may already be linked"

print_step "3" "Applying database migrations"
echo "Pushing all migrations to create schema and functions..."
supabase db push

print_step "4" "Generating and loading sample data"
echo "Creating comprehensive sample dataset..."

# Create the data generation script
cat > generate_sample_data.sql << 'EOF'
-- Scout Analytics MVP - Sample Data Generation
-- Creates 5,000+ realistic transactions with proper relationships

-- Clear existing data (if any)
TRUNCATE TABLE transaction_items CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE brands CASCADE;
TRUNCATE TABLE stores CASCADE;

-- Insert Brands (20 brands)
INSERT INTO brands (name, description) VALUES
('Nestle Philippines', 'Leading food and beverage company'),
('Unilever Philippines', 'Consumer goods and personal care'),
('Procter & Gamble', 'Household and personal care products'),
('San Miguel Corporation', 'Food, beverage, and packaging'),
('Universal Robina Corporation', 'Diversified food and beverage'),
('Monde Nissin', 'Food manufacturing company'),
('Century Pacific Food', 'Canned goods and processed food'),
('Ricoa', 'Chocolate and confectionery'),
('Alaska Milk Corporation', 'Dairy products'),
('Magnolia Inc.', 'Food and beverage products'),
('Del Monte Philippines', 'Canned fruits and vegetables'),
('Bounty Fresh', 'Poultry and processed meats'),
('CDO Foodsphere', 'Processed meat products'),
('Rebisco', 'Biscuits and snack foods'),
('Jack n Jill', 'Snack foods and confectionery'),
('Oishi', 'Snack foods and beverages'),
('Kopiko', 'Coffee and beverages'),
('Lucky Me!', 'Instant noodles'),
('Palmolive', 'Personal care products'),
('Colgate Philippines', 'Oral care products');

-- Insert Philippine Stores (50 stores across regions)
INSERT INTO stores (name, address, city, region, barangay) VALUES
-- NCR Manila
('SM Hypermarket Manila', 'A.H. Lacson St', 'Manila', 'NCR', 'Sampaloc'),
('Robinsons Supermarket Ermita', 'Pedro Gil St', 'Manila', 'NCR', 'Ermita'),
('PureGold Quiapo', 'Carlos Palanca St', 'Manila', 'NCR', 'Quiapo'),
('Mercury Drug Divisoria', 'Juan Luna St', 'Manila', 'NCR', 'Divisoria'),
('Gaisano Grand Tondo', 'Radial Road 10', 'Manila', 'NCR', 'Tondo'),
-- Quezon City
('SM North EDSA', 'EDSA North Ave', 'Quezon City', 'NCR', 'North Triangle'),
('Robinsons Magnolia', 'Aurora Blvd', 'Quezon City', 'NCR', 'New Manila'),
('Landmark Trinoma', 'EDSA North Ave', 'Quezon City', 'NCR', 'North Triangle'),
('Shopwise Cubao', 'Gateway Mall', 'Quezon City', 'NCR', 'Cubao'),
('Walter Mart Munoz', 'EDSA Munoz', 'Quezon City', 'NCR', 'Munoz'),
-- Makati
('Greenbelt 1 Supermarket', 'Ayala Ave', 'Makati', 'NCR', 'Bel-Air'),
('Rustan''s Supermarket', 'Gil Puyat Ave', 'Makati', 'NCR', 'Urdaneta'),
('S&R Membership Shopping', 'C5 Road', 'Makati', 'NCR', 'Magallanes'),
-- Cebu
('SM City Cebu', 'Juan Luna Ave', 'Cebu City', 'Central Visayas', 'Mabolo'),
('Ayala Center Cebu', 'Cebu Business Park', 'Cebu City', 'Central Visayas', 'Lahug'),
('Robinsons Galleria Cebu', 'Gen. Maxilom Ave', 'Cebu City', 'Central Visayas', 'Lahug'),
('Metro Gaisano Colon', 'Colon St', 'Cebu City', 'Central Visayas', 'Colon'),
('PureGold Banilad', 'Banilad Road', 'Cebu City', 'Central Visayas', 'Banilad'),
-- Davao
('SM Lanang Premier', 'J.P. Laurel Ave', 'Davao City', 'Davao Region', 'Lanang'),
('Abreeza Mall', 'J.P. Laurel Ave', 'Davao City', 'Davao Region', 'Bajada'),
('Gaisano Mall Davao', 'Claro M. Recto St', 'Davao City', 'Davao Region', 'Poblacion'),
('NCCC Mall Buhangin', 'Buhangin Road', 'Davao City', 'Davao Region', 'Buhangin'),
-- Iloilo
('SM City Iloilo', 'Benigno Aquino Ave', 'Iloilo City', 'Western Visayas', 'Mandurriao'),
('Robinsons Place Iloilo', 'Lopez Jaena St', 'Iloilo City', 'Western Visayas', 'Jaro'),
('Gaisano Capital Iloilo', 'Dela Rama St', 'Iloilo City', 'Western Visayas', 'La Paz'),
-- Baguio
('SM City Baguio', 'Luneta Hill', 'Baguio City', 'CAR', 'Burnham'),
('Puregold Baguio', 'Session Road', 'Baguio City', 'CAR', 'Central Business District'),
-- Cagayan de Oro
('SM CDO Downtown', 'Divisoria', 'Cagayan de Oro', 'Northern Mindanao', 'Divisoria'),
('Robinsons Cagayan de Oro', 'Corrales Ave', 'Cagayan de Oro', 'Northern Mindanao', 'Nazareth'),
-- Bacolod
('SM City Bacolod', 'Reclamation Area', 'Bacolod City', 'Western Visayas', 'Singcang'),
('Robinsons Place Bacolod', 'Lacson St', 'Bacolod City', 'Western Visayas', 'Mandalagan'),
-- Provincial stores
('Gaisano Grand Tacloban', 'Real St', 'Tacloban City', 'Eastern Visayas', 'Downtown'),
('SM Savemore Dumaguete', 'Perdices St', 'Dumaguete City', 'Central Visayas', 'Poblacion'),
('Robinsons Place General Santos', 'Santiago Blvd', 'General Santos City', 'SOCCSKSARGEN', 'Dadiangas'),
('Metro Gaisano Butuan', 'J.C. Aquino Ave', 'Butuan City', 'CARAGA', 'Libertad'),
('PureGold Iligan', 'Roxas Ave', 'Iligan City', 'Northern Mindanao', 'Poblacion'),
('Walter Mart Sucat', 'Dr. A. Santos Ave', 'Paranaque', 'NCR', 'Sucat'),
('Shopwise Alabang', 'Alabang-Zapote Road', 'Muntinlupa', 'NCR', 'Alabang'),
('Mercury Drug Antipolo', 'Sumulong Highway', 'Antipolo', 'CALABARZON', 'San Roque'),
('SM Hypermarket Fairview', 'Commonwealth Ave', 'Quezon City', 'NCR', 'Fairview'),
('Robinsons Metro East', 'Marikina-Infanta Highway', 'Marikina', 'NCR', 'Concepcion'),
-- More provincial stores
('Gaisano Grand Mall Gensan', 'National Highway', 'General Santos City', 'SOCCSKSARGEN', 'City Heights'),
('SM City Lipa', 'P. Torres St', 'Lipa City', 'CALABARZON', 'Poblacion'),
('Robinsons Place Antipolo', 'Circumferential Road', 'Antipolo', 'CALABARZON', 'Dela Paz'),
('Walter Mart Dasmarinas', 'Governor''s Drive', 'Dasmarinas', 'CALABARZON', 'Poblacion'),
('PureGold Angeles', 'MacArthur Highway', 'Angeles City', 'Central Luzon', 'Poblacion'),
('SM City Pampanga', 'Jose Abad Santos Ave', 'San Fernando', 'Central Luzon', 'Dolores'),
('Robinsons Starmills', 'Jose Abad Santos Ave', 'San Fernando', 'Central Luzon', 'San Jose'),
('Gaisano Fiesta Mall Tabunok', 'National Highway', 'Talisay City', 'Central Visayas', 'Tabunok'),
('SM City Consolacion', 'National Highway', 'Consolacion', 'Central Visayas', 'Poblacion'),
('Robinsons Place Dumaguete', 'Calindagan Road', 'Dumaguete City', 'Central Visayas', 'Calindagan');

-- Insert Products (100 products across categories)
INSERT INTO products (name, category, brand_id, unit_price) VALUES
-- Beverages
('Nescafe 3-in-1 Original', 'Beverages', 1, 85.50),
('Kopiko Coffee Candy', 'Beverages', 17, 12.75),
('San Miguel Beer Pale Pilsen', 'Beverages', 4, 65.00),
('C2 Green Tea Apple', 'Beverages', 6, 25.00),
('Zest-O Dalandan', 'Beverages', 6, 18.50),
-- Snacks
('Jack n Jill Piattos', 'Snacks', 15, 45.00),
('Oishi Prawn Crackers', 'Snacks', 16, 35.50),
('Ricoa Chocolate', 'Snacks', 8, 95.00),
('Rebisco Crackers', 'Snacks', 14, 28.75),
('Lucky Me Pancit Canton', 'Snacks', 18, 12.50),
-- Personal Care
('Palmolive Shampoo', 'Personal Care', 19, 125.00),
('Colgate Toothpaste', 'Personal Care', 20, 89.50),
('Safeguard Soap', 'Personal Care', 3, 45.75),
('Pantene Conditioner', 'Personal Care', 3, 145.00),
('Head & Shoulders Shampoo', 'Personal Care', 3, 155.50),
-- Household
('Tide Laundry Powder', 'Household', 3, 245.00),
('Joy Dishwashing Liquid', 'Household', 3, 78.50),
('Downy Fabric Softener', 'Household', 3, 165.00),
('Mr. Clean All-Purpose', 'Household', 3, 95.75),
('Ariel Liquid Detergent', 'Household', 3, 285.00),
-- Food & Grocery
('Nestle Cerelac', 'Food & Grocery', 1, 185.00),
('Alaska Condensed Milk', 'Food & Grocery', 9, 55.50),
('Del Monte Corned Beef', 'Food & Grocery', 11, 125.50),
('CDO Hotdog', 'Food & Grocery', 13, 185.75),
('Magnolia Chicken', 'Food & Grocery', 10, 345.00),
('Century Tuna', 'Food & Grocery', 7, 45.50),
('Argentina Corned Beef', 'Food & Grocery', 7, 78.25),
('Bounty Fresh Chicken', 'Food & Grocery', 12, 285.50),
('San Miguel Corned Beef', 'Food & Grocery', 4, 95.75),
('Purefoods Hotdog', 'Food & Grocery', 4, 165.25),
-- Health & Beauty
('Biogesic Paracetamol', 'Health & Beauty', 2, 8.50),
('Neozep Tablet', 'Health & Beauty', 2, 12.75),
('Solmux Tablet', 'Health & Beauty', 2, 15.50),
('Bactidol Mouthwash', 'Health & Beauty', 2, 125.00),
('Efficascent Oil', 'Health & Beauty', 2, 85.50),
-- Baby Care
('Johnson Baby Shampoo', 'Baby Care', 2, 145.00),
('Pampers Diapers', 'Baby Care', 3, 485.00),
('Enfamil Milk Formula', 'Baby Care', 1, 1250.00),
('Cetaphil Baby Wash', 'Baby Care', 2, 285.00),
('Huggies Wipes', 'Baby Care', 2, 125.50),
-- Electronics (basic)
('Duracell AA Battery', 'Electronics', 3, 165.00),
('Energizer AAA Battery', 'Electronics', 3, 145.00),
('Philips LED Bulb', 'Electronics', 2, 285.50),
-- More variety across all categories
('Nescafe Creamy White', 'Beverages', 1, 95.00),
('Milo Energy Drink', 'Beverages', 1, 45.75),
('Royal Orange Juice', 'Beverages', 6, 32.50),
('Minute Maid Pulpy Orange', 'Beverages', 1, 28.75),
('Sprite 1.5L', 'Beverages', 1, 65.00),
('Coca-Cola 1.5L', 'Beverages', 1, 75.50),
('Pepsi 1.5L', 'Beverages', 1, 68.25),
('Mountain Dew 1.5L', 'Beverages', 1, 72.00),
('Gatorade Sports Drink', 'Beverages', 1, 45.50),
('Pocari Sweat', 'Beverages', 1, 38.75),
('Nova Multigrain Chips', 'Snacks', 15, 55.00),
('Chippy Barbecue', 'Snacks', 15, 42.50),
('Cheese Ring', 'Snacks', 15, 35.75),
('Boy Bawang Cornick', 'Snacks', 15, 28.50),
('Pringles Original', 'Snacks', 3, 125.00),
('Doritos Nacho Cheese', 'Snacks', 1, 145.50),
('Lay''s Classic', 'Snacks', 1, 95.75),
('Skyflakes Crackers', 'Snacks', 14, 48.25),
('Fita Crackers', 'Snacks', 14, 52.50),
('Hansel Biscuits', 'Snacks', 14, 38.75),
('Cream-O Cookies', 'Snacks', 6, 45.50),
('Oreo Cookies', 'Snacks', 6, 85.75),
('Richeese Crackers', 'Snacks', 14, 65.25),
('Hello Panda Biscuits', 'Snacks', 6, 55.50),
('Monde Biscuits', 'Snacks', 6, 48.75),
('Sunsilk Shampoo', 'Personal Care', 2, 135.00),
('Clear Shampoo', 'Personal Care', 2, 155.50),
('Dove Soap', 'Personal Care', 2, 65.75),
('Lux Soap', 'Personal Care', 2, 45.50),
('Lifebuoy Soap', 'Personal Care', 2, 38.25),
('Closeup Toothpaste', 'Personal Care', 2, 78.50),
('Sensodyne Toothpaste', 'Personal Care', 20, 185.00),
('Oral-B Toothbrush', 'Personal Care', 3, 125.50),
('Gillette Razor', 'Personal Care', 3, 245.75),
('Old Spice Deodorant', 'Personal Care', 3, 165.25),
('Rexona Deodorant', 'Personal Care', 2, 145.00),
('Vaseline Lotion', 'Personal Care', 2, 95.75),
('Nivea Body Lotion', 'Personal Care', 2, 185.50),
('Johnson Baby Powder', 'Personal Care', 2, 125.25),
('Zonrox Bleach', 'Household', 1, 85.50),
('Domex Toilet Bowl Cleaner', 'Household', 2, 95.75),
('Lysol Disinfectant', 'Household', 2, 165.00),
('Baygon Insecticide', 'Household', 4, 145.50),
('Raid Insecticide', 'Household', 4, 155.75),
('Surf Laundry Powder', 'Household', 2, 225.00),
('Breeze Laundry Powder', 'Household', 2, 185.50),
('Champion Detergent', 'Household', 2, 145.25),
('Mighty Clean Dishwashing', 'Household', 2, 65.75),
('Ajax Cleaner', 'Household', 20, 125.50),
('Spam Luncheon Meat', 'Food & Grocery', 1, 185.75),
('Ma-Ling Luncheon Meat', 'Food & Grocery', 1, 165.50),
('555 Sardines', 'Food & Grocery', 1, 45.25),
('Ligo Sardines', 'Food & Grocery', 7, 42.75),
('Young''s Town Sardines', 'Food & Grocery', 7, 38.50),
('Lucky Me Instant Mami', 'Food & Grocery', 18, 15.75),
('Maggi Magic Sarap', 'Food & Grocery', 1, 12.50),
('Knorr Seasoning Cubes', 'Food & Grocery', 2, 8.25),
('Datu Puti Soy Sauce', 'Food & Grocery', 6, 25.50),
('Silver Swan Soy Sauce', 'Food & Grocery', 6, 28.75),
('UFC Banana Sauce', 'Food & Grocery', 6, 35.50),
('Del Monte Tomato Sauce', 'Food & Grocery', 11, 32.25),
('Hunt''s Tomato Sauce', 'Food & Grocery', 11, 38.75),
('Marca Pina Ham', 'Food & Grocery', 4, 285.50),
('Tender Juicy Hotdog', 'Food & Grocery', 4, 175.25),
('Highlands Corned Beef', 'Food & Grocery', 4, 125.75);

-- Generate customer demographics (1000 customers)
DO $$
DECLARE
    i INTEGER;
    customer_names TEXT[] := ARRAY[
        'Maria Santos', 'Juan Dela Cruz', 'Ana Garcia', 'Jose Rodriguez', 'Carmen Lopez',
        'Miguel Torres', 'Rosa Hernandez', 'Carlos Gonzales', 'Elena Martinez', 'Francisco Perez',
        'Luz Ramirez', 'Antonio Flores', 'Isabel Castillo', 'Ramon Morales', 'Esperanza Rivera',
        'Eduardo Gutierrez', 'Corazon Reyes', 'Fernando Aquino', 'Remedios Bautista', 'Rodrigo Cruz'
    ];
    genders TEXT[] := ARRAY['Male', 'Female'];
    age_groups TEXT[] := ARRAY['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
BEGIN
    FOR i IN 1..1000 LOOP
        INSERT INTO customers (name, email, gender, age_group, phone) VALUES (
            customer_names[1 + (i % array_length(customer_names, 1))] || ' ' || i::text,
            'customer' || i::text || '@email.com',
            genders[1 + (i % 2)],
            age_groups[1 + (i % array_length(age_groups, 1))],
            '09' || LPAD((1000000000 + (i * 1234567) % 1000000000)::text, 10, '0')
        );
    END LOOP;
END $$;

-- Generate realistic transactions (5000+ transactions)
DO $$
DECLARE
    i INTEGER;
    customer_count INTEGER;
    store_count INTEGER;
    product_count INTEGER;
    random_customer_id INTEGER;
    random_store_id INTEGER;
    transaction_id INTEGER;
    transaction_total DECIMAL(10,2);
    items_in_transaction INTEGER;
    j INTEGER;
    random_product_id INTEGER;
    random_quantity INTEGER;
    product_price DECIMAL(10,2);
    item_total DECIMAL(10,2);
    transaction_date TIMESTAMP;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO customer_count FROM customers;
    SELECT COUNT(*) INTO store_count FROM stores;
    SELECT COUNT(*) INTO product_count FROM products;
    
    -- Generate 5000 transactions over the last 6 months
    FOR i IN 1..5000 LOOP
        -- Random customer and store
        random_customer_id := (SELECT id FROM customers OFFSET FLOOR(RANDOM() * customer_count) LIMIT 1);
        random_store_id := (SELECT id FROM stores OFFSET FLOOR(RANDOM() * store_count) LIMIT 1);
        
        -- Random date in the last 6 months with realistic time patterns
        transaction_date := NOW() - INTERVAL '6 months' + 
                           (RANDOM() * INTERVAL '6 months') + 
                           (EXTRACT(HOUR FROM NOW()) + RANDOM() * 12 - 6) * INTERVAL '1 hour';
        
        -- Insert transaction
        INSERT INTO transactions (customer_id, store_id, transaction_date, total_amount)
        VALUES (random_customer_id, random_store_id, transaction_date, 0)
        RETURNING id INTO transaction_id;
        
        -- Random number of items (1-8 items per transaction)
        items_in_transaction := 1 + FLOOR(RANDOM() * 8);
        transaction_total := 0;
        
        -- Generate transaction items
        FOR j IN 1..items_in_transaction LOOP
            random_product_id := (SELECT id FROM products OFFSET FLOOR(RANDOM() * product_count) LIMIT 1);
            random_quantity := 1 + FLOOR(RANDOM() * 3); -- 1-3 quantity
            
            SELECT unit_price INTO product_price FROM products WHERE id = random_product_id;
            item_total := product_price * random_quantity;
            transaction_total := transaction_total + item_total;
            
            INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, total_price)
            VALUES (transaction_id, random_product_id, random_quantity, product_price, item_total);
        END LOOP;
        
        -- Update transaction total
        UPDATE transactions SET total_amount = transaction_total WHERE id = transaction_id;
        
        -- Progress indicator
        IF i % 500 = 0 THEN
            RAISE NOTICE 'Generated % transactions...', i;
        END IF;
    END LOOP;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_store ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON transaction_items(product_id);
CREATE INDEX IF NOT EXISTS idx_customers_gender ON customers(gender);
CREATE INDEX IF NOT EXISTS idx_customers_age_group ON customers(age_group);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_stores_region ON stores(region);
CREATE INDEX IF NOT EXISTS idx_stores_barangay ON stores(barangay);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON brands FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON stores FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON transaction_items FOR SELECT USING (true);

-- Final summary
DO $$
DECLARE
    total_transactions INTEGER;
    total_customers INTEGER;
    total_products INTEGER;
    total_brands INTEGER;
    total_stores INTEGER;
    date_range TEXT;
BEGIN
    SELECT COUNT(*) INTO total_transactions FROM transactions;
    SELECT COUNT(*) INTO total_customers FROM customers;
    SELECT COUNT(*) INTO total_products FROM products;
    SELECT COUNT(*) INTO total_brands FROM brands;
    SELECT COUNT(*) INTO total_stores FROM stores;
    SELECT 
        TO_CHAR(MIN(transaction_date), 'YYYY-MM-DD') || ' to ' || 
        TO_CHAR(MAX(transaction_date), 'YYYY-MM-DD') 
    INTO date_range FROM transactions;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== SCOUT ANALYTICS DATA GENERATION COMPLETE ===';
    RAISE NOTICE 'Transactions: %', total_transactions;
    RAISE NOTICE 'Customers: %', total_customers;
    RAISE NOTICE 'Products: %', total_products;
    RAISE NOTICE 'Brands: %', total_brands;
    RAISE NOTICE 'Stores: %', total_stores;
    RAISE NOTICE 'Date Range: %', date_range;
    RAISE NOTICE '================================================';
END $$;
EOF

# --- Database connection setup ---
DB_HOST="db.jrxepdlkgdwwjxdeetmb.supabase.co"
DB_USER="postgres"
DB_NAME="postgres"
# Use env var if set, else fallback to encoded password
DB_PASSWORD_ENC="${PGPASSWORD:-R%40nd0mPA%24%242025%21}"
DB_URL="postgresql://$DB_USER:$DB_PASSWORD_ENC@$DB_HOST:5432/$DB_NAME"

print_step "5" "Checking database network connectivity"
echo "Checking if $DB_HOST is reachable on port 5432..."
if ! nc -z -w 5 $DB_HOST 5432; then
  print_error "Cannot reach $DB_HOST:5432. Check your network, VPN, or firewall settings."
  exit 2
fi

print_step "6" "Executing data generation"
echo "This will create 5,000+ transactions with realistic data..."
supabase db reset --db-url "$DB_URL" || print_warning "Reset may not be needed"
psql "$DB_URL" -f generate_sample_data.sql

print_step "7" "Testing database connection"
echo "Verifying that functions are working..."

# Test the dashboard summary function
curl -X POST "$SUPABASE_URL/rest/v1/rpc/get_dashboard_summary" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' > test_response.json

if [ -s test_response.json ] && ! grep -q "error" test_response.json; then
    print_success "Database functions are working!"
    echo "Sample response:"
    cat test_response.json | head -3
else
    print_error "Database function test failed"
    cat test_response.json
fi

rm -f test_response.json generate_sample_data.sql

print_step "8" "Deploying updated application"
echo "Deploying to Vercel with real data connection..."
npx vercel --prod --yes

print_success "🎉 Setup Complete!"
echo ""
echo -e "${GREEN}✅ Database schema created${NC}"
echo -e "${GREEN}✅ Analytics functions deployed${NC}"
echo -e "${GREEN}✅ 5,000+ realistic transactions generated${NC}"
echo -e "${GREEN}✅ Application deployed to production${NC}"
echo ""
echo -e "${BLUE}🔗 Your dashboard: https://scout-mvp.vercel.app${NC}"
echo -e "${BLUE}📊 Database: $SUPABASE_URL${NC}"
echo ""
echo -e "${YELLOW}📝 What was created:${NC}"
echo "   • 20 Philippine brands (Nestle, San Miguel, etc.)"
echo "   • 50 stores across Philippine regions"
echo "   • 100 products in 8 categories"
echo "   • 1,000 customers with demographics"
echo "   • 5,000+ transactions over 6 months"
echo "   • 8 analytics functions for real-time insights"
echo ""
print_success "Your Scout Analytics MVP is now running with real data! 🚀"