#!/usr/bin/env python3
"""
Scout Analytics - Comprehensive FMCG Dataset Generator
Generates 5,000 realistic FMCG transactions across 17 Philippine regions
with specified brands and competitors, weighted toward mega cities.
"""

import json
import random
import uuid
from datetime import datetime, timedelta
from decimal import Decimal

# Philippine regions with population-based weights (mega cities get higher weight)
REGIONS = {
    "National Capital Region (NCR)": 0.35,      # Metro Manila - highest weight
    "CALABARZON": 0.15,                         # Laguna, Batangas, etc.
    "Central Luzon": 0.12,                      # Pampanga, Bulacan, etc.
    "Western Visayas": 0.08,                    # Iloilo, Bacolod
    "Central Visayas": 0.07,                    # Cebu, Bohol
    "Northern Mindanao": 0.05,                  # Cagayan de Oro
    "Davao Region": 0.05,                       # Davao City
    "Ilocos Region": 0.04,                      # Vigan, Laoag
    "Bicol Region": 0.03,                       # Legazpi, Naga
    "Eastern Visayas": 0.02,                    # Tacloban
    "Soccsksargen": 0.02,                       # General Santos
    "Zamboanga Peninsula": 0.015,               # Zamboanga City
    "Cagayan Valley": 0.015,                    # Tuguegarao
    "Mimaropa": 0.01,                           # Puerto Princesa
    "Cordillera Administrative Region": 0.01,   # Baguio
    "Caraga": 0.005,                            # Butuan
    "Bangsamoro": 0.005                         # Cotabato
}

