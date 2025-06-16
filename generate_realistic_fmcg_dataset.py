#!/usr/bin/env python3
"""
Scout Analytics - Realistic FMCG Dataset Generator
Generates 5,000 synthetic transactions with real-world noise and regional skews
"""

import random
import uuid
import json
from datetime import datetime, timedelta
import numpy as np

# 1. Define Philippine regions with realistic weights (mega cities heavily weighted)
regions = [
    ("National Capital Region (NCR)", 0.25),  # Metro Manila - highest weight
    ("CALABARZON", 0.18),                     # Laguna, Batangas, Cavite, Rizal, Quezon
    ("Central Luzon", 0.14),                  # Pampanga, Bulacan, Nueva Ecija, etc.
    ("Western Visayas", 0.08),                # Iloilo, Bacolod, Antique
    ("Central Visayas", 0.07),                # Cebu, Bohol, Siquijor
    ("Northern Mindanao", 0.06),              # Cagayan de Oro, Butuan
    ("Davao Region", 0.05),                   # Davao City
    ("Ilocos Region", 0.04),                  # Vigan, Laoag
    ("Bicol Region", 0.03),                   # Legazpi, Naga
    ("Eastern Visayas", 0.025),               # Tacloban
    ("Soccsksargen", 0.025),                  # General Santos
    ("Zamboanga Peninsula", 0.02),            # Zamboanga City
    ("Cagayan Valley", 0.02),                 # Tuguegarao
    ("Mimaropa", 0.015),                      # Puerto Princesa
    ("Cordillera Administrative Region", 0.015), # Baguio
    ("Caraga", 0.01),                         # Butuan
    ("Bangsamoro", 0.01)                      # Cotabato
]

region_names, region_weights = zip(*regions)

