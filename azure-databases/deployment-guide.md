# Azure Database Deployment Guide
## Scout Analytics v3 - Azure SQL & PostgreSQL Setup

This guide provides step-by-step instructions for setting up Azure databases that mirror the existing Supabase schema.

## 🎯 Overview

You can choose between three database options:
1. **Azure SQL Database** - Fully managed SQL Server
2. **Azure Database for PostgreSQL** - Managed PostgreSQL
3. **Keep Supabase** - Continue with existing setup

All options use the same schema and provide identical functionality.

## 📋 Prerequisites

- Azure account with active subscription
- Azure CLI installed
- Access to Azure Portal
- Database admin credentials

## 🚀 Option 1: Azure SQL Database Setup

### Step 1: Create Azure SQL Database

```bash
# Login to Azure
az login

# Create resource group
az group create --name scout-analytics-rg --location eastus

# Create SQL Server
az sql server create \
  --name scout-analytics-sql-server \
  --resource-group scout-analytics-rg \
  --location eastus \
  --admin-user scoutadmin \
  --admin-password "YourSecurePassword123!"

# Create SQL Database
az sql db create \
  --resource-group scout-analytics-rg \
  --server scout-analytics-sql-server \
  --name ScoutAnalyticsV3 \
  --service-objective S2
```

### Step 2: Configure Firewall

```bash
# Allow Azure services
az sql server firewall-rule create \
  --resource-group scout-analytics-rg \
  --server scout-analytics-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your IP (replace with your IP)
az sql server firewall-rule create \
  --resource-group scout-analytics-rg \
  --server scout-analytics-sql-server \
  --name AllowMyIP \
  --start-ip-address YOUR.IP.ADDRESS.HERE \
  --end-ip-address YOUR.IP.ADDRESS.HERE
```

### Step 3: Deploy Schema

```bash
# Connect to database and run schema
sqlcmd -S scout-analytics-sql-server.database.windows.net \
  -d ScoutAnalyticsV3 \
  -U scoutadmin \
  -P "YourSecurePassword123!" \
  -i azure-databases/azure-sql-schema.sql

# Insert sample data
sqlcmd -S scout-analytics-sql-server.database.windows.net \
  -d ScoutAnalyticsV3 \
  -U scoutadmin \
  -P "YourSecurePassword123!" \
  -i azure-databases/sample-data.sql
```

### Step 4: Get Connection String

```bash
az sql db show-connection-string \
  --server scout-analytics-sql-server \
  --name ScoutAnalyticsV3 \
  --client ado.net
```

Connection string format:
```
Server=tcp:scout-analytics-sql-server.database.windows.net,1433;Initial Catalog=ScoutAnalyticsV3;Persist Security Info=False;User ID=scoutadmin;Password=YourSecurePassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

## 🐘 Option 2: Azure Database for PostgreSQL Setup

### Step 1: Create PostgreSQL Server

```bash
# Create PostgreSQL server
az postgres server create \
  --name scout-analytics-pg-server \
  --resource-group scout-analytics-rg \
  --location eastus \
  --admin-user scoutadmin \
  --admin-password "YourSecurePassword123!" \
  --sku-name B_Gen5_1 \
  --version 13

# Create database
az postgres db create \
  --resource-group scout-analytics-rg \
  --server-name scout-analytics-pg-server \
  --name scout_analytics_v3
```

### Step 2: Configure Firewall

```bash
# Allow Azure services
az postgres server firewall-rule create \
  --resource-group scout-analytics-rg \
  --server scout-analytics-pg-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your IP
az postgres server firewall-rule create \
  --resource-group scout-analytics-rg \
  --server scout-analytics-pg-server \
  --name AllowMyIP \
  --start-ip-address YOUR.IP.ADDRESS.HERE \
  --end-ip-address YOUR.IP.ADDRESS.HERE
```

### Step 3: Deploy Schema

```bash
# Connect and run schema
psql "host=scout-analytics-pg-server.postgres.database.azure.com port=5432 dbname=scout_analytics_v3 user=scoutadmin@scout-analytics-pg-server password=YourSecurePassword123! sslmode=require" \
  -f azure-databases/azure-postgresql-schema.sql

# Insert sample data
psql "host=scout-analytics-pg-server.postgres.database.azure.com port=5432 dbname=scout_analytics_v3 user=scoutadmin@scout-analytics-pg-server password=YourSecurePassword123! sslmode=require" \
  -f azure-databases/sample-data.sql

# Create functions
psql "host=scout-analytics-pg-server.postgres.database.azure.com port=5432 dbname=scout_analytics_v3 user=scoutadmin@scout-analytics-pg-server password=YourSecurePassword123! sslmode=require" \
  -f azure-databases/azure-functions.sql
```

### Step 4: Get Connection String

PostgreSQL connection string:
```
postgresql://scoutadmin%40scout-analytics-pg-server:YourSecurePassword123!@scout-analytics-pg-server.postgres.database.azure.com:5432/scout_analytics_v3?sslmode=require
```

## ⚙️ Environment Configuration

### Update Environment Variables

Create `.env.local` file:

```bash
# Database Provider (choose one)
VITE_DB_PROVIDER=azure-sql           # or azure-postgresql or supabase

# Azure SQL Configuration
VITE_AZURE_DB_CONNECTION_STRING=Server=tcp:scout-analytics-sql-server.database.windows.net,1433;Initial Catalog=ScoutAnalyticsV3;Persist Security Info=False;User ID=scoutadmin;Password=YourSecurePassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;

# OR Azure PostgreSQL Configuration
VITE_AZURE_DB_CONNECTION_STRING=postgresql://scoutadmin%40scout-analytics-pg-server:YourSecurePassword123!@scout-analytics-pg-server.postgres.database.azure.com:5432/scout_analytics_v3?sslmode=require

# OR Keep Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Azure OpenAI (for AI features)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your_azure_openai_api_key
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-05-01-preview
```

### Update Code Configuration

The application will automatically detect the database provider and use the appropriate connection method via `src/lib/azureDbProvider.ts`.

## 🔧 Application Updates

### Install Additional Dependencies

For Azure SQL support:
```bash
npm install mssql tedious
```

For Azure PostgreSQL support:
```bash
npm install pg @types/pg
```

### Update Data Provider

The `azureDbProvider.ts` file handles all database connections. No changes needed to existing components.

## 🧪 Testing Database Connection

### Test Connection

```bash
# Build and test locally
npm run build
npm run dev

# Check browser console for connection status
# Visit: http://localhost:5173
```

### Health Check Endpoint

The provider includes a health check method:

```typescript
import { createAzureDbProvider } from './lib/azureDbProvider';

const db = createAzureDbProvider();
const health = await db.healthCheck();
console.log('Database status:', health);
```

## 📊 Data Verification

### Verify Schema

Check that all tables exist:

```sql
-- Azure SQL
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';

-- Azure PostgreSQL
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Verify Sample Data

```sql
-- Check record counts
SELECT 'brands' as table_name, COUNT(*) as record_count FROM brands
UNION ALL
SELECT 'stores', COUNT(*) FROM stores
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions;
```

### Test Analytics Functions

```sql
-- Test dashboard summary
SELECT public.get_dashboard_summary('{}');

-- Test location distribution
SELECT public.get_location_distribution('{}');
```

## 🚀 Deployment to Production

### Vercel Environment Variables

In Vercel dashboard, add environment variables:

```bash
VITE_DB_PROVIDER=azure-sql  # or azure-postgresql
VITE_AZURE_DB_CONNECTION_STRING=your_connection_string_here
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_KEY=your_azure_openai_key
```

### Deploy Application

```bash
# Commit changes
git add .
git commit -m "Add Azure database support"
git push origin main

# Vercel will automatically deploy
```

## 🔒 Security Best Practices

### Database Security

1. **Use Strong Passwords**: Complex passwords with mixed characters
2. **Firewall Rules**: Limit IP ranges to necessary addresses only
3. **SSL/TLS**: Always use encrypted connections
4. **Regular Updates**: Keep database servers updated
5. **Backup Strategy**: Set up automated backups

### Application Security

1. **Environment Variables**: Never commit credentials to git
2. **Connection Strings**: Use environment variables only
3. **Input Validation**: Validate all user inputs
4. **SQL Injection**: Use parameterized queries only

## 📈 Performance Optimization

### Indexing

The schemas include optimized indexes for:
- Transaction date lookups
- Store and customer filtering
- Product category searches
- Regional data analysis

### Connection Pooling

Configure connection pooling for production:

```typescript
// Azure SQL
const poolConfig = {
  max: 10,
  min: 0,
  idleTimeoutMillis: 30000
};

// PostgreSQL
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check firewall rules
   - Verify connection string format
   - Ensure database server is running

2. **Authentication Failed**
   - Verify username and password
   - Check Azure AD permissions
   - Confirm server name is correct

3. **Schema Errors**
   - Run schema files in correct order
   - Check for existing objects
   - Verify user permissions

4. **Missing Functions**
   - Run azure-functions.sql after schema
   - Check function syntax for database type
   - Verify PostgreSQL extensions are installed

### Getting Help

- Check Azure Database documentation
- Review application logs in browser console
- Test connection strings with database tools
- Verify environment variables in Vercel dashboard

## ✅ Deployment Checklist

- [ ] Azure database created and configured
- [ ] Schema deployed successfully
- [ ] Sample data inserted
- [ ] Analytics functions created
- [ ] Connection string tested
- [ ] Environment variables configured
- [ ] Application builds without errors
- [ ] Database health check passes
- [ ] Dashboard loads with real data
- [ ] All analytics features working

## 🎉 Success!

Once completed, your Scout Analytics v3 dashboard will be running on Azure databases with:

- ✅ Full schema compatibility with Supabase
- ✅ All analytics functions working
- ✅ Real-time data from Azure databases
- ✅ Production-ready security configuration
- ✅ Optimized performance with proper indexing

Your dashboard will show real data from Azure databases instead of mock data!