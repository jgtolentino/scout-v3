import React from 'react';
import { MoreHorizontal, Maximize2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  onExpand?: () => void;
  variant?: 'default' | 'featured' | 'accent';
  isLoading?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = "",
  onExpand,
  variant = 'default',
  isLoading = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return {
          card: 'tbwa-chart-card border-tbwa-navy-200 bg-gradient-to-br from-white to-tbwa-navy-50',
          title: 'text-tbwa-navy font-semibold',
          subtitle: 'text-tbwa-navy-600'
        };
      case 'accent':
        return {
          card: 'tbwa-chart-card border-tbwa-yellow-200 bg-gradient-to-br from-white to-tbwa-yellow-50',
          title: 'text-tbwa-navy font-semibold',
          subtitle: 'text-gray-600'
        };
      default:
        return {
          card: 'tbwa-chart-card',
          title: 'text-tbwa-navy font-semibold',
          subtitle: 'text-gray-600'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={clsx(styles.card, className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className={clsx("text-lg", styles.title)}>{title}</h3>
            {variant === 'featured' && (
              <span className="tbwa-badge">Premium</span>
            )}
          </div>
          {subtitle && (
            <p className={clsx("text-sm mt-1", styles.subtitle)}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {onExpand && (
            <button
              onClick={onExpand}
              className="p-2 text-gray-400 hover:text-tbwa-navy rounded-lg hover:bg-tbwa-navy-50 transition-colors"
              title="Expand chart"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
          <button className="p-2 text-gray-400 hover:text-tbwa-navy rounded-lg hover:bg-tbwa-navy-50 transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-tbwa-navy border-t-transparent"></div>
          </div>
        ) : (
          <div className="chart-content">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartCard;