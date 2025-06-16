import React from 'react';
import { KPIData } from '../../types';
import KpiCard from '../ui/KpiCard';
import { DollarSign, ShoppingCart, TrendingUp, Star, Package, Users } from 'lucide-react';

interface KpiRowProps {
  data: KPIData;
}

const KpiRow: React.FC<KpiRowProps> = ({ data }) => {
  const formatCurrency = (value: number) => `₱${value.toLocaleString()}`;
  const formatNumber = (value: number) => value.toLocaleString();
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  /* Enhanced v3.0 KPI layout with improved visual hierarchy */
  return (
    <div className="space-y-4">
      {/* Primary KPIs - Featured Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(data.totalRevenue)}</p>
              {data.revenueChange !== undefined && (
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {data.revenueChange >= 0 ? '+' : ''}{(data.revenueChange * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Transactions</p>
              <p className="text-3xl font-bold">{formatNumber(data.totalTransactions)}</p>
              {data.transactionChange !== undefined && (
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {data.transactionChange >= 0 ? '+' : ''}{(data.transactionChange * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Customers</p>
              <p className="text-3xl font-bold">{formatNumber(data.uniqueCustomers)}</p>
              <div className="flex items-center mt-2">
                <Users className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">+12.1%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Avg Basket</p>
              <p className="text-3xl font-bold">{formatCurrency(data.avgOrderValue)}</p>
              {data.aovChange !== undefined && (
                <div className="flex items-center mt-2">
                  <Package className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {data.aovChange >= 0 ? '+' : ''}{(data.aovChange * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPIs - Compact Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Units Sold</p>
              <p className="text-xl font-semibold text-gray-900">{formatNumber(data.unitsSold)}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Gross Margin</p>
              <p className="text-xl font-semibold text-gray-900">{formatPercentage(data.grossMarginPct)}</p>
            </div>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiRow;