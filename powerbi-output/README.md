
# Scout MVP Power BI Dashboard

This directory contains the generated Power BI dashboard template and deployment scripts.

## Files Generated

- `scout-powerbi-template.json`: Power BI template definition
- `deploy-powerbi.ps1`: PowerShell deployment script
- `README.md`: This file

## Visualizations Included

1. **Transaction Trends** - Time series chart showing transaction patterns
2. **Peso Value Distribution** - Histogram of transaction amounts  
3. **Units per Transaction** - Box plot analysis
4. **Volume by Time & Location** - Heatmap matrix
5. **Category & Brand Breakdown** - Stacked bar chart
6. **Top SKUs per Category** - Ranked bar chart
7. **Substitution Patterns** - Sankey diagram
8. **Consumer Behavior Funnel** - Funnel chart
9. **Gender Distribution** - Donut chart
10. **Age Distribution** - Treemap
11. **Store Location Map** - Geographic visualization
12. **AI Recommendations Panel** - Text card

## Data Source Configuration

- **Server**: sqltbwaprojectscoutserver.database.windows.net
- **Database**: SQL-TBWA-ProjectScout-Reporting-Prod
- **Authentication**: SQL Server Authentication required

## Deployment Instructions

1. Install Power BI Desktop and Power BI CLI
2. Run the deployment script: `./deploy-powerbi.ps1`
3. Configure data source credentials in Power BI Service
4. Publish to workspace: "Scout MVP Insights"

## Notes

- Ensure your Azure SQL database allows Power BI connections
- Configure firewall rules to allow Power BI service IPs
- Set up automated data refresh schedules as needed
