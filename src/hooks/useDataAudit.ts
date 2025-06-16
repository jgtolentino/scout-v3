import { useState, useEffect } from 'react';
import { getDataProvider } from '../lib/dataProvider';

interface DataAuditResult {
  // Record counts
  totalTransactions: number;
  totalCustomers: number;
  totalProducts: number;
  totalStores: number;
  totalBrands: number;
  
  // Data quality metrics
  dataQualityScore: number;
  missingDataPercentage: number;
  duplicateRecords: number;
  
  // KPI validation
  revenueValidation: {
    calculatedTotal: number;
    databaseTotal: number;
    variance: number;
    isValid: boolean;
  };
  
  // Time range validation
  dateRange: {
    earliest: string;
    latest: string;
    daysSpan: number;
  };
  
  // Data distribution
  categoryDistribution: Record<string, number>;
  brandDistribution: Record<string, number>;
  
  // Audit metadata
  auditTimestamp: string;
  auditDuration: number;
  lastUpdated: string;
}

interface ValidationError {
  type: 'error' | 'warning' | 'info';
  message: string;
  impact: 'critical' | 'moderate' | 'low';
  details?: Record<string, unknown>;
}

export const useDataAudit = () => {
  const [auditResult, setAuditResult] = useState<DataAuditResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    const startTime = Date.now();
    setLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      console.log('[Data Audit] Starting comprehensive data audit...');
      
      const db = getDataProvider();

      // 1. Get record counts from all tables
      const [
        transactionCount,
        customerCount,
        productCount,
        storeCount,
        brandCount
      ] = await Promise.all([
        db.from('transactions_fmcg').select('*', { count: 'exact', head: true }),
        db.from('customers').select('*', { count: 'exact', head: true }),
        db.from('products').select('*', { count: 'exact', head: true }),
        db.from('stores').select('*', { count: 'exact', head: true }),
        db.from('brands').select('*', { count: 'exact', head: true })
      ]);

      // 2. Get transaction data for validation
      const { data: transactions } = await db
        .from('transactions_fmcg')
        .select('id, total_amount, transaction_date, customer_id, store_id');

      if (!transactions) {
        throw new Error('Failed to fetch transaction data for audit');
      }

      // 3. Calculate revenue validation
      const calculatedTotal = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
      
      // Get database aggregate
      const { data: aggregateData } = await db
        .from('transactions_fmcg')
        .select('total_amount.sum()');

      const databaseTotal = aggregateData?.[0]?.sum || 0;
      const variance = Math.abs(calculatedTotal - databaseTotal);
      const variancePercentage = calculatedTotal > 0 ? (variance / calculatedTotal) * 100 : 0;

      // 4. Date range analysis
      const dates = transactions.map(t => new Date(t.transaction_date)).sort();
      const earliest = dates[0];
      const latest = dates[dates.length - 1];
      const daysSpan = Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24));

      // 5. Data quality checks
      const missingAmounts = transactions.filter(t => !t.total_amount || t.total_amount <= 0).length;
      const missingDates = transactions.filter(t => !t.transaction_date).length;
      const missingCustomers = transactions.filter(t => !t.customer_id).length;
      const missingStores = transactions.filter(t => !t.store_id).length;

      const totalMissingFields = missingAmounts + missingDates + missingCustomers + missingStores;
      const totalFields = transactions.length * 4; // 4 key fields per transaction
      const missingDataPercentage = (totalMissingFields / totalFields) * 100;

      // 6. Check for duplicates
      const uniqueIds = new Set(transactions.map(t => t.id));
      const duplicateRecords = transactions.length - uniqueIds.size;

      // 7. Data quality score calculation
      let qualityScore = 100;
      if (missingDataPercentage > 0) qualityScore -= missingDataPercentage * 2;
      if (duplicateRecords > 0) qualityScore -= (duplicateRecords / transactions.length) * 10;
      if (variancePercentage > 1) qualityScore -= variancePercentage;
      qualityScore = Math.max(0, Math.round(qualityScore));

      // 8. Get category and brand distribution
      const { data: categoryData } = await db
        .from('transaction_items_fmcg')
        .select(`
          products!inner (
            category
          )
        `);

      const { data: brandData } = await db
        .from('transaction_items_fmcg')
        .select(`
          products!inner (
            brands!inner (
              name
            )
          )
        `);

      const categoryDistribution: Record<string, number> = {};
      categoryData?.forEach(item => {
        const category = item.products?.category || 'Unknown';
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      });

      const brandDistribution: Record<string, number> = {};
      brandData?.forEach(item => {
        const brand = item.products?.brands?.name || 'Unknown';
        brandDistribution[brand] = (brandDistribution[brand] || 0) + 1;
      });

      // 9. Generate validation errors/warnings
      const errors: ValidationError[] = [];

      if (variancePercentage > 1) {
        errors.push({
          type: 'warning',
          message: `Revenue calculation variance: ${variancePercentage.toFixed(2)}%`,
          impact: 'moderate',
          details: { calculated: calculatedTotal, database: databaseTotal }
        });
      }

      if (missingDataPercentage > 5) {
        errors.push({
          type: 'error',
          message: `High missing data rate: ${missingDataPercentage.toFixed(2)}%`,
          impact: 'critical'
        });
      }

      if (duplicateRecords > 0) {
        errors.push({
          type: 'warning',
          message: `Found ${duplicateRecords} duplicate transaction records`,
          impact: 'moderate'
        });
      }

      if (daysSpan < 30) {
        errors.push({
          type: 'info',
          message: `Limited date range: only ${daysSpan} days of data`,
          impact: 'low'
        });
      }

      // 10. Compile audit result
      const auditDuration = Date.now() - startTime;
      const result: DataAuditResult = {
        totalTransactions: transactionCount.count || 0,
        totalCustomers: customerCount.count || 0,
        totalProducts: productCount.count || 0,
        totalStores: storeCount.count || 0,
        totalBrands: brandCount.count || 0,
        
        dataQualityScore: qualityScore,
        missingDataPercentage,
        duplicateRecords,
        
        revenueValidation: {
          calculatedTotal,
          databaseTotal,
          variance,
          isValid: variancePercentage < 1
        },
        
        dateRange: {
          earliest: earliest.toISOString(),
          latest: latest.toISOString(),
          daysSpan
        },
        
        categoryDistribution,
        brandDistribution,
        
        auditTimestamp: new Date().toISOString(),
        auditDuration,
        lastUpdated: new Date().toLocaleString()
      };

      console.log('[Data Audit] Audit completed:', result);
      setAuditResult(result);
      setValidationErrors(errors);

    } catch (err) {
      console.error('[Data Audit] Audit failed:', err);
      setError(err instanceof Error ? err.message : 'Audit failed');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run audit on mount
  useEffect(() => {
    runAudit();
  }, []);

  return {
    auditResult,
    validationErrors,
    loading,
    error,
    runAudit
  };
};