import React from 'react';
import { formatCurrency } from '../utils/formatCurrency';

interface KpiCardProps {
  title: string;
  value: number;
  change: number;
  format?: 'currency' | 'number' | 'percentage';
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  format = 'number',
  icon
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '→';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className="mt-2">
        <p className="text-3xl font-semibold text-gray-900">
          {formatValue(value)}
        </p>
        
        <div className="mt-2 flex items-center">
          <span className={`text-sm font-medium ${getChangeColor(change)}`}>
            {getChangeIcon(change)} {Math.abs(change).toFixed(1)}%
          </span>
          <span className="ml-2 text-sm text-gray-500">vs previous period</span>
        </div>
      </div>
    </div>
  );
}; 