# Comprehensive FMCG brand portfolio with competitors
BRANDS_PORTFOLIO = {
    # 🥛 DAIRY & MILK PRODUCTS
    "Alaska Evaporated Milk": {"category": "Dairy", "unit_cost": 28.50, "price_range": (35, 45), "market_share": 0.25},
    "Alaska Condensed Milk": {"category": "Dairy", "unit_cost": 32.00, "price_range": (40, 55), "market_share": 0.22},
    "Alaska Powdered Milk": {"category": "Dairy", "unit_cost": 285.00, "price_range": (350, 420), "market_share": 0.18},
    "Krem-Top Coffee Creamer": {"category": "Dairy", "unit_cost": 12.00, "price_range": (15, 22), "market_share": 0.15},
    "Alpine Evaporated Milk": {"category": "Dairy", "unit_cost": 27.00, "price_range": (33, 42), "market_share": 0.12},
    "Alpine Condensed Milk": {"category": "Dairy", "unit_cost": 30.50, "price_range": (38, 52), "market_share": 0.10},
    "Cow Bell Powdered Milk": {"category": "Dairy", "unit_cost": 275.00, "price_range": (340, 410), "market_share": 0.08},
    
    # Dairy Competitors
    "Nestle Evaporated Milk": {"category": "Dairy", "unit_cost": 30.00, "price_range": (37, 48), "market_share": 0.20},
    "Liberty Condensed Milk": {"category": "Dairy", "unit_cost": 29.00, "price_range": (36, 50), "market_share": 0.08},
    "Bear Brand Powdered Milk": {"category": "Dairy", "unit_cost": 290.00, "price_range": (360, 440), "market_share": 0.15},
    "Anchor Powdered Milk": {"category": "Dairy", "unit_cost": 310.00, "price_range": (380, 460), "market_share": 0.12},
    
    # 🍟 SNACKS & PROCESSED FOODS
    "Oishi Prawn Crackers": {"category": "Snacks", "unit_cost": 8.50, "price_range": (12, 18), "market_share": 0.30},
    "Oishi Pillows": {"category": "Snacks", "unit_cost": 6.00, "price_range": (8, 14), "market_share": 0.25},
    "Oishi Marty's": {"category": "Snacks", "unit_cost": 4.50, "price_range": (6, 10), "market_share": 0.20},
    "Oishi Ridges": {"category": "Snacks", "unit_cost": 7.00, "price_range": (10, 15), "market_share": 0.18},
    "Oishi Bread Pan": {"category": "Snacks", "unit_cost": 5.50, "price_range": (7, 12), "market_share": 0.15},
    "Gourmet Picks": {"category": "Snacks", "unit_cost": 9.00, "price_range": (13, 20), "market_share": 0.12},
    "Crispy Patata": {"category": "Snacks", "unit_cost": 5.00, "price_range": (7, 11), "market_share": 0.10},
    "Smart C+ Vitamin Drinks": {"category": "Beverages", "unit_cost": 15.00, "price_range": (20, 28), "market_share": 0.15},
    "Oaties": {"category": "Snacks", "unit_cost": 6.50, "price_range": (9, 14), "market_share": 0.08},
    "Hi-Ho": {"category": "Snacks", "unit_cost": 7.50, "price_range": (10, 16), "market_share": 0.07},
    "Rinbee": {"category": "Snacks", "unit_cost": 3.50, "price_range": (5, 8), "market_share": 0.06},
    "Deli Mex": {"category": "Snacks", "unit_cost": 8.00, "price_range": (11, 17), "market_share": 0.05},
    
    # Snacks Competitors
    "Lays Potato Chips": {"category": "Snacks", "unit_cost": 9.50, "price_range": (13, 19), "market_share": 0.22},
    "Pringles": {"category": "Snacks", "unit_cost": 45.00, "price_range": (65, 85), "market_share": 0.18},
    "Jack n Jill Nova": {"category": "Snacks", "unit_cost": 6.00, "price_range": (8, 13), "market_share": 0.20},
    "Richeese Nabati": {"category": "Snacks", "unit_cost": 5.50, "price_range": (7, 12), "market_share": 0.15},
    "Cheetos": {"category": "Snacks", "unit_cost": 8.00, "price_range": (11, 16), "market_share": 0.12},
    
    # 🧼 PERSONAL CARE & HOUSEHOLD
    "Champion Detergent": {"category": "Household", "unit_cost": 12.50, "price_range": (18, 25), "market_share": 0.25},
    "Champion Fabric Conditioner": {"category": "Household", "unit_cost": 15.00, "price_range": (22, 30), "market_share": 0.20},
    "Calla Personal Care": {"category": "Personal Care", "unit_cost": 25.00, "price_range": (35, 50), "market_share": 0.15},
    "Hana Shampoo": {"category": "Personal Care", "unit_cost": 45.00, "price_range": (65, 85), "market_share": 0.18},
    "Hana Conditioner": {"category": "Personal Care", "unit_cost": 48.00, "price_range": (68, 90), "market_share": 0.16},
    "Cyclone Bleach": {"category": "Household", "unit_cost": 18.00, "price_range": (25, 35), "market_share": 0.12},
    "Pride Dishwashing Liquid": {"category": "Household", "unit_cost": 22.00, "price_range": (32, 45), "market_share": 0.14},
    "Care Plus Alcohol": {"category": "Personal Care", "unit_cost": 35.00, "price_range": (50, 70), "market_share": 0.20},
    "Care Plus Hand Sanitizer": {"category": "Personal Care", "unit_cost": 28.00, "price_range": (40, 60), "market_share": 0.18},
    
    # Personal Care & Household Competitors
    "Ariel Detergent": {"category": "Household", "unit_cost": 14.00, "price_range": (20, 28), "market_share": 0.30},
    "Tide Detergent": {"category": "Household", "unit_cost": 16.00, "price_range": (23, 32), "market_share": 0.25},
    "Downy Fabric Conditioner": {"category": "Household", "unit_cost": 18.00, "price_range": (26, 35), "market_share": 0.35},
    "Pantene Shampoo": {"category": "Personal Care", "unit_cost": 55.00, "price_range": (80, 110), "market_share": 0.25},
    "Head & Shoulders": {"category": "Personal Care", "unit_cost": 60.00, "price_range": (85, 120), "market_share": 0.20},
    "Clorox Bleach": {"category": "Household", "unit_cost": 20.00, "price_range": (28, 40), "market_share": 0.30},
    "Joy Dishwashing Liquid": {"category": "Household", "unit_cost": 24.00, "price_range": (35, 50), "market_share": 0.40},
    
    # 🍅 FOOD & CONDIMENTS
    "Del Monte Pineapple Juice": {"category": "Beverages", "unit_cost": 35.00, "price_range": (50, 70), "market_share": 0.35},
    "Del Monte Pineapple Chunks": {"category": "Canned Goods", "unit_cost": 28.00, "price_range": (40, 55), "market_share": 0.30},
    "Del Monte Tomato Sauce": {"category": "Condiments", "unit_cost": 12.00, "price_range": (18, 25), "market_share": 0.40},
    "Del Monte Ketchup": {"category": "Condiments", "unit_cost": 25.00, "price_range": (35, 50), "market_share": 0.35},
    "Del Monte Spaghetti Sauce": {"category": "Condiments", "unit_cost": 22.00, "price_range": (32, 45), "market_share": 0.30},
    "Del Monte Fruit Cocktail": {"category": "Canned Goods", "unit_cost": 32.00, "price_range": (45, 65), "market_share": 0.25},
    "Del Monte Pasta": {"category": "Dry Goods", "unit_cost": 18.00, "price_range": (25, 38), "market_share": 0.20},
    "S&W Premium Fruits": {"category": "Canned Goods", "unit_cost": 45.00, "price_range": (65, 85), "market_share": 0.15},
    "Today's Budget Line": {"category": "Canned Goods", "unit_cost": 15.00, "price_range": (22, 30), "market_share": 0.18},
    "Fit 'n Right Juice": {"category": "Beverages", "unit_cost": 20.00, "price_range": (28, 40), "market_share": 0.22},
    
    # Food & Condiments Competitors
    "Hunt's Tomato Sauce": {"category": "Condiments", "unit_cost": 13.00, "price_range": (19, 27), "market_share": 0.25},
    "UFC Ketchup": {"category": "Condiments", "unit_cost": 23.00, "price_range": (33, 48), "market_share": 0.30},
    "Clara Ole Pasta Sauce": {"category": "Condiments", "unit_cost": 24.00, "price_range": (35, 50), "market_share": 0.20},
    "Libby's Fruit Cocktail": {"category": "Canned Goods", "unit_cost": 30.00, "price_range": (42, 60), "market_share": 0.20},
    "La Pacita Pasta": {"category": "Dry Goods", "unit_cost": 16.00, "price_range": (23, 35), "market_share": 0.25},
    "Dole Pineapple Juice": {"category": "Beverages", "unit_cost": 38.00, "price_range": (55, 75), "market_share": 0.25},
    "Minute Maid": {"category": "Beverages", "unit_cost": 22.00, "price_range": (30, 45), "market_share": 0.20},
    
    # 🚬 TOBACCO PRODUCTS
    "Winston Cigarettes": {"category": "Tobacco", "unit_cost": 85.00, "price_range": (120, 140), "market_share": 0.25},
    "Camel Cigarettes": {"category": "Tobacco", "unit_cost": 90.00, "price_range": (125, 150), "market_share": 0.20},
    "Mevius Cigarettes": {"category": "Tobacco", "unit_cost": 95.00, "price_range": (130, 155), "market_share": 0.18},
    "LD Cigarettes": {"category": "Tobacco", "unit_cost": 75.00, "price_range": (105, 125), "market_share": 0.15},
    "Mighty Cigarettes": {"category": "Tobacco", "unit_cost": 70.00, "price_range": (100, 120), "market_share": 0.12},
    "Caster Cigarettes": {"category": "Tobacco", "unit_cost": 80.00, "price_range": (115, 135), "market_share": 0.10},
    "Glamour Cigarettes": {"category": "Tobacco", "unit_cost": 78.00, "price_range": (110, 130), "market_share": 0.08},
    
    # Tobacco Competitors
    "Marlboro": {"category": "Tobacco", "unit_cost": 100.00, "price_range": (140, 165), "market_share": 0.35},
    "Philip Morris": {"category": "Tobacco", "unit_cost": 95.00, "price_range": (135, 160), "market_share": 0.25},
    "Hope Cigarettes": {"category": "Tobacco", "unit_cost": 65.00, "price_range": (95, 115), "market_share": 0.20},
    "Fortune Cigarettes": {"category": "Tobacco", "unit_cost": 60.00, "price_range": (90, 110), "market_share": 0.15},
}

# Store types with realistic distribution
STORE_TYPES = {
    "Sari-Sari Store": 0.45,        # Traditional neighborhood stores
    "Mini Mart": 0.20,              # Small convenience stores  
    "Grocery Store": 0.15,          # Medium-sized groceries
    "Supermarket": 0.10,            # Large supermarkets
    "Convenience Store": 0.08,      # 7-Eleven, etc.
    "Hypermarket": 0.02             # SM, Robinsons, etc.
}

def generate_customer_names():
    """Generate realistic Filipino customer names"""
    first_names = [
        "Maria", "Jose", "Juan", "Ana", "Antonio", "Carmen", "Francisco", "Luz", 
        "Manuel", "Rosa", "Pedro", "Josefina", "Ricardo", "Elena", "Roberto",
        "Cristina", "Miguel", "Teresa", "Angel", "Esperanza", "Fernando", "Carla",
        "Ramon", "Lydia", "Eduardo", "Grace", "Carlos", "Michelle", "Diego", "Faith"
    ]
    
    last_names = [
        "Santos", "Reyes", "Cruz", "Bautista", "Ocampo", "Garcia", "Mendoza", 
        "Torres", "Gonzales", "Lopez", "Hernandez", "Perez", "Dela Cruz", "Ramos",
        "Villanueva", "Francisco", "Castillo", "Aquino", "Jimenez", "Flores",
        "De Leon", "Pascual", "Santiago", "Guerrero", "Manalo", "Aguilar", "Valdez"
    ]
    
    return [f"{random.choice(first_names)} {random.choice(last_names)}" for _ in range(1500)]

