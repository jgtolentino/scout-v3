import React from 'react';
import { formatCurrency, formatNumber, formatPercent } from '../lib/utils';

interface KpiCardProps {
  title: string;
  value: number | string;
  type?: 'currency' | 'number' | 'percent' | 'text';
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  type = 'number',
  change,
  changeType,
  icon,
  trend,
  subtitle,
  className = ''
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (type) {
      case 'currency':
        return formatCurrency(val);
      case 'percent':
        return formatPercent(val);
      case 'number':
        return formatNumber(val);
      default:
        return val.toString();
    }
  };

  const getTrendColor = () => {
    switch (trend || changeType) {
      case 'up':
      case 'increase':
        return 'text-green-600';
      case 'down':
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend || changeType) {
      case 'up':
      case 'increase':
        return '↗';
      case 'down':
      case 'decrease':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <div className={`tbwa-kpi-card group hover:scale-[1.02] transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {icon && (
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                {icon}
              </div>
            )}
            <p className="tbwa-metric-label">{title}</p>
          </div>
          
          <div className="space-y-1">
            <p className="tbwa-metric-value">{formatValue(value)}</p>
            
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            
            {change !== undefined && (
              <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
                <span className="text-lg">{getTrendIcon()}</span>
                <span className="font-medium">
                  {type === 'percent' ? `${change}%` : formatNumber(Math.abs(change))}
                </span>
                <span className="text-gray-500">vs last period</span>
              </div>
            )}
          </div>
        </div>

        {/* TBWA Brand Accent */}
        <div className="tbwa-brand-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-1 h-12 bg-accent rounded-full"></div>
        </div>
      </div>
    </div>
  );
};