 

import dataset from '../../fmcg_dataset_5000_realistic.json';

/* ------------------------------------------------------------------ */
/*         Simple helpers (in-memory scans on the JSON dataset)       */
/* ------------------------------------------------------------------ */

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getKpis(filters: any) {
  await delay(120);                         // simulate network
  const txns = filterTxns(filters);
  const revenue = sum(txns, 'total_amount');
  const aov     = revenue / txns.length || 0;
  const uniq    = new Set(txns.map((t: any) => t.customer_id)).size;
  return {
    total_revenue      : revenue,
    transactions       : txns.length,
    avg_order_value    : aov,
    units_sold         : estUnitsSold(txns),
    unique_customers   : uniq,
    gross_margin_pct   : 24.7,              // static (demo)
  };
}

export async function getRevenueTrend(filters: any) {
  await delay(100);
  const txns = filterTxns(filters);
  // Group by date
  const grouped = txns.reduce((acc: any, t: any) => {
    const date = t.transaction_date.split('T')[0];
    acc[date] = (acc[date] || 0) + t.total_amount;
    return acc;
  }, {});
  
  return Object.entries(grouped).map(([date, revenue]) => ({
    date,
    revenue
  })).slice(-30); // Last 30 days
}

export async function getCategoryBreakdown(filters: any) {
  await delay(80);
  const txns = filterTxns(filters);
  const items = dataset.transaction_items.filter((item: any) => 
    txns.some((t: any) => t.id === item.transaction_id)
  );
  
  const categories = items.reduce((acc: any, item: any) => {
    const product = dataset.products.find((p: any) => p.id === item.product_id);
    if (product) {
      acc[product.category] = (acc[product.category] || 0) + item.total_price;
    }
    return acc;
  }, {});

  return Object.entries(categories).map(([category, revenue]) => ({
    category,
    revenue
  }));
}

// Mock Supabase-like interface
export const from = (table: string) => ({
  select: (columns: string) => ({
    eq: (column: string, value: any) => mockQuery(table, { [column]: value }),
    limit: (count: number) => mockQuery(table, {}, count),
    range: (from: number, to: number) => mockQuery(table, {}, to - from + 1, from)
  })
});

async function mockQuery(table: string, filters: any = {}, limit?: number, offset?: number) {
  await delay(50);
  
  let data: any[] = [];
  
  switch (table) {
    case 'transactions_fmcg':
      data = filterTxns(filters);
      break;
    case 'transaction_items_fmcg':
      data = dataset.transaction_items.filter((item: any) => {
        const product = dataset.products.find((p: any) => p.id === item.product_id);
        return product?.is_fmcg;
      });
      break;
    case 'products':
      data = dataset.products;
      break;
    case 'customers':
      data = dataset.customers;
      break;
    case 'stores':
      data = dataset.stores;
      break;
    default:
      data = [];
  }

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    data = data.filter((item: any) => item[key] === value);
  });

  // Apply pagination
  if (offset) data = data.slice(offset);
  if (limit) data = data.slice(0, limit);

  return { data, error: null };
}

/* Helper functions */
function filterTxns(filters: any) {
  return dataset.transactions.filter((t: any) => {
    if (filters?.date_from && t.transaction_date < filters.date_from) return false;
    if (filters?.date_to   && t.transaction_date > filters.date_to)   return false;
    return true;
  });
}

function sum(arr: any[], field: string) {
  return arr.reduce((s: number, x: any) => s + (x[field] ?? 0), 0);
}

function estUnitsSold(txns: any[]) { 
  return Math.round(txns.length * 1.45); 
}