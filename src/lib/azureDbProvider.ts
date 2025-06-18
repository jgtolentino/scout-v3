// Azure Database Provider for Scout Analytics v3
// Supports both Azure SQL and Azure PostgreSQL

import { createClient } from '@supabase/supabase-js';

export interface AzureDbConfig {
  provider: 'azure-sql' | 'azure-postgresql' | 'supabase';
  connectionString?: string;
  server?: string;
  database?: string;
  username?: string;
  password?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}

export class AzureDbProvider {
  private config: AzureDbConfig;
  private supabaseClient?: any;

  constructor(config: AzureDbConfig) {
    this.config = config;
    
    if (config.provider === 'supabase' && config.supabaseUrl && config.supabaseKey) {
      this.supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
    }
  }

  // Generic query method that adapts to different database types
  async query(sql: string, params: any[] = []): Promise<any> {
    switch (this.config.provider) {
      case 'supabase':
        return this.querySupabase(sql, params);
      case 'azure-postgresql':
        return this.queryAzurePostgreSQL(sql, params);
      case 'azure-sql':
        return this.queryAzureSQL(sql, params);
      default:
        throw new Error(`Unsupported database provider: ${this.config.provider}`);
    }
  }

  private async querySupabase(sql: string, params: any[]): Promise<any> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    // For Supabase, we use RPC calls for complex queries
    if (sql.startsWith('SELECT') && sql.includes('get_')) {
      const functionName = sql.match(/get_\w+/)?.[0];
      if (functionName) {
        const { data, error } = await this.supabaseClient.rpc(functionName, { filters: params[0] || {} });
        if (error) throw error;
        return { rows: Array.isArray(data) ? data : [data] };
      }
    }

    // For simple queries, use the query builder
    const { data, error } = await this.supabaseClient.from('transactions').select('*').limit(1);
    if (error) throw error;
    return { rows: data };
  }

  private async queryAzurePostgreSQL(sql: string, params: any[]): Promise<any> {
    // For Azure PostgreSQL, we'd use pg library
    // This is a placeholder implementation
    console.log('Azure PostgreSQL query:', sql, params);
    
    // In a real implementation, you'd use something like:
    // const { Pool } = require('pg');
    // const pool = new Pool({ connectionString: this.config.connectionString });
    // const result = await pool.query(sql, params);
    // return result;
    
    throw new Error('Azure PostgreSQL implementation pending - requires pg library');
  }

  private async queryAzureSQL(sql: string, params: any[]): Promise<any> {
    // For Azure SQL, we'd use tedious or mssql library
    // This is a placeholder implementation
    console.log('Azure SQL query:', sql, params);
    
    // In a real implementation, you'd use something like:
    // const sql = require('mssql');
    // const pool = await sql.connect(this.config.connectionString);
    // const result = await pool.request().query(sql);
    // return result;
    
    throw new Error('Azure SQL implementation pending - requires mssql library');
  }

  // Dashboard-specific methods that work across all database types
  async getDashboardSummary(filters: Record<string, any> = {}): Promise<any> {
    const sql = this.config.provider === 'supabase' 
      ? 'SELECT get_dashboard_summary($1)' 
      : 'SELECT public.get_dashboard_summary($1)';
    
    const result = await this.query(sql, [filters]);
    return result.rows[0];
  }

  async getLocationDistribution(filters: Record<string, any> = {}): Promise<any[]> {
    const sql = this.config.provider === 'supabase'
      ? 'SELECT get_location_distribution($1)'
      : 'SELECT public.get_location_distribution($1)';
    
    const result = await this.query(sql, [filters]);
    return result.rows;
  }

  async getProductCategories(filters: Record<string, any> = {}): Promise<any[]> {
    const sql = this.config.provider === 'supabase'
      ? 'SELECT get_product_categories_summary($1)'
      : 'SELECT public.get_product_categories_summary($1)';
    
    const result = await this.query(sql, [filters]);
    return result.rows;
  }

  async getBrandPerformance(filters: Record<string, any> = {}): Promise<any[]> {
    const sql = this.config.provider === 'supabase'
      ? 'SELECT get_brand_performance($1)'
      : 'SELECT public.get_brand_performance($1)';
    
    const result = await this.query(sql, [filters]);
    return result.rows;
  }

  async getDailyTrends(filters: Record<string, any> = {}): Promise<any[]> {
    const sql = this.config.provider === 'supabase'
      ? 'SELECT get_daily_trends($1)'
      : 'SELECT public.get_daily_trends($1)';
    
    const result = await this.query(sql, [filters]);
    return result.rows;
  }

  async getAgeDistribution(filters: Record<string, any> = {}): Promise<any[]> {
    const sql = this.config.provider === 'supabase'
      ? 'SELECT get_age_distribution_simple($1)'
      : 'SELECT public.get_age_distribution_simple($1)';
    
    const result = await this.query(sql, [filters]);
    return result.rows;
  }

  async getGenderDistribution(filters: Record<string, any> = {}): Promise<any[]> {
    const sql = this.config.provider === 'supabase'
      ? 'SELECT get_gender_distribution_simple($1)'
      : 'SELECT public.get_gender_distribution_simple($1)';
    
    const result = await this.query(sql, [filters]);
    return result.rows;
  }

  // Simple table queries that work across all databases
  async getTransactions(limit: number = 100, offset: number = 0): Promise<any[]> {
    const sql = `
      SELECT t.*, s.name as store_name, c.name as customer_name
      FROM transactions t
      LEFT JOIN stores s ON t.store_id = s.id
      LEFT JOIN customers c ON t.customer_id = c.id
      ORDER BY t.transaction_date DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await this.query(sql, [limit, offset]);
    return result.rows;
  }

  async getStores(): Promise<any[]> {
    const sql = 'SELECT * FROM stores ORDER BY name';
    const result = await this.query(sql, []);
    return result.rows;
  }

  async getBrands(): Promise<any[]> {
    const sql = 'SELECT * FROM brands ORDER BY name';
    const result = await this.query(sql, []);
    return result.rows;
  }

  async getProducts(limit: number = 1000): Promise<any[]> {
    const sql = `
      SELECT p.*, b.name as brand_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      ORDER BY p.product_name
      LIMIT $1
    `;
    
    const result = await this.query(sql, [limit]);
    return result.rows;
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; provider: string; timestamp: string }> {
    try {
      const sql = 'SELECT 1 as health_check';
      await this.query(sql, []);
      
      return {
        status: 'healthy',
        provider: this.config.provider,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        provider: this.config.provider,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Factory function to create database provider based on environment
export function createAzureDbProvider(): AzureDbProvider {
  const provider = import.meta.env.VITE_DB_PROVIDER || 'supabase';
  
  const config: AzureDbConfig = {
    provider: provider as any,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    connectionString: import.meta.env.VITE_AZURE_DB_CONNECTION_STRING,
    server: import.meta.env.VITE_AZURE_DB_SERVER,
    database: import.meta.env.VITE_AZURE_DB_DATABASE,
    username: import.meta.env.VITE_AZURE_DB_USERNAME,
    password: import.meta.env.VITE_AZURE_DB_PASSWORD,
  };

  return new AzureDbProvider(config);
}

export default AzureDbProvider;