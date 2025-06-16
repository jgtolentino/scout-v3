import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Package, 
  Users, 
  Bot,
  ChevronRight,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useFilterStore } from '../../store/useFilterStore';
import { clsx } from 'clsx';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { getActiveFilterCount, resetFilters } = useFilterStore();
  const activeFilters = getActiveFilterCount();

  const navigation = [
    { name: 'Overview', href: '/', icon: Home, description: 'Executive dashboard' },
    { name: 'Trends', href: '/trends', icon: TrendingUp, description: 'Regional & temporal analysis' },
    { name: 'Product Mix', href: '/products', icon: Package, description: 'Category & basket analysis' },
    { name: 'Consumers', href: '/consumers', icon: Users, description: 'Demographics & behavior' },
    { name: 'RetailBot', href: '/retailbot', icon: Bot, description: 'AI insights & assistance' },
  ];

  return (
    <nav 
      className="tbwa-sidebar hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0"
      aria-label="Main navigation"
    >
      {/* TBWA Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-tbwa-navy to-tbwa-navy-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-tbwa-yellow rounded-xl flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-tbwa-navy" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">Scout</div>
            <div className="text-xs text-tbwa-yellow font-medium uppercase tracking-wider">Analytics</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-tbwa-navy-100">
          Philippine FMCG Intelligence
        </div>
      </div>

      {/* Filter Status */}
      {activeFilters > 0 && (
        <div className="px-6 py-4 bg-tbwa-navy-50 border-b border-tbwa-navy-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-tbwa-yellow rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-tbwa-navy">
                {activeFilters} filter{activeFilters > 1 ? 's' : ''} active
              </span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-tbwa-navy-600 hover:text-tbwa-navy font-medium hover:underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 flex flex-col min-h-0 pt-6 pb-4 overflow-y-auto">
        <div className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  "tbwa-nav-item relative",
                  isActive ? "tbwa-nav-item-active" : ""
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="flex-shrink-0 h-5 w-5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs opacity-75 mt-0.5">{item.description}</div>
                  </div>
                  <ChevronRight className={clsx(
                    "h-4 w-4 transition-transform",
                    isActive ? "rotate-90" : ""
                  )} />
                </div>
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-tbwa-yellow rounded-l-full"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-4 pt-4 space-y-2 border-t border-gray-200">
          <button
            onClick={() => window.location.reload()}
            className="w-full tbwa-nav-item justify-center"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Refresh Data</span>
          </button>
          
          {/* TBWA Branding */}
          <div className="pt-4 pb-2">
            <div className="text-center">
              <div className="text-xs text-gray-500 font-medium">Powered by</div>
              <div className="tbwa-text-gradient text-sm font-bold mt-1">TBWA Philippines</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;