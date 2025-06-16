
# Power BI Web Dashboard Setup (No Desktop Required)

## Quick Start Options

### Option 1: Use Power BI Embedded Dashboard (Recommended)
1. Open `scout-dashboard-embedded.html` in your browser
2. Get your Power BI credentials from Azure portal
3. Fill in the configuration form
4. Load your dashboard directly in the browser

### Option 2: Create via REST API
```bash
# Install dependencies
npm install node-fetch

# Set environment variables
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id" 
export AZURE_CLIENT_SECRET="your-client-secret"

# Run the API helper
node powerbi-api-helper.js
```

### Option 3: Use Power BI Service Web Interface
1. Go to https://app.powerbi.com
2. Create new workspace: "Scout MVP Insights"
3. Upload dataset manually using the web interface
4. Create reports using the web report builder

## Getting Power BI Credentials

### 1. Azure App Registration
1. Go to Azure Portal > App Registrations
2. Create new registration: "Scout-PowerBI-App"
3. Note the Application (client) ID and Tenant ID
4. Create client secret in "Certificates & secrets"

### 2. Power BI Service Permissions
1. Go to Power BI Admin Portal
2. Enable "Service principal access" for your app
3. Add your app to a workspace with Admin permissions

### 3. Configure Data Source
1. In Power BI Service, go to Settings > Data source credentials
2. Add Azure SQL connection:
   - Server: sqltbwaprojectscoutserver.database.windows.net
   - Database: SQL-TBWA-ProjectScout-Reporting-Prod
   - Authentication: SQL Server Authentication

## Features Included

✅ All 12 requested visualizations
✅ Real-time data connection to Azure SQL
✅ Interactive filtering and drilling
✅ Mobile-responsive design
✅ Embedded authentication
✅ Fallback mock charts if Power BI unavailable

## No-Code Alternatives

If you prefer not to use Power BI at all, the embedded dashboard includes:
- Chart.js visualizations as fallback
- Direct connection to your Supabase/Azure SQL
- Custom interactive filters
- Export capabilities

## Support

- Power BI Documentation: https://docs.microsoft.com/power-bi/
- Azure Authentication: https://docs.microsoft.com/azure/active-directory/
- REST API Reference: https://docs.microsoft.com/rest/api/power-bi/