def generate_stores():
    """Generate realistic store data across regions"""
    stores = []
    store_names_by_type = {
        "Sari-Sari Store": ["Tindahan ni Aling {}", "Store ni Kuya {}", "{}'s Variety Store", "Mini Mart ni {}"],
        "Mini Mart": ["{} Mini Mart", "{} Express", "Quick Shop {}", "{} Store"],
        "Grocery Store": ["{} Grocery", "{} Superstore", "{} Market", "Fresh Mart {}"],
        "Supermarket": ["Super {}", "{} Supermarket", "Mega Mart {}", "{} Center"],
        "Convenience Store": ["24/7 {}", "{} Express", "Quick Stop {}", "{} Convenience"],
        "Hypermarket": ["{} Hypermarket", "Mega {}", "{} Plaza", "Grand {}"]
    }
    
    owner_names = ["Rosa", "Carmen", "Pedro", "Maria", "Juan", "Ana", "Jose", "Luz"]
    
    store_id = 1
    for region, weight in REGIONS.items():
        num_stores = max(5, int(50 * weight))  # More stores in bigger regions
        
        for _ in range(num_stores):
            store_type = random.choices(list(STORE_TYPES.keys()), weights=list(STORE_TYPES.values()))[0]
            owner = random.choice(owner_names)
            store_name = random.choice(store_names_by_type[store_type]).format(owner)
            
            stores.append({
                "id": f"store_{store_id:03d}",
                "name": store_name,
                "type": store_type,
                "region": region,
                "barangay": f"Barangay {random.randint(1, 200)}",
                "address": f"{random.randint(1, 999)} {random.choice(['Main St', 'Market Ave', 'Commerce Blvd', 'Trade St'])}"
            })
            store_id += 1
    
    return stores

def generate_transactions(num_transactions=5000):
    """Generate realistic FMCG transactions with regional distribution"""
    
    customers = generate_customer_names()
    stores = generate_stores()
    brands = list(BRANDS_PORTFOLIO.keys())
    
    transactions = []
    transaction_items = []
    
    # Generate date range (last 6 months)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)
    
    for i in range(num_transactions):
        # Select region based on weights (mega cities get more transactions)
        region = random.choices(list(REGIONS.keys()), weights=list(REGIONS.values()))[0]
        
        # Select store from that region
        region_stores = [s for s in stores if s["region"] == region]
        store = random.choice(region_stores)
        
        # Generate transaction date (more recent transactions weighted higher)
        days_ago = int(random.betavariate(2, 5) * 180)  # Beta distribution favors recent dates
        transaction_date = end_date - timedelta(days=days_ago)
        
        # Transaction timing (business hours weighted)
        hour_weights = [0.1, 0.1, 0.2, 0.3, 0.5, 0.8, 1.0, 1.0, 0.9, 0.8, 0.7, 0.6, 
                       0.8, 0.9, 1.0, 1.0, 0.9, 0.8, 0.6, 0.4, 0.3, 0.2, 0.1, 0.1]
        hour = random.choices(range(24), weights=hour_weights)[0]
        minute = random.randint(0, 59)
        
        transaction_date = transaction_date.replace(hour=hour, minute=minute)
        
        # Customer selection (some customers are repeat buyers)
        if random.random() < 0.3:  # 30% repeat customers
            customer_name = random.choice(customers[:500])  # Top 500 customers more likely to repeat
        else:
            customer_name = random.choice(customers)
        
        transaction_id = f"txn_{i+1:05d}"
        customer_id = f"cust_{hash(customer_name) % 10000:04d}"
        
        # Number of items (weighted toward smaller baskets)
        num_items = random.choices([1, 2, 3, 4, 5, 6], weights=[40, 25, 15, 10, 6, 4])[0]
        
        transaction_total = 0
        
        # Generate items for this transaction
        selected_brands = random.sample(brands, min(num_items, len(brands)))
        
        for j, brand in enumerate(selected_brands):
            brand_info = BRANDS_PORTFOLIO[brand]
            
            # Quantity (most items bought in small quantities)
            quantity = random.choices([1, 2, 3, 4, 5], weights=[50, 25, 15, 7, 3])[0]
            
            # Price with regional variation (mega cities slightly higher)
            base_price = random.uniform(*brand_info["price_range"])
            if region in ["National Capital Region (NCR)", "CALABARZON", "Central Luzon"]:
                price_multiplier = random.uniform(1.05, 1.15)  # 5-15% higher in mega cities
            else:
                price_multiplier = random.uniform(0.95, 1.05)  # Slightly lower in other regions
            
            unit_price = round(base_price * price_multiplier, 2)
            item_total = unit_price * quantity
            transaction_total += item_total
            
            transaction_items.append({
                "id": f"item_{i+1:05d}_{j+1:02d}",
                "transaction_id": transaction_id,
                "product_id": f"prod_{hash(brand) % 1000:03d}",
                "product_name": brand,
                "category": brand_info["category"],
                "unit_price": unit_price,
                "quantity": quantity,
                "total_amount": round(item_total, 2)
            })
        
        transactions.append({
            "id": transaction_id,
            "customer_id": customer_id,
            "customer_name": customer_name,
            "store_id": store["id"],
            "store_name": store["name"],
            "store_type": store["type"],
            "region": region,
            "barangay": store["barangay"],
            "transaction_date": transaction_date.isoformat(),
            "total_amount": round(transaction_total, 2),
            "payment_method": random.choices(
                ["Cash", "GCash", "PayMaya", "Credit Card", "Bank Transfer"],
                weights=[60, 20, 10, 7, 3]
            )[0]
        })
    
    return transactions, transaction_items, stores

