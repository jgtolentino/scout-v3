import { Filters } from './store';

interface QueryParams {
  select: string;
  from: string;
  where: string[];
  groupBy?: string[];
  orderBy?: string;
  limit?: number;
}

export const buildQueryFromFilters = (
  filters: Filters,
  baseTable: string = 'transactions_fmcg'
): QueryParams => {
  const params: QueryParams = {
    select: '*',
    from: baseTable,
    where: []
  };

  // Add region filter
  if (filters.region) {
    params.where.push(`region_id IN (SELECT id FROM regions_fmcg WHERE name = '${filters.region}')`);
  }

  // Add date range filter
  if (filters.dateRange) {
    const dateRange = getDateRange(filters.dateRange);
    params.where.push(`transaction_date >= '${dateRange.start}' AND transaction_date <= '${dateRange.end}'`);
  }

  // Add brand filter
  if (filters.brand) {
    params.where.push(`brand_id IN (SELECT id FROM brands_fmcg WHERE name ILIKE '%${filters.brand}%')`);
  }

  // Add category filter
  if (filters.category) {
    params.where.push(`category_id IN (SELECT id FROM categories_fmcg WHERE name ILIKE '%${filters.category}%')`);
  }

  // Add store filter
  if (filters.store) {
    params.where.push(`store_id IN (SELECT id FROM stores_fmcg WHERE name ILIKE '%${filters.store}%')`);
  }

  return params;
};

const getDateRange = (range: string): { start: string; end: string } => {
  const now = new Date();
  const end = now.toISOString().split('T')[0];

  let start: Date;
  switch (range) {
    case 'Today':
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'Last 7 days':
      start = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'Last 30 days':
      start = new Date(now.setDate(now.getDate() - 30));
      break;
    case 'Last 90 days':
      start = new Date(now.setDate(now.getDate() - 90));
      break;
    case 'This month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'Last month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case 'This quarter':
      start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      break;
    case 'Last quarter':
      start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
      break;
    case 'This year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.setDate(now.getDate() - 30));
  }

  return {
    start: start.toISOString().split('T')[0],
    end
  };
}; 