# 2. Comprehensive FMCG brands with realistic pricing and market positioning
brands_data = {
    # 🥛 DAIRY PRODUCTS
    "Alaska Evaporated Milk": {"category": "Dairy", "base_price": 38.50, "market_tier": "premium", "unit_cost": 28.50},
    "Alaska Condensed Milk": {"category": "Dairy", "base_price": 45.00, "market_tier": "premium", "unit_cost": 32.00},
    "Alaska Powdered Milk": {"category": "Dairy", "base_price": 385.00, "market_tier": "premium", "unit_cost": 285.00},
    "Krem-Top Coffee Creamer": {"category": "Dairy", "base_price": 18.50, "market_tier": "mid", "unit_cost": 12.00},
    "Alpine Evaporated Milk": {"category": "Dairy", "base_price": 36.00, "market_tier": "mid", "unit_cost": 27.00},
    "Alpine Condensed Milk": {"category": "Dairy", "base_price": 42.00, "market_tier": "mid", "unit_cost": 30.50},
    "Cow Bell Powdered Milk": {"category": "Dairy", "base_price": 375.00, "market_tier": "mid", "unit_cost": 275.00},
    
    # Dairy Competitors
    "Nestle Evaporated Milk": {"category": "Dairy", "base_price": 42.00, "market_tier": "premium", "unit_cost": 30.00},
    "Liberty Condensed Milk": {"category": "Dairy", "base_price": 38.00, "market_tier": "budget", "unit_cost": 29.00},
    "Bear Brand Powdered Milk": {"category": "Dairy", "base_price": 420.00, "market_tier": "premium", "unit_cost": 290.00},
    "Anchor Powdered Milk": {"category": "Dairy", "base_price": 450.00, "market_tier": "premium", "unit_cost": 310.00},
    
    # 🍟 SNACKS & PROCESSED FOODS
    "Oishi Prawn Crackers": {"category": "Snacks", "base_price": 15.00, "market_tier": "premium", "unit_cost": 8.50},
    "Oishi Pillows": {"category": "Snacks", "base_price": 12.00, "market_tier": "premium", "unit_cost": 6.00},
    "Oishi Marty's": {"category": "Snacks", "base_price": 8.50, "market_tier": "mid", "unit_cost": 4.50},
    "Oishi Ridges": {"category": "Snacks", "base_price": 13.50, "market_tier": "premium", "unit_cost": 7.00},
    "Oishi Bread Pan": {"category": "Snacks", "base_price": 10.00, "market_tier": "mid", "unit_cost": 5.50},
    "Gourmet Picks": {"category": "Snacks", "base_price": 17.50, "market_tier": "premium", "unit_cost": 9.00},
    "Crispy Patata": {"category": "Snacks", "base_price": 9.00, "market_tier": "budget", "unit_cost": 5.00},
    "Smart C+ Vitamin Drinks": {"category": "Beverages", "base_price": 25.00, "market_tier": "premium", "unit_cost": 15.00},
    "Oaties": {"category": "Snacks", "base_price": 12.50, "market_tier": "mid", "unit_cost": 6.50},
    "Hi-Ho": {"category": "Snacks", "base_price": 14.00, "market_tier": "mid", "unit_cost": 7.50},
    "Rinbee": {"category": "Snacks", "base_price": 7.00, "market_tier": "budget", "unit_cost": 3.50},
    "Deli Mex": {"category": "Snacks", "base_price": 15.50, "market_tier": "premium", "unit_cost": 8.00},
    
    # Snacks Competitors
    "Lays Potato Chips": {"category": "Snacks", "base_price": 17.00, "market_tier": "premium", "unit_cost": 9.50},
    "Pringles": {"category": "Snacks", "base_price": 75.00, "market_tier": "premium", "unit_cost": 45.00},
    "Jack n Jill Nova": {"category": "Snacks", "base_price": 11.50, "market_tier": "mid", "unit_cost": 6.00},
    "Richeese Nabati": {"category": "Snacks", "base_price": 10.50, "market_tier": "mid", "unit_cost": 5.50},
    "Cheetos": {"category": "Snacks", "base_price": 14.50, "market_tier": "premium", "unit_cost": 8.00},
    
    # 🧼 PERSONAL CARE & HOUSEHOLD
    "Champion Detergent": {"category": "Household", "base_price": 22.00, "market_tier": "mid", "unit_cost": 12.50},
    "Champion Fabric Conditioner": {"category": "Household", "base_price": 26.00, "market_tier": "mid", "unit_cost": 15.00},
    "Calla Personal Care": {"category": "Personal Care", "base_price": 42.50, "market_tier": "mid", "unit_cost": 25.00},
    "Hana Shampoo": {"category": "Personal Care", "base_price": 75.00, "market_tier": "mid", "unit_cost": 45.00},
    "Hana Conditioner": {"category": "Personal Care", "base_price": 80.00, "market_tier": "mid", "unit_cost": 48.00},
    "Cyclone Bleach": {"category": "Household", "base_price": 30.00, "market_tier": "budget", "unit_cost": 18.00},
    "Pride Dishwashing Liquid": {"category": "Household", "base_price": 38.50, "market_tier": "mid", "unit_cost": 22.00},
    "Care Plus Alcohol": {"category": "Personal Care", "base_price": 60.00, "market_tier": "mid", "unit_cost": 35.00},
    "Care Plus Hand Sanitizer": {"category": "Personal Care", "base_price": 50.00, "market_tier": "mid", "unit_cost": 28.00},
    
    # Personal Care & Household Competitors
    "Ariel Detergent": {"category": "Household", "base_price": 26.00, "market_tier": "premium", "unit_cost": 14.00},
    "Tide Detergent": {"category": "Household", "base_price": 30.00, "market_tier": "premium", "unit_cost": 16.00},
    "Downy Fabric Conditioner": {"category": "Household", "base_price": 32.00, "market_tier": "premium", "unit_cost": 18.00},
    "Pantene Shampoo": {"category": "Personal Care", "base_price": 95.00, "market_tier": "premium", "unit_cost": 55.00},
    "Head & Shoulders": {"category": "Personal Care", "base_price": 105.00, "market_tier": "premium", "unit_cost": 60.00},
    "Clorox Bleach": {"category": "Household", "base_price": 35.00, "market_tier": "premium", "unit_cost": 20.00},
    "Joy Dishwashing Liquid": {"category": "Household", "base_price": 42.00, "market_tier": "premium", "unit_cost": 24.00},
    
    # 🍅 FOOD & CONDIMENTS
    "Del Monte Pineapple Juice": {"category": "Beverages", "base_price": 60.00, "market_tier": "premium", "unit_cost": 35.00},
    "Del Monte Pineapple Chunks": {"category": "Canned Goods", "base_price": 48.00, "market_tier": "premium", "unit_cost": 28.00},
    "Del Monte Tomato Sauce": {"category": "Condiments", "base_price": 22.00, "market_tier": "premium", "unit_cost": 12.00},
    "Del Monte Ketchup": {"category": "Condiments", "base_price": 42.00, "market_tier": "premium", "unit_cost": 25.00},
    "Del Monte Spaghetti Sauce": {"category": "Condiments", "base_price": 38.00, "market_tier": "premium", "unit_cost": 22.00},
    "Del Monte Fruit Cocktail": {"category": "Canned Goods", "base_price": 55.00, "market_tier": "premium", "unit_cost": 32.00},
    "Del Monte Pasta": {"category": "Dry Goods", "base_price": 32.00, "market_tier": "mid", "unit_cost": 18.00},
    "S&W Premium Fruits": {"category": "Canned Goods", "base_price": 75.00, "market_tier": "premium", "unit_cost": 45.00},
    "Today's Budget Line": {"category": "Canned Goods", "base_price": 26.00, "market_tier": "budget", "unit_cost": 15.00},
    "Fit 'n Right Juice": {"category": "Beverages", "base_price": 35.00, "market_tier": "mid", "unit_cost": 20.00},
    
    # Food & Condiments Competitors
    "Hunt's Tomato Sauce": {"category": "Condiments", "base_price": 24.00, "market_tier": "mid", "unit_cost": 13.00},
    "UFC Ketchup": {"category": "Condiments", "base_price": 40.00, "market_tier": "premium", "unit_cost": 23.00},
    "Clara Ole Pasta Sauce": {"category": "Condiments", "base_price": 42.00, "market_tier": "premium", "unit_cost": 24.00},
    "Libby's Fruit Cocktail": {"category": "Canned Goods", "base_price": 50.00, "market_tier": "mid", "unit_cost": 30.00},
    "La Pacita Pasta": {"category": "Dry Goods", "base_price": 28.00, "market_tier": "budget", "unit_cost": 16.00},
    "Dole Pineapple Juice": {"category": "Beverages", "base_price": 65.00, "market_tier": "premium", "unit_cost": 38.00},
    "Minute Maid": {"category": "Beverages", "base_price": 38.00, "market_tier": "mid", "unit_cost": 22.00},
    
    # 🚬 TOBACCO PRODUCTS
    "Winston Cigarettes": {"category": "Tobacco", "base_price": 130.00, "market_tier": "premium", "unit_cost": 85.00},
    "Camel Cigarettes": {"category": "Tobacco", "base_price": 135.00, "market_tier": "premium", "unit_cost": 90.00},
    "Mevius Cigarettes": {"category": "Tobacco", "base_price": 140.00, "market_tier": "premium", "unit_cost": 95.00},
    "LD Cigarettes": {"category": "Tobacco", "base_price": 115.00, "market_tier": "mid", "unit_cost": 75.00},
    "Mighty Cigarettes": {"category": "Tobacco", "base_price": 110.00, "market_tier": "budget", "unit_cost": 70.00},
    "Caster Cigarettes": {"category": "Tobacco", "base_price": 125.00, "market_tier": "mid", "unit_cost": 80.00},
    "Glamour Cigarettes": {"category": "Tobacco", "base_price": 120.00, "market_tier": "mid", "unit_cost": 78.00},
    
    # Tobacco Competitors
    "Marlboro": {"category": "Tobacco", "base_price": 155.00, "market_tier": "premium", "unit_cost": 100.00},
    "Philip Morris": {"category": "Tobacco", "base_price": 150.00, "market_tier": "premium", "unit_cost": 95.00},
    "Hope Cigarettes": {"category": "Tobacco", "base_price": 105.00, "market_tier": "budget", "unit_cost": 65.00},
    "Fortune Cigarettes": {"category": "Tobacco", "base_price": 100.00, "market_tier": "budget", "unit_cost": 60.00},
}