def generate_products():
    """Generate product catalog from brands portfolio"""
    products = []
    
    for brand, info in BRANDS_PORTFOLIO.items():
        product_id = f"prod_{hash(brand) % 1000:03d}"
        
        products.append({
            "id": product_id,
            "name": brand,
            "category": info["category"],
            "unit_cost": info["unit_cost"],
            "price_range_min": info["price_range"][0],
            "price_range_max": info["price_range"][1],
            "market_share": info["market_share"],
            "is_fmcg": True,
            "brand": brand.split()[0],  # First word as brand
            "description": f"Premium {info['category'].lower()} product - {brand}",
            "created_at": datetime.now().isoformat()
        })
    
    return products

def main():
    """Generate comprehensive FMCG dataset"""
    print("🏭 Generating comprehensive Philippine FMCG dataset...")
    print("📊 Target: 5,000 transactions across 17 regions")
    print("🏙️ Mega cities weighted higher (NCR, CALABARZON, Central Luzon)")
    print()
    
    # Generate all data
    transactions, transaction_items, stores = generate_transactions(5000)
    products = generate_products()
    
    # Calculate statistics
    print("📈 Dataset Statistics:")
    print(f"   Transactions: {len(transactions):,}")
    print(f"   Transaction Items: {len(transaction_items):,}")
    print(f"   Products: {len(products):,}")
    print(f"   Stores: {len(stores):,}")
    print()
    
    # Regional distribution
    print("🗺️ Regional Distribution:")
    regional_counts = {}
    for txn in transactions:
        region = txn["region"]
        regional_counts[region] = regional_counts.get(region, 0) + 1
    
    for region, count in sorted(regional_counts.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / len(transactions)) * 100
        print(f"   {region}: {count:,} ({percentage:.1f}%)")
    print()
    
    # Category distribution
    print("📦 Category Distribution:")
    category_counts = {}
    for item in transaction_items:
        category = item["category"]
        category_counts[category] = category_counts.get(category, 0) + item["quantity"]
    
    for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / sum(category_counts.values())) * 100
        print(f"   {category}: {count:,} units ({percentage:.1f}%)")
    print()
    
    # Revenue analysis
    total_revenue = sum(txn["total_amount"] for txn in transactions)
    avg_transaction = total_revenue / len(transactions)
    print(f"💰 Revenue Analysis:")
    print(f"   Total Revenue: ₱{total_revenue:,.2f}")
    print(f"   Average Transaction: ₱{avg_transaction:.2f}")
    print()
    
    # Save datasets
    datasets = {
        "transactions": transactions,
        "transaction_items": transaction_items,
        "products": products,
        "stores": stores,
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "total_transactions": len(transactions),
            "total_revenue": total_revenue,
            "date_range": {
                "from": min(txn["transaction_date"] for txn in transactions),
                "to": max(txn["transaction_date"] for txn in transactions)
            },
            "regions_covered": len(REGIONS),
            "brands_included": len(BRANDS_PORTFOLIO)
        }
    }
    
    # Save to JSON file
    output_file = "comprehensive_fmcg_dataset_5000.json"
    with open(output_file, "w") as f:
        json.dump(datasets, f, indent=2, default=str)
    
    print(f"✅ Dataset saved to {output_file}")
    print(f"📁 File size: {len(json.dumps(datasets)) / 1024 / 1024:.1f} MB")
    print()
    print("🚀 Ready to upload to Supabase database!")

if __name__ == "__main__":
    main()