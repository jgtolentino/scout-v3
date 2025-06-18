// Mock Data Provider for Scout Analytics v3
// Provides mock data when no database is connected

export interface MockDataProvider {
  from: (table: string) => MockQueryBuilder;
  rpc: (functionName: string, params?: any) => Promise<{ data: any; error: any }>;
}

interface MockQueryBuilder {
  select: (columns?: string) => MockQueryBuilder;
  eq: (column: string, value: any) => MockQueryBuilder;
  limit: (count: number) => MockQueryBuilder;
  count: any;
  head: boolean;
}

// Mock data for dashboard
const mockTransactions = Array.from({ length: 1247 }, (_, i) => ({
  id: `txn_${i + 1}`,
  total_amount: Math.random() * 1000 + 50,
  transaction_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  customer_id: `cust_${Math.floor(Math.random() * 100) + 1}`,
  store_id: Math.floor(Math.random() * 10) + 1
}));

const mockDashboardSummary = {
  total_revenue: 1285420.50,
  total_transactions: 1247,
  unique_customers: 342,
  avg_order_value: 1030.75,
  revenue_growth: 12.5,
  transaction_growth: 8.3
};

const mockCategoryData = [
  { name: 'Beverages', value: 425000, change: 15.2 },
  { name: 'Snacks', value: 320000, change: 8.7 },
  { name: 'Personal Care', value: 280000, change: -2.1 },
  { name: 'Household', value: 260000, change: 22.4 }
];

const mockBrandData = [
  { name: 'Coca-Cola', value: 180000, change: 12.3, is_tbwa: false },
  { name: 'Pepsi', value: 145000, change: 5.8, is_tbwa: false },
  { name: 'San Miguel', value: 125000, change: 18.9, is_tbwa: true },
  { name: 'Nestle', value: 98000, change: -3.2, is_tbwa: false }
];

class MockQueryBuilder {
  private table: string;
  private mockData: any[];

  constructor(table: string) {
    this.table = table;
    this.mockData = this.getMockDataForTable(table);
  }

  private getMockDataForTable(table: string): any[] {
    switch (table) {
      case 'transactions_fmcg':
      case 'transactions':
        return mockTransactions;
      case 'customers':
        return Array.from({ length: 342 }, (_, i) => ({ id: `cust_${i + 1}` }));
      case 'products':
        return Array.from({ length: 156 }, (_, i) => ({ id: `prod_${i + 1}` }));
      case 'stores':
        return Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Store ${i + 1}` }));
      case 'brands':
        return Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Brand ${i + 1}` }));
      default:
        return [];
    }
  }

  select(columns?: string): MockQueryBuilder {
    return this;
  }

  eq(column: string, value: any): MockQueryBuilder {
    return this;
  }

  limit(count: number): MockQueryBuilder {
    return this;
  }

  get count() {
    return 'exact';
  }

  get head() {
    return true;
  }

  // Mock the async result
  then(callback: any) {
    const result = {
      data: this.mockData,
      error: null,
      count: this.mockData.length
    };
    return Promise.resolve(callback(result));
  }
}

export const createMockDataProvider = (): MockDataProvider => {
  return {
    from: (table: string) => new MockQueryBuilder(table),
    rpc: async (functionName: string, params?: any) => {
      console.log(`[Mock] RPC call: ${functionName}`, params);
      
      switch (functionName) {
        case 'get_dashboard_summary':
          return { data: mockDashboardSummary, error: null };
        
        case 'get_location_distribution':
          return { 
            data: [
              { region: 'Metro Manila', total_revenue: 780000, transaction_count: 654 },
              { region: 'Central Luzon', total_revenue: 245000, transaction_count: 198 },
              { region: 'Southern Luzon', total_revenue: 180000, transaction_count: 156 },
              { region: 'Visayas', total_revenue: 80420, transaction_count: 89 }
            ], 
            error: null 
          };
        
        case 'get_product_categories_summary':
          return { data: mockCategoryData, error: null };
        
        case 'get_brand_performance':
          return { data: mockBrandData, error: null };
        
        case 'get_daily_trends':
          const trends = Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            total_revenue: Math.random() * 50000 + 30000,
            transaction_count: Math.floor(Math.random() * 50) + 20
          })).reverse();
          return { data: trends, error: null };
        
        case 'get_age_distribution_simple':
          return { 
            data: [
              { age_group: '18-24', customer_count: 89, total_spent: 125000 },
              { age_group: '25-34', customer_count: 142, total_spent: 285000 },
              { age_group: '35-44', customer_count: 95, total_spent: 425000 },
              { age_group: '45-54', customer_count: 67, total_spent: 320000 },
              { age_group: '55+', customer_count: 45, total_spent: 180000 }
            ], 
            error: null 
          };
        
        case 'get_gender_distribution_simple':
          return { 
            data: [
              { gender: 'Female', customer_count: 189, total_spent: 720000 },
              { gender: 'Male', customer_count: 153, total_spent: 565420 }
            ], 
            error: null 
          };
        
        default:
          console.warn(`[Mock] Unknown RPC function: ${functionName}`);
          return { data: null, error: { message: `Unknown function: ${functionName}` } };
      }
    }
  };
};