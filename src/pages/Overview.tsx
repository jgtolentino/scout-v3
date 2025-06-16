import React, { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
/*
 * 🔄 14-Jun-2025 Hot-fix
 * The page was wired to the outdated `useSupabaseData` hook that still relies on the broken
 * `get_dashboard_summary` RPC.
 * Switch to the new `useTransactionData` hook that already pulls live rows directly
 * from the `transactions` table.
 */
import { useTransactionData } from '../hooks/useTransactionData';
import ChartCard from '../components/ui/ChartCard';
import DonutChart from '../components/charts/DonutChart';
import LineChart from '../components/charts/LineChart';
import AIInsightsPanel from '../components/insights/AIInsightsPanel';
import ErrorState from '../components/ui/ErrorState';
import QADashboard from '../components/audit/QADashboard';
import KpiRow from '../components/dashboard/KpiRow';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../store/useFilterStore';
import { ChartData } from '../types';

const Overview: React.FC = () => {
  const { 
    kpiData, 
    loading, 
    error,
    categoryData, 
    timeSeriesData 
  } = useTransactionData();
  
  const navigate = useNavigate();
  const { setCategories } = useFilterStore();
  const [showQADashboard, setShowQADashboard] = useState(false);

  const handleCategoryClick = (category: ChartData) => {
    setCategories([category.name]);
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Executive Dashboard</h1>
          <p className="text-blue-100">Loading real-time insights...</p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  // Data is already properly formatted from useTransactionData

  return (
    <div className="space-y-6">
      {/* TBWA Header */}
      <div className="tbwa-gradient rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Executive Dashboard</h1>
            <p className="text-tbwa-navy-100 text-lg">
              Real-time insights from {kpiData.totalTransactions.toLocaleString()} FMCG transactions
            </p>
            <div className="mt-3 flex items-center space-x-4">
              <div className="tbwa-badge-yellow">
                ⭐ TBWA Portfolio
              </div>
              <div className="text-sm text-tbwa-navy-100">
                Philippine Retail Intelligence
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-20 h-20 bg-tbwa-yellow rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-tbwa-navy" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Row with 6 Cards */}
      <KpiRow data={kpiData} />

      {/* Charts and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue Trend"
            subtitle="Daily revenue performance across Philippine markets"
            variant="featured"
          >
            <LineChart
              data={timeSeriesData}
              onPointClick={() => navigate('/trends')}
            />
          </ChartCard>
        </div>

        {/* AI Insights */}
        <div>
          <AIInsightsPanel />
        </div>
      </div>

      {/* Data Quality & Audit Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowQADashboard(!showQADashboard)}
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Data Quality & KPI Validation</h3>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
              Live Audit
            </span>
          </div>
          {showQADashboard ? 
            <ChevronUp className="h-5 w-5 text-gray-400" /> : 
            <ChevronDown className="h-5 w-5 text-gray-400" />
          }
        </div>
        
        {showQADashboard && (
          <div className="border-t border-gray-200 p-6">
            <QADashboard />
          </div>
        )}
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Category Performance"
          subtitle="Revenue by product category"
        >
          <DonutChart
            data={categoryData}
            onSegmentClick={handleCategoryClick}
          />
        </ChartCard>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Categories</h3>
          <div className="space-y-3">
            {categoryData.slice(0, 5).map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP',
                      notation: 'compact',
                    }).format(category.value)}
                  </div>
                  <div className={`text-xs ${category.change && category.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {category.change && category.change >= 0 ? '+' : ''}{category.change?.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;