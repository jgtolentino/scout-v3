#!/usr/bin/env node

/**
 * Power BI Dashboard Generator for Scout MVP
 * Generates a Power BI template (.pbit) file with predefined visualizations
 * for the Scout Analytics dashboard
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  dataSource: "sqltbwaprojectscoutserver.database.windows.net",
  database: "SQL-TBWA-ProjectScout-Reporting-Prod",
  reportName: "Scout Dashboard",
  workspace: "Scout MVP Insights"
};

// Power BI Template Structure
const powerBITemplate = {
  version: "1.0",
  config: {
    dataModel: {
      name: "ScoutAnalyticsModel",
      connections: [
        {
          name: "AzureSQLConnection",
          connectionString: `Data Source=${config.dataSource};Initial Catalog=${config.database};Integrated Security=False;Encrypt=True;TrustServerCertificate=False`,
          provider: "System.Data.SqlClient",
          type: "sql"
        }
      ],
      tables: [
        {
          name: "transactions",
          source: "SELECT * FROM transactions",
          columns: [
            { name: "transaction_id", type: "Int64" },
            { name: "transaction_datetime", type: "DateTime" },
            { name: "store_id", type: "Int64" },
            { name: "customer_id", type: "Int64" },
            { name: "total_amount", type: "Currency" },
            { name: "created_at", type: "DateTime" }
          ]
        },
        {
          name: "transaction_items",
          source: "SELECT * FROM transaction_items",
          columns: [
            { name: "item_id", type: "Int64" },
            { name: "transaction_id", type: "Int64" },
            { name: "product_id", type: "Int64" },
            { name: "quantity", type: "Int64" },
            { name: "unit_price", type: "Currency" },
            { name: "brand_requested", type: "Text" },
            { name: "brand_fulfilled", type: "Text" }
          ]
        },
        {
          name: "products",
          source: "SELECT * FROM products",
          columns: [
            { name: "product_id", type: "Int64" },
            { name: "name", type: "Text" },
            { name: "category", type: "Text" },
            { name: "brand_id", type: "Int64" },
            { name: "price", type: "Currency" }
          ]
        },
        {
          name: "stores",
          source: "SELECT * FROM stores",
          columns: [
            { name: "store_id", type: "Int64" },
            { name: "name", type: "Text" },
            { name: "barangay", type: "Text" },
            { name: "city", type: "Text" },
            { name: "region", type: "Text" },
            { name: "latitude", type: "Decimal" },
            { name: "longitude", type: "Decimal" }
          ]
        },
        {
          name: "customers",
          source: "SELECT * FROM customers",
          columns: [
            { name: "customer_id", type: "Int64" },
            { name: "age", type: "Int64" },
            { name: "gender", type: "Text" },
            { name: "income_bracket", type: "Text" }
          ]
        },
        {
          name: "brands",
          source: "SELECT * FROM brands",
          columns: [
            { name: "brand_id", type: "Int64" },
            { name: "name", type: "Text" },
            { name: "company", type: "Text" }
          ]
        }
      ],
      relationships: [
        {
          from: "transaction_items[transaction_id]",
          to: "transactions[transaction_id]",
          type: "many-to-one"
        },
        {
          from: "transaction_items[product_id]",
          to: "products[product_id]",
          type: "many-to-one"
        },
        {
          from: "transactions[store_id]",
          to: "stores[store_id]",
          type: "many-to-one"
        },
        {
          from: "transactions[customer_id]",
          to: "customers[customer_id]",
          type: "many-to-one"
        },
        {
          from: "products[brand_id]",
          to: "brands[brand_id]",
          type: "many-to-one"
        }
      ],
      measures: [
        {
          name: "TransactionCount",
          expression: "COUNTROWS(transactions)",
          table: "transactions"
        },
        {
          name: "TotalRevenue",
          expression: "SUM(transactions[total_amount])",
          table: "transactions"
        },
        {
          name: "UnitsPerTransaction",
          expression: "DIVIDE(SUM(transaction_items[quantity]), COUNTROWS(transactions))",
          table: "transaction_items"
        },
        {
          name: "AverageTransactionValue",
          expression: "AVERAGE(transactions[total_amount])",
          table: "transactions"
        },
        {
          name: "SubstitutionRate",
          expression: "DIVIDE(COUNTROWS(FILTER(transaction_items, transaction_items[brand_requested] <> transaction_items[brand_fulfilled])), COUNTROWS(transaction_items))",
          table: "transaction_items"
        }
      ]
    },
    pages: [
      {
        name: "Overview Dashboard",
        visuals: [
          {
            type: "card",
            title: "Total Transactions",
            measure: "TransactionCount",
            position: { x: 0, y: 0, width: 200, height: 100 },
            formatting: {
              fontSize: 24,
              fontColor: "#2C3E50",
              backgroundColor: "#ECF0F1"
            }
          },
          {
            type: "card",
            title: "Total Revenue",
            measure: "TotalRevenue",
            position: { x: 220, y: 0, width: 200, height: 100 },
            formatting: {
              fontSize: 24,
              fontColor: "#27AE60",
              backgroundColor: "#ECF0F1",
              displayUnits: "thousands"
            }
          },
          {
            type: "lineChart",
            title: "Transaction Trends",
            xAxis: "transactions[transaction_datetime]",
            yAxis: "TransactionCount",
            position: { x: 0, y: 120, width: 600, height: 300 },
            formatting: {
              xAxisTitle: "Date",
              yAxisTitle: "Transaction Count",
              lineColor: "#3498DB"
            }
          },
          {
            type: "histogram",
            title: "Peso Value Distribution",
            field: "transactions[total_amount]",
            position: { x: 620, y: 120, width: 400, height: 300 },
            formatting: {
              bins: 20,
              barColor: "#E74C3C"
            }
          },
          {
            type: "matrix",
            title: "Volume by Time & Location",
            rows: "stores[region]",
            columns: "HOUR(transactions[transaction_datetime])",
            values: "TransactionCount",
            position: { x: 0, y: 440, width: 500, height: 250 },
            formatting: {
              colorScale: ["#FFF", "#3498DB"]
            }
          }
        ]
      },
      {
        name: "Product Analytics",
        visuals: [
          {
            type: "stackedColumnChart",
            title: "Category & Brand Breakdown",
            xAxis: "products[category]",
            yAxis: "TransactionCount",
            legend: "brands[name]",
            position: { x: 0, y: 0, width: 600, height: 300 },
            formatting: {
              xAxisTitle: "Category",
              yAxisTitle: "Transaction Count"
            }
          },
          {
            type: "columnChart",
            title: "Top 10 SKUs per Category",
            xAxis: "products[name]",
            yAxis: "TransactionCount",
            filters: {
              topN: {
                field: "TransactionCount",
                count: 10
              }
            },
            position: { x: 620, y: 0, width: 400, height: 300 },
            formatting: {
              barColor: "#9B59B6"
            }
          },
          {
            type: "sankeyDiagram",
            title: "Substitution Patterns",
            source: "transaction_items[brand_requested]",
            target: "transaction_items[brand_fulfilled]",
            value: "COUNTROWS(transaction_items)",
            position: { x: 0, y: 320, width: 1020, height: 300 },
            formatting: {
              linkColor: "#34495E",
              nodeColor: "#2ECC71"
            }
          }
        ]
      },
      {
        name: "Consumer Insights",
        visuals: [
          {
            type: "funnelChart",
            title: "Consumer Behavior Funnel",
            category: "BehaviorStage",
            values: "Count",
            position: { x: 0, y: 0, width: 400, height: 400 },
            data: [
              { stage: "Brand Mentioned", count: 5000 },
              { stage: "Storeowner Suggestion", count: 3500 },
              { stage: "Purchase", count: 2800 }
            ]
          },
          {
            type: "donutChart",
            title: "Consumer Profiling by Gender",
            category: "customers[gender]",
            values: "COUNTROWS(customers)",
            position: { x: 420, y: 0, width: 300, height: 400 },
            formatting: {
              colors: ["#E91E63", "#2196F3", "#FF9800"]
            }
          },
          {
            type: "treemap",
            title: "Age Distribution",
            category: "AgeGroup",
            values: "COUNTROWS(customers)",
            position: { x: 740, y: 0, width: 280, height: 400 },
            formatting: {
              colorScale: ["#FFF59D", "#FF8A65"]
            }
          },
          {
            type: "map",
            title: "Store Location Mapping",
            latitude: "stores[latitude]",
            longitude: "stores[longitude]",
            size: "TransactionCount",
            position: { x: 0, y: 420, width: 500, height: 300 },
            formatting: {
              mapStyle: "road",
              bubbleColor: "#FF5722"
            }
          },
          {
            type: "textbox",
            title: "AI Recommendations Panel",
            content: "AI-powered insights will be displayed here based on real-time analysis",
            position: { x: 520, y: 420, width: 500, height: 300 },
            formatting: {
              fontSize: 14,
              fontColor: "#2C3E50",
              backgroundColor: "#F8F9FA",
              border: "1px solid #DEE2E6"
            }
          }
        ]
      }
    ]
  }
};

// DAX Measures for calculated fields
const daxMeasures = {
  // Time-based calculations
  HourOfDay: "HOUR(transactions[transaction_datetime])",
  DayOfWeek: "WEEKDAY(transactions[transaction_datetime])",
  MonthName: "FORMAT(transactions[transaction_datetime], \"MMMM\")",
  
  // Age grouping
  AgeGroup: `
    SWITCH(
      TRUE(),
      customers[age] < 25, "18-24",
      customers[age] < 35, "25-34", 
      customers[age] < 45, "35-44",
      customers[age] < 55, "45-54",
      "55+"
    )
  `,
  
  // Transaction value brackets
  TransactionValueBracket: `
    SWITCH(
      TRUE(),
      transactions[total_amount] < 100, "₱0-99",
      transactions[total_amount] < 500, "₱100-499",
      transactions[total_amount] < 1000, "₱500-999",
      "₱1000+"
    )
  `,
  
  // Performance metrics
  RevenueGrowthMoM: `
    VAR CurrentMonth = SUM(transactions[total_amount])
    VAR PreviousMonth = CALCULATE(
      SUM(transactions[total_amount]),
      DATEADD(transactions[transaction_datetime], -1, MONTH)
    )
    RETURN DIVIDE(CurrentMonth - PreviousMonth, PreviousMonth)
  `,
  
  // Substitution analysis
  SubstitutionCount: "COUNTROWS(FILTER(transaction_items, transaction_items[brand_requested] <> transaction_items[brand_fulfilled]))",
  
  BrandLoyaltyRate: `
    DIVIDE(
      COUNTROWS(FILTER(transaction_items, transaction_items[brand_requested] = transaction_items[brand_fulfilled])),
      COUNTROWS(transaction_items)
    )
  `
};

// Generate Power BI JSON template
function generatePowerBIJSON() {
  const template = {
    ...powerBITemplate,
    metadata: {
      generatedBy: "Scout MVP Power BI Generator",
      generatedAt: new Date().toISOString(),
      version: "1.0.0",
      dataSource: config.dataSource,
      reportName: config.reportName
    },
    daxMeasures: daxMeasures
  };

  return JSON.stringify(template, null, 2);
}

// Generate Power BI deployment script
function generateDeploymentScript() {
  return `
# Power BI Deployment Script for Scout Dashboard
# Generated on ${new Date().toISOString()}

# Prerequisites:
# 1. Install Power BI CLI: https://docs.microsoft.com/en-us/power-bi/developer/automation/overview-of-power-bi-rest-api
# 2. Azure CLI installed and authenticated
# 3. Power BI Pro license

# Variables
$WorkspaceName = "${config.workspace}"
$ReportName = "${config.reportName}"
$DatasetName = "ScoutAnalyticsDataset"
$TemplateFile = "./scout-powerbi-template.json"

# Authenticate to Power BI
Write-Host "Authenticating to Power BI..."
Connect-PowerBIServiceAccount

# Create workspace if it doesn't exist
Write-Host "Creating workspace: $WorkspaceName"
try {
    $workspace = Get-PowerBIWorkspace -Name $WorkspaceName
    Write-Host "Workspace exists: $($workspace.Id)"
} catch {
    $workspace = New-PowerBIWorkspace -Name $WorkspaceName
    Write-Host "Created new workspace: $($workspace.Id)"
}

# Import dataset and report
Write-Host "Importing Power BI template..."
$import = New-PowerBIImport -Path $TemplateFile -WorkspaceId $workspace.Id -ConflictAction "CreateOrOverwrite"

Write-Host "Import completed. Report ID: $($import.Id)"

# Configure data source credentials
Write-Host "Configuring data source credentials..."
$dataSourceId = (Get-PowerBIDataset -WorkspaceId $workspace.Id -Name $DatasetName).Id

# Note: You'll need to set up credentials manually in the Power BI service
# or use the REST API to configure them programmatically

Write-Host "Deployment completed!"
Write-Host "Workspace: $WorkspaceName"
Write-Host "Report: $ReportName"
Write-Host "Please configure data source credentials in Power BI Service"
`;
}

// Main execution
function main() {
  console.log('🚀 Generating Power BI Dashboard for Scout MVP...');
  
  // Create output directory
  const outputDir = path.join(__dirname, '..', 'powerbi-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate template file
  const templateJSON = generatePowerBIJSON();
  const templatePath = path.join(outputDir, 'scout-powerbi-template.json');
  fs.writeFileSync(templatePath, templateJSON);
  console.log('✅ Generated Power BI template:', templatePath);

  // Generate deployment script
  const deploymentScript = generateDeploymentScript();
  const deploymentPath = path.join(outputDir, 'deploy-powerbi.ps1');
  fs.writeFileSync(deploymentPath, deploymentScript);
  console.log('✅ Generated deployment script:', deploymentPath);

  // Generate README
  const readme = `
# Scout MVP Power BI Dashboard

This directory contains the generated Power BI dashboard template and deployment scripts.

## Files Generated

- \`scout-powerbi-template.json\`: Power BI template definition
- \`deploy-powerbi.ps1\`: PowerShell deployment script
- \`README.md\`: This file

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

- **Server**: ${config.dataSource}
- **Database**: ${config.database}
- **Authentication**: SQL Server Authentication required

## Deployment Instructions

1. Install Power BI Desktop and Power BI CLI
2. Run the deployment script: \`./deploy-powerbi.ps1\`
3. Configure data source credentials in Power BI Service
4. Publish to workspace: "${config.workspace}"

## Notes

- Ensure your Azure SQL database allows Power BI connections
- Configure firewall rules to allow Power BI service IPs
- Set up automated data refresh schedules as needed
`;

  const readmePath = path.join(outputDir, 'README.md');
  fs.writeFileSync(readmePath, readme);
  console.log('✅ Generated README:', readmePath);

  console.log('\n🎉 Power BI Dashboard Generation Complete!');
  console.log(`\n📁 Output directory: ${outputDir}`);
  console.log('\n📋 Next steps:');
  console.log('1. Review the generated template file');
  console.log('2. Configure Azure SQL database connectivity');
  console.log('3. Run the deployment script');
  console.log('4. Set up data source credentials in Power BI Service');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generatePowerBIJSON, generateDeploymentScript, powerBITemplate };