import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, Calendar, BarChart3, Users, Activity } from 'lucide-react';
import { useTransactionData } from '../hooks/useTransactionData';
import { useFilterStore } from '../store/useFilterStore';
import { getDataProvider } from '../lib/dataProvider';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface RegionalData {
  region: string;
  revenue: number;
  transactions: number;
  customers: number;
  growth: number;
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  transactions: number;
}

const PHILIPPINE_REGIONS = [
  'NCR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'Region IV-B',
  'Region V', 'Region VI', 'Region VII', 'Region VIII', 'Region IX', 'Region X',
  'Region XI', 'Region XII', 'Region XIII', 'BARMM', 'CAR'
];

const TransactionTrends: React.FC = () => {
  const { kpiData, loading, error } = useTransactionData();
  const { setBarangays, setDateRange } = useFilterStore();
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loadingRegional, setLoadingRegional] = useState(true);

  useEffect(() => {
    fetchRegionalData();
    fetchTimeSeriesData();
  }, []);

  const fetchRegionalData = async () => {
    try {
      setLoadingRegional(true);
      const db = getDataProvider();
      
      // Fetch regional performance data
      const { data, error } = await db
        .from('transactions_fmcg')
        .select(`
          total_amount,
          customer_id,
          stores!inner(barangay)
        `);

      if (error) throw error;

      // Group by region and calculate metrics
      const regionMap = new Map<string, { revenue: number; transactions: number; customers: Set<string> }>();
      
      data?.forEach((transaction: any) => {
        const region = transaction.stores?.barangay || 'Unknown';
        const current = regionMap.get(region) || { revenue: 0, transactions: 0, customers: new Set() };
        
        current.revenue += transaction.total_amount || 0;
        current.transactions += 1;
        if (transaction.customer_id) {
          current.customers.add(transaction.customer_id);
        }
        
        regionMap.set(region, current);
      });

      const regionData: RegionalData[] = Array.from(regionMap.entries()).map(([region, data]) => ({
        region,
        revenue: data.revenue,
        transactions: data.transactions,
        customers: data.customers.size,
        growth: Math.random() * 20 - 5 // Mock growth data
      })).sort((a, b) => b.revenue - a.revenue);

      setRegionalData(regionData);
    } catch (error) {
      console.error('Error fetching regional data:', error);
    } finally {
      setLoadingRegional(false);
    }
  };

  const fetchTimeSeriesData = async () => {
    try {
      const db = getDataProvider();
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        return {
          date: format(date, 'yyyy-MM-dd'),
          start: startOfDay(date),
          end: endOfDay(date)
        };
      });

      const timeSeriesPromises = last30Days.map(async ({ date, start, end }) => {
        const { data } = await db
          .from('transactions_fmcg')
          .select('total_amount')
          .gte('transaction_date', start.toISOString())
          .lte('transaction_date', end.toISOString());

        const revenue = data?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
        const transactions = data?.length || 0;

        return { date, revenue, transactions };
      });

      const results = await Promise.all(timeSeriesPromises);
      setTimeSeriesData(results);
    } catch (error) {
      console.error('Error fetching time series data:', error);
    }
  };

  const handleRegionClick = (region: string) => {
    setBarangays([region]);
  };

  const getRegionColor = (revenue: number, maxRevenue: number) => {
    const intensity = revenue / maxRevenue;
    if (intensity > 0.8) return 'bg-red-600';
    if (intensity > 0.6) return 'bg-red-500';
    if (intensity > 0.4) return 'bg-yellow-500';
    if (intensity > 0.2) return 'bg-yellow-400';
    return 'bg-gray-300';
  };

  const maxRevenue = Math.max(...regionalData.map(r => r.revenue));

  if (loading || loadingRegional) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="text-red-800">
          <h3 className="font-semibold">Error loading trends data</h3>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Transaction Trends</h1>
            <p className="text-purple-100">Regional performance and temporal analysis</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{kpiData?.totalRevenue?.toLocaleString() || '0'}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData?.totalTransactions?.toLocaleString() || '0'}
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Regions</p>
              <p className="text-2xl font-bold text-gray-900">{regionalData.length}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData?.uniqueCustomers?.toLocaleString() || '0'}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Regional Heatmap */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-purple-600" />
              Regional Performance Heatmap
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Low</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <div className="w-3 h-3 bg-red-600 rounded"></div>
              </div>
              <span>High</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {regionalData.slice(0, 15).map((region) => (
              <button
                key={region.region}
                onClick={() => handleRegionClick(region.region)}
                className={`p-3 rounded-lg border-2 border-transparent hover:border-gray-300 transition-all text-left ${getRegionColor(region.revenue, maxRevenue)}`}
              >
                <div className="text-white text-xs font-medium">{region.region}</div>
                <div className="text-white text-xs opacity-90">
                  ₱{region.revenue.toLocaleString()}
                </div>
                <div className="text-white text-xs opacity-75">
                  {region.transactions} txns
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Regions Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Top Performing Regions
          </h3>
          
          <div className="space-y-3">
            {regionalData.slice(0, 8).map((region, index) => (
              <div
                key={region.region}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleRegionClick(region.region)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{region.region}</div>
                    <div className="text-sm text-gray-500">
                      {region.transactions} transactions • {region.customers} customers
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ₱{region.revenue.toLocaleString()}
                  </div>
                  <div className={`text-sm ${region.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {region.growth >= 0 ? '+' : ''}{region.growth.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-green-600" />
          Revenue Trend (Last 30 Days)
        </h3>
        
        <div className="h-64 flex items-end space-x-1">
          {timeSeriesData.map((point, index) => {
            const maxRevenue = Math.max(...timeSeriesData.map(p => p.revenue));
            const height = (point.revenue / maxRevenue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₱{point.revenue.toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {format(new Date(point.date), 'MM/dd')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TransactionTrends;