brands = list(brands_data.keys())

# Generate realistic market shares using Dirichlet distribution with category clustering
def generate_market_shares():
    """Generate realistic market shares with category-based clustering"""
    categories = {}
    for brand, data in brands_data.items():
        cat = data["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(brand)
    
    # Assign shares within categories, then normalize globally
    all_shares = {}
    
    for category, category_brands in categories.items():
        # Higher concentration = more uniform shares within category
        concentration = 2.0 if len(category_brands) > 5 else 1.5
        category_shares = np.random.dirichlet(np.ones(len(category_brands)) * concentration)
        
        for i, brand in enumerate(category_brands):
            # Adjust by market tier (premium brands get slight boost)
            tier_multiplier = {
                "premium": 1.2,
                "mid": 1.0, 
                "budget": 0.8
            }[brands_data[brand]["market_tier"]]
            
            all_shares[brand] = category_shares[i] * tier_multiplier
    
    # Normalize to sum to 1.0
    total = sum(all_shares.values())
    return {brand: share/total for brand, share in all_shares.items()}

market_shares = generate_market_shares()

# 3. Noise functions for realistic variation
def noisy_count(mean, scale=0.4):
    """Generate noisy quantity with realistic distribution"""
    # Use log-normal for quantities (most purchases are small, few are large)
    return max(1, int(np.random.lognormal(np.log(mean), scale)))

def noisy_price(base_price, region, store_type="sari-sari"):
    """Generate realistic price with regional and store type variations"""
    # Regional price variations
    regional_multipliers = {
        "National Capital Region (NCR)": 1.15,
        "CALABARZON": 1.08,
        "Central Luzon": 1.05,
        "Western Visayas": 1.02,
        "Central Visayas": 1.01,
    }
    
    # Store type affects pricing
    store_multipliers = {
        "sari-sari": 1.0,
        "convenience": 1.08,
        "grocery": 0.95,
        "supermarket": 0.92
    }
    
    region_mult = regional_multipliers.get(region, 0.95)  # Other regions slightly cheaper
    store_mult = store_multipliers.get(store_type, 1.0)
    
    # Add random noise ±15%
    noise = random.uniform(0.85, 1.15)
    
    return round(base_price * region_mult * store_mult * noise, 2)

def generate_realistic_timestamp():
    """Generate timestamp with realistic distribution (weighted toward recent dates)"""
    # Last 150 days, but weighted toward more recent
    days_ago = int(np.random.beta(2, 5) * 150)  # Beta distribution favors recent dates
    
    # Realistic daily patterns (higher activity 7am-9pm)
    hour_weights = [0.1, 0.1, 0.1, 0.2, 0.3, 0.5, 0.8, 1.0, 1.0, 0.9, 
                   0.8, 0.7, 0.6, 0.8, 0.9, 1.0, 1.0, 0.9, 0.8, 0.6, 
                   0.4, 0.3, 0.2, 0.1]
    hour = random.choices(range(24), weights=hour_weights)[0]
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    
    base_date = datetime.now() - timedelta(days=days_ago)
    return base_date.replace(hour=hour, minute=minute, second=second)

# 4. Generate store types and customer behaviors
store_types = ["sari-sari", "convenience", "grocery", "supermarket"]
store_type_weights = [0.6, 0.2, 0.15, 0.05]  # Sari-sari stores dominate

customer_segments = {
    "frequent_buyer": 0.3,    # Buy multiple items, repeat customers
    "occasional_buyer": 0.5,  # Normal shopping behavior
    "bulk_buyer": 0.2        # Larger quantities, less frequent
}

# 5. Generate the dataset
def generate_fmcg_dataset(num_transactions=5000):
    """Generate realistic FMCG transaction dataset"""
    
    print("🏭 Generating comprehensive FMCG dataset...")
    print(f"📊 Target: {num_transactions:,} transactions")
    print("🏙️ Weighted toward mega cities (NCR, CALABARZON, Central Luzon)")
    print()
    
    transactions = []
    transaction_items = []
    customers = set()
    stores = set()
    
    # Generate customer pool
    customer_pool = [f"cust_{i:05d}" for i in range(1, 2001)]  # 2000 customers
    
    for i in range(num_transactions):
        # Select region with weights
        region = random.choices(region_names, weights=region_weights)[0]
        
        # Select store type
        store_type = random.choices(store_types, weights=store_type_weights)[0]
        
        # Generate store ID
        store_id = f"store_{region.replace(' ', '_').lower()}_{random.randint(1, 100):03d}"
        stores.add(store_id)
        
        # Select customer segment and behavior
        segment = random.choices(list(customer_segments.keys()), 
                               weights=list(customer_segments.values()))[0]
        
        # Customer selection (repeat customers more likely in frequent_buyer segment)
        if segment == "frequent_buyer" and random.random() < 0.7:
            customer_id = random.choice(customer_pool[:500])  # Top 500 customers
        else:
            customer_id = random.choice(customer_pool)
        
        customers.add(customer_id)
        
        # Transaction timing
        transaction_date = generate_realistic_timestamp()
        transaction_id = f"txn_{i+1:06d}"
        
        # Determine basket size based on customer segment
        if segment == "frequent_buyer":
            num_items = random.choices([1, 2, 3, 4, 5], weights=[20, 30, 25, 15, 10])[0]
        elif segment == "bulk_buyer":
            num_items = random.choices([2, 3, 4, 5, 6, 7], weights=[10, 15, 20, 25, 20, 10])[0]
        else:  # occasional_buyer
            num_items = random.choices([1, 2, 3], weights=[50, 35, 15])[0]
        
        # Select brands for this transaction
        selected_brands = random.choices(brands, 
                                       weights=[market_shares[b] for b in brands], 
                                       k=num_items)
        
        # Remove duplicates while preserving some
        unique_brands = []
        for brand in selected_brands:
            if brand not in unique_brands or random.random() < 0.1:  # 10% chance of duplicate
                unique_brands.append(brand)
        
        transaction_total = 0
        
        # Generate items for this transaction
        for j, brand in enumerate(unique_brands):
            brand_info = brands_data[brand]
            
            # Quantity based on customer segment and product type
            if segment == "bulk_buyer":
                base_qty = 3 if brand_info["category"] in ["Household", "Dairy"] else 2
            elif segment == "frequent_buyer":
                base_qty = 2
            else:
                base_qty = 1
            
            quantity = noisy_count(base_qty, scale=0.3)
            
            # Price with regional and store variations
            unit_price = noisy_price(brand_info["base_price"], region, store_type)
            item_total = unit_price * quantity
            transaction_total += item_total
            
            # Generate product ID
            product_id = f"prod_{hash(brand) % 10000:04d}"
            
            transaction_items.append({
                "id": f"item_{i+1:06d}_{j+1:02d}",
                "transaction_id": transaction_id,
                "product_id": product_id,
                "product_name": brand,
                "category": brand_info["category"],
                "unit_price": unit_price,
                "quantity": quantity,
                "total_amount": round(item_total, 2)
            })
        
        # Payment method (regional variations)
        if region in ["National Capital Region (NCR)", "CALABARZON"]:
            payment_weights = [50, 25, 15, 7, 3]  # More digital payments in metro
        else:
            payment_weights = [70, 15, 8, 5, 2]   # More cash in provinces
        
        payment_method = random.choices(
            ["Cash", "GCash", "PayMaya", "Credit Card", "Bank Transfer"],
            weights=payment_weights
        )[0]
        
        transactions.append({
            "id": transaction_id,
            "customer_id": customer_id,
            "store_id": store_id,
            "store_type": store_type,
            "region": region,
            "transaction_date": transaction_date.isoformat(),
            "total_amount": round(transaction_total, 2),
            "payment_method": payment_method,
            "customer_segment": segment
        })
        
        if (i + 1) % 1000 == 0:
            print(f"✅ Generated {i+1:,} transactions...")
    
    print()
    print("📈 Dataset Statistics:")
    print(f"   Transactions: {len(transactions):,}")
    print(f"   Transaction Items: {len(transaction_items):,}")
    print(f"   Unique Customers: {len(customers):,}")
    print(f"   Unique Stores: {len(stores):,}")
    
    # Calculate totals
    total_revenue = sum(txn["total_amount"] for txn in transactions)
    total_units = sum(item["quantity"] for item in transaction_items)
    avg_transaction = total_revenue / len(transactions)
    
    print(f"   Total Revenue: ₱{total_revenue:,.2f}")
    print(f"   Total Units: {total_units:,}")
    print(f"   Avg Transaction: ₱{avg_transaction:.2f}")
    print()
    
    # Regional breakdown
    print("🗺️ Regional Distribution:")
    regional_counts = {}
    regional_revenue = {}
    
    for txn in transactions:
        region = txn["region"]
        regional_counts[region] = regional_counts.get(region, 0) + 1
        regional_revenue[region] = regional_revenue.get(region, 0) + txn["total_amount"]
    
    for region in sorted(regional_counts.keys(), key=lambda x: regional_counts[x], reverse=True)[:10]:
        count = regional_counts[region]
        revenue = regional_revenue[region]
        pct = (count / len(transactions)) * 100
        print(f"   {region}: {count:,} txns ({pct:.1f}%) - ₱{revenue:,.2f}")
    
    print()
    
    # Category breakdown
    print("📦 Top Categories by Volume:")
    category_counts = {}
    for item in transaction_items:
        cat = item["category"]
        category_counts[cat] = category_counts.get(cat, 0) + item["quantity"]
    
    for category in sorted(category_counts.keys(), key=lambda x: category_counts[x], reverse=True)[:8]:
        count = category_counts[category]
        pct = (count / total_units) * 100
        print(f"   {category}: {count:,} units ({pct:.1f}%)")
    
    return transactions, transaction_items

# Generate the dataset
if __name__ == "__main__":
    transactions, transaction_items = generate_fmcg_dataset(5000)
    
    # Prepare data for export
    dataset = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "total_transactions": len(transactions),
            "total_items": len(transaction_items),
            "brands_included": len(brands),
            "regions_covered": len(region_names),
            "date_range_days": 150
        },
        "transactions": transactions,
        "transaction_items": transaction_items,
        "brands_portfolio": brands_data,
        "market_shares": market_shares
    }
    
    # Save to JSON
    output_file = "fmcg_dataset_5000_realistic.json"
    with open(output_file, "w") as f:
        json.dump(dataset, f, indent=2, default=str)
    
    print(f"💾 Dataset saved to {output_file}")
    print(f"📁 File size: {len(json.dumps(dataset, default=str)) / 1024 / 1024:.1f} MB")
    print()
    print("🚀 Ready for Supabase upload!")