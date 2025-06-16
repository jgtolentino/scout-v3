
/**
 * Power BI REST API Helper for Scout Dashboard
 * Use this to create dashboards programmatically without Power BI Desktop
 */

import fetch from 'node-fetch';

class PowerBIAPIClient {
  constructor(config) {
    this.config = config;
    this.accessToken = null;
  }

  async authenticate() {
    const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
    
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: 'https://analysis.windows.net/powerbi/api/.default',
      grant_type: 'client_credentials'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken;
  }

  async createWorkspace(name) {
    await this.authenticate();
    
    const response = await fetch(`${this.config.baseUrl}/groups`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });

    return response.json();
  }

  async createDataset(workspaceId, datasetDef) {
    const response = await fetch(`${this.config.baseUrl}/groups/${workspaceId}/datasets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datasetDef)
    });

    return response.json();
  }

  async createReport(workspaceId, reportDef) {
    const response = await fetch(`${this.config.baseUrl}/groups/${workspaceId}/reports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportDef)
    });

    return response.json();
  }

  // Scout-specific dataset definition
  getScoutDatasetDefinition() {
    return {
      name: "ScoutAnalyticsDataset",
      tables: [
        {
          name: "transactions",
          columns: [
            { name: "transaction_id", dataType: "Int64" },
            { name: "transaction_datetime", dataType: "DateTime" },
            { name: "store_id", dataType: "Int64" },
            { name: "customer_id", dataType: "Int64" },
            { name: "total_amount", dataType: "Double" }
          ]
        },
        {
          name: "transaction_items", 
          columns: [
            { name: "item_id", dataType: "Int64" },
            { name: "transaction_id", dataType: "Int64" },
            { name: "product_id", dataType: "Int64" },
            { name: "quantity", dataType: "Int64" },
            { name: "unit_price", dataType: "Double" },
            { name: "brand_requested", dataType: "String" },
            { name: "brand_fulfilled", dataType: "String" }
          ]
        },
        {
          name: "products",
          columns: [
            { name: "product_id", dataType: "Int64" },
            { name: "name", dataType: "String" },
            { name: "category", dataType: "String" },
            { name: "brand_id", dataType: "Int64" },
            { name: "price", dataType: "Double" }
          ]
        },
        {
          name: "stores",
          columns: [
            { name: "store_id", dataType: "Int64" },
            { name: "name", dataType: "String" },
            { name: "barangay", dataType: "String" },
            { name: "city", dataType: "String" },
            { name: "region", dataType: "String" },
            { name: "latitude", dataType: "Double" },
            { name: "longitude", dataType: "Double" }
          ]
        },
        {
          name: "customers",
          columns: [
            { name: "customer_id", dataType: "Int64" },
            { name: "age", dataType: "Int64" },
            { name: "gender", dataType: "String" },
            { name: "income_bracket", dataType: "String" }
          ]
        },
        {
          name: "brands",
          columns: [
            { name: "brand_id", dataType: "Int64" },
            { name: "name", dataType: "String" },
            { name: "company", dataType: "String" }
          ]
        }
      ],
      relationships: [
        {
          name: "TransactionToItems",
          fromTable: "transaction_items",
          fromColumn: "transaction_id", 
          toTable: "transactions",
          toColumn: "transaction_id"
        },
        {
          name: "ItemsToProducts",
          fromTable: "transaction_items",
          fromColumn: "product_id",
          toTable: "products", 
          toColumn: "product_id"
        },
        {
          name: "TransactionToStore",
          fromTable: "transactions",
          fromColumn: "store_id",
          toTable: "stores",
          toColumn: "store_id" 
        },
        {
          name: "TransactionToCustomer",
          fromTable: "transactions",
          fromColumn: "customer_id",
          toTable: "customers",
          toColumn: "customer_id"
        },
        {
          name: "ProductToBrand",
          fromTable: "products",
          fromColumn: "brand_id",
          toTable: "brands",
          toColumn: "brand_id"
        }
      ]
    };
  }
}

export default PowerBIAPIClient;
