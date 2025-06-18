-- Scout Analytics v3 - Azure SQL Database Schema
-- Mirrors Supabase schema with Azure SQL compatibility

-- Create database (run this separately in Azure SQL)
-- CREATE DATABASE ScoutAnalyticsV3;
-- GO

USE ScoutAnalyticsV3;
GO

-- Drop existing tables and dependencies
IF OBJECT_ID('transaction_items', 'U') IS NOT NULL DROP TABLE transaction_items;
IF OBJECT_ID('substitutions', 'U') IS NOT NULL DROP TABLE substitutions;
IF OBJECT_ID('request_behaviors', 'U') IS NOT NULL DROP TABLE request_behaviors;
IF OBJECT_ID('customer_requests', 'U') IS NOT NULL DROP TABLE customer_requests;
IF OBJECT_ID('transactions', 'U') IS NOT NULL DROP TABLE transactions;
IF OBJECT_ID('product_detections', 'U') IS NOT NULL DROP TABLE product_detections;
IF OBJECT_ID('edge_logs', 'U') IS NOT NULL DROP TABLE edge_logs;
IF OBJECT_ID('device_health', 'U') IS NOT NULL DROP TABLE device_health;
IF OBJECT_ID('devices', 'U') IS NOT NULL DROP TABLE devices;
IF OBJECT_ID('customers', 'U') IS NOT NULL DROP TABLE customers;
IF OBJECT_ID('products', 'U') IS NOT NULL DROP TABLE products;
IF OBJECT_ID('brands', 'U') IS NOT NULL DROP TABLE brands;
IF OBJECT_ID('stores', 'U') IS NOT NULL DROP TABLE stores;
GO

-- Table: brands
CREATE TABLE brands (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    company NVARCHAR(500) NOT NULL,
    category NVARCHAR(255),
    is_tbwa BIT DEFAULT 0,
    market_share DECIMAL(5,2),
    created_at DATETIME2 DEFAULT GETUTCDATE()
);

-- Table: stores
CREATE TABLE stores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(500) NOT NULL UNIQUE,
    location NVARCHAR(1000),
    barangay NVARCHAR(255),
    city NVARCHAR(255),
    region NVARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    store_type NVARCHAR(100),
    size_category NVARCHAR(100),
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

-- Table: customers
CREATE TABLE customers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id NVARCHAR(100) NOT NULL UNIQUE,
    name NVARCHAR(500) NOT NULL,
    age INT,
    gender NVARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    region NVARCHAR(255) NOT NULL,
    city NVARCHAR(255),
    barangay NVARCHAR(255),
    loyalty_tier NVARCHAR(50) DEFAULT 'regular',
    total_spent DECIMAL(15,2) DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

-- Table: products
CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_name NVARCHAR(500) NOT NULL,
    brand_id INT NOT NULL,
    category NVARCHAR(255),
    subcategory NVARCHAR(255),
    unit_cost DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    size_ml INT,
    size_g INT,
    packaging_type NVARCHAR(100),
    is_fmcg BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (brand_id) REFERENCES brands(id)
);

-- Table: devices
CREATE TABLE devices (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    device_name NVARCHAR(255) NOT NULL,
    store_id INT NOT NULL,
    device_type NVARCHAR(100) DEFAULT 'pos',
    status NVARCHAR(50) DEFAULT 'active',
    last_ping DATETIME2,
    firmware_version NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Table: transactions
CREATE TABLE transactions (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    transaction_id NVARCHAR(100) NOT NULL UNIQUE,
    store_id INT NOT NULL,
    customer_id INT,
    device_id UNIQUEIDENTIFIER,
    transaction_date DATETIME2 NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method NVARCHAR(100),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Table: transaction_items
CREATE TABLE transaction_items (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    discount_applied DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Table: substitutions
CREATE TABLE substitutions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    original_product_id INT NOT NULL,
    substitute_product_id INT NOT NULL,
    substitution_reason NVARCHAR(500),
    frequency INT DEFAULT 1,
    confidence_score DECIMAL(3,2),
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (original_product_id) REFERENCES products(id),
    FOREIGN KEY (substitute_product_id) REFERENCES products(id)
);

-- Table: customer_requests
CREATE TABLE customer_requests (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT NOT NULL,
    store_id INT NOT NULL,
    requested_product NVARCHAR(500),
    request_type NVARCHAR(100),
    status NVARCHAR(50) DEFAULT 'pending',
    request_date DATETIME2 DEFAULT GETUTCDATE(),
    response_date DATETIME2,
    notes NVARCHAR(2000),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Table: request_behaviors
CREATE TABLE request_behaviors (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_request_id INT NOT NULL,
    behavior_type NVARCHAR(100),
    behavior_data NVARCHAR(MAX), -- JSON data
    recorded_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (customer_request_id) REFERENCES customer_requests(id)
);

-- Table: device_health
CREATE TABLE device_health (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    device_id UNIQUEIDENTIFIER NOT NULL,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    network_status NVARCHAR(50),
    temperature DECIMAL(5,2),
    uptime_hours INT,
    last_restart DATETIME2,
    health_score DECIMAL(3,2),
    recorded_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Table: edge_logs
CREATE TABLE edge_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    device_id UNIQUEIDENTIFIER NOT NULL,
    log_level NVARCHAR(20),
    message NVARCHAR(MAX),
    component NVARCHAR(100),
    error_code NVARCHAR(50),
    metadata NVARCHAR(MAX), -- JSON data
    logged_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Table: product_detections
CREATE TABLE product_detections (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    device_id UNIQUEIDENTIFIER NOT NULL,
    product_id INT,
    detected_name NVARCHAR(500),
    confidence_score DECIMAL(5,4),
    bounding_box NVARCHAR(500), -- JSON coordinates
    image_path NVARCHAR(1000),
    detection_method NVARCHAR(100),
    verified BIT DEFAULT 0,
    detected_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create indexes for better performance
CREATE INDEX IX_transactions_date ON transactions(transaction_date);
CREATE INDEX IX_transactions_store ON transactions(store_id);
CREATE INDEX IX_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX IX_transaction_items_product ON transaction_items(product_id);
CREATE INDEX IX_products_brand ON products(brand_id);
CREATE INDEX IX_products_category ON products(category);
CREATE INDEX IX_customers_region ON customers(region);
CREATE INDEX IX_stores_region ON stores(region);

-- Create views for dashboard analytics
GO
CREATE VIEW daily_sales AS
SELECT 
    CAST(t.transaction_date AS DATE) as sale_date,
    s.region,
    s.city,
    SUM(t.total_amount) as total_revenue,
    COUNT(t.id) as transaction_count,
    COUNT(DISTINCT t.customer_id) as unique_customers
FROM transactions t
JOIN stores s ON t.store_id = s.id
GROUP BY CAST(t.transaction_date AS DATE), s.region, s.city;
GO

CREATE VIEW product_performance AS
SELECT 
    p.id as product_id,
    p.product_name,
    b.name as brand_name,
    p.category,
    SUM(ti.quantity) as total_quantity_sold,
    SUM(ti.total_price) as total_revenue,
    COUNT(DISTINCT ti.transaction_id) as transaction_count,
    AVG(ti.unit_price) as avg_selling_price
FROM products p
JOIN brands b ON p.brand_id = b.id
JOIN transaction_items ti ON p.id = ti.product_id
GROUP BY p.id, p.product_name, b.name, p.category;
GO

PRINT 'Azure SQL Database schema created successfully!';