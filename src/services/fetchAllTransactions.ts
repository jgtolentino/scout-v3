import { supabase } from '../lib/supabase';

const BATCH_SIZE = 1000;

export interface TransactionRecord {
  id: string;
  transaction_date: string;
  total_amount: number;
  customer_id: string;
  store_id: string;
  payment_method?: string;
  transaction_items_fmcg?: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_id: string;
    products?: {
      id: string;
      name: string;
      category: string;
      unit_cost: number;
      brand_id: string;
      brands?: {
        name: string;
        company?: string;
      };
    };
  }[];
  customers?: {
    id: string;
    customer_id: string;
    first_name?: string;
    last_name?: string;
    age?: number;
    gender?: string;
    income_bracket?: string;
  };
  stores?: {
    id: string;
    name: string;
    region: string;
    address?: string;
  };
}

export async function fetchAllTransactions(): Promise<{
  transactions: TransactionRecord[];
  totalCount: number;
  error?: string;
}> {
  let allTransactions: TransactionRecord[] = [];
  let offset = 0;
  let batch;
  let totalCount = 0;

  try {
    // First, get the total count
    const { count, error: countError } = await supabase
      .from('transactions_fmcg')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting transaction count:', countError);
      return { transactions: [], totalCount: 0, error: countError.message };
    }

    totalCount = count || 0;
    console.log(`📊 Fetching ${totalCount} total transactions in batches of ${BATCH_SIZE}`);

    // Fetch all records in batches
    do {
      console.log(`🔄 Fetching batch ${Math.floor(offset / BATCH_SIZE) + 1}, records ${offset}-${offset + BATCH_SIZE - 1}`);
      
      const { data, error } = await supabase
        .from('transactions_fmcg')
        .select(`
          id,
          transaction_date,
          total_amount,
          customer_id,
          store_id,
          payment_method,
          transaction_items_fmcg!transaction_items_fmcg_transaction_id_fkey (
            id,
            quantity,
            unit_price,
            total_price,
            product_id,
            products (
              id,
              name,
              category,
              unit_cost,
              brand_id,
              brands (
                name,
                company
              )
            )
          ),
          customers (
            id,
            customer_id,
            first_name,
            last_name,
            age,
            gender,
            income_bracket
          ),
          stores (
            id,
            name,
            region,
            address
          )
        `)
        .order('transaction_date', { ascending: false })
        .range(offset, offset + BATCH_SIZE - 1);

      if (error) {
        console.error(`❌ Supabase error at offset ${offset}:`, error);
        
        // Try simplified query without relationships if FK fails
        const { data: simpleData, error: simpleError } = await supabase
          .from('transactions_fmcg')
          .select('*')
          .order('transaction_date', { ascending: false })
          .range(offset, offset + BATCH_SIZE - 1);

        if (simpleError) {
          return { 
            transactions: allTransactions, 
            totalCount: allTransactions.length, 
            error: `Batch fetch failed: ${error.message}` 
          };
        }

        batch = simpleData || [];
        console.log(`⚠️ Using simplified query without relationships for batch ${Math.floor(offset / BATCH_SIZE) + 1}`);
      } else {
        batch = data || [];
        console.log(`✅ Successfully fetched ${batch.length} records with full relationships`);
      }

      allTransactions.push(...batch);
      offset += BATCH_SIZE;
      
      // Add a small delay to avoid overwhelming the API
      if (batch.length === BATCH_SIZE) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } while (batch.length === BATCH_SIZE && offset < 10000); // Safety limit

    console.log(`✅ Completed fetching ${allTransactions.length} transactions`);
    
    return {
      transactions: allTransactions,
      totalCount: allTransactions.length,
    };

  } catch (error) {
    console.error('❌ Fatal error fetching transactions:', error);
    return {
      transactions: allTransactions,
      totalCount: allTransactions.length,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function fetchTransactionStats(): Promise<{
  totalTransactions: number;
  dateRange: { from: string; to: string };
  totalRevenue: number;
  uniqueCustomers: number;
  totalItems: number;
}> {
  try {
    const { data, error } = await supabase.rpc('get_transaction_stats');
    
    if (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }

    return data;
  } catch (error) {
    // Fallback to direct queries
    const [
      { count: transactionCount },
      { data: revenueData },
      { data: dateRangeData },
      { data: customerData },
      { data: itemData }
    ] = await Promise.all([
      supabase.from('transactions_fmcg').select('*', { count: 'exact', head: true }),
      supabase.from('transactions_fmcg').select('total_amount'),
      supabase.from('transactions_fmcg').select('transaction_date').order('transaction_date', { ascending: true }).limit(1),
      supabase.from('transactions_fmcg').select('customer_id'),
      supabase.from('transaction_items_fmcg').select('quantity')
    ]);

    const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
    const uniqueCustomers = new Set(customerData?.map(c => c.customer_id)).size;
    const totalItems = itemData?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0;

    return {
      totalTransactions: transactionCount || 0,
      dateRange: {
        from: dateRangeData?.[0]?.transaction_date || '',
        to: dateRangeData?.[dateRangeData.length - 1]?.transaction_date || ''
      },
      totalRevenue,
      uniqueCustomers,
      totalItems
    };
  }
}