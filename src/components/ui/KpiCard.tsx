import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

interface KpiCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'premium' | 'accent';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, icon, onClick, variant = 'default' }) => {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const getVariantStyles = () => {
    switch (variant) {
      case 'premium':
        return {
          card: 'tbwa-kpi-card border-tbwa-navy-200 hover:border-tbwa-navy hover:shadow-lg',
          icon: 'p-3 bg-tbwa-navy text-white rounded-xl',
          title: 'tbwa-metric-label text-tbwa-navy-600',
          value: 'tbwa-metric-value text-tbwa-navy'
        };
      case 'accent':
        return {
          card: 'tbwa-kpi-card border-tbwa-yellow-200 hover:border-tbwa-yellow hover:shadow-lg',
          icon: 'p-3 bg-tbwa-yellow text-tbwa-navy rounded-xl',
          title: 'tbwa-metric-label text-gray-600',
          value: 'tbwa-metric-value text-tbwa-navy'
        };
      default:
        return {
          card: 'tbwa-kpi-card hover:border-tbwa-navy-300',
          icon: 'p-3 bg-tbwa-navy-50 text-tbwa-navy rounded-xl',
          title: 'tbwa-metric-label text-gray-600',
          value: 'tbwa-metric-value'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={clsx(
        styles.card,
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={styles.icon}>
            {icon}
          </div>
          <div>
            <p className={styles.title}>{title}</p>
            <p className={styles.value}>{value}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={clsx(
            "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
            isPositive 
              ? "bg-green-50 text-green-700" 
              : "bg-red-50 text-red-700"
          )}>
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;