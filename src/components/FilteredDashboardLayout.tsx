import React, { useEffect } from 'react';
import { EnhancedGlobalFilterBar } from './filters/EnhancedGlobalFilterBar';
import { useFilterStore } from '@/hooks/useFilterStore';

interface FilteredDashboardLayoutProps {
  children: React.ReactNode;
  onFiltersChange?: (filters: any) => void;
}

export const FilteredDashboardLayout: React.FC<FilteredDashboardLayoutProps> = ({
  children,
  onFiltersChange
}) => {
  const { 
    date_range, 
    regions, 
    stores, 
    brands, 
    categories, 
    barangays,
    hasActiveFilters,
    getActiveFilterCount
  } = useFilterStore();

  // Notify parent component when filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        date_range,
        regions,
        stores,
        brands,
        categories,
        barangays,
        hasActiveFilters: hasActiveFilters(),
        activeFilterCount: getActiveFilterCount()
      });
    }
  }, [date_range, regions, stores, brands, categories, barangays, onFiltersChange, hasActiveFilters, getActiveFilterCount]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Filter Bar */}
      <EnhancedGlobalFilterBar />
      
      {/* Filter Status Indicator */}
      {hasActiveFilters() && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-sm text-blue-700 font-medium">
                {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied
              </span>
            </div>
            <div className="text-xs text-blue-600">
              Charts and data are filtered
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
    </div>
  );
};

// Example usage in a dashboard page
export const ExampleDashboardPage: React.FC = () => {
  const handleFiltersChange = (filters: any) => {
    console.log('Filters changed:', filters);
    // Here you would typically:
    // 1. Update chart queries
    // 2. Refresh KPI calculations
    // 3. Update table data
    // 4. Show loading states
  };

  return (
    <FilteredDashboardLayout onFiltersChange={handleFiltersChange}>
      <div className="p-6">
        {/* Your existing dashboard components */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* KPI Cards with filter context */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">₱1,213,902.44</p>
            <p className="text-xs text-gray-500 mt-1">
              Filtered view • Last updated 2 min ago
            </p>
          </div>
          
          {/* More KPI cards... */}
        </div>

        {/* Charts with filter indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <FilterIndicator />
            </div>
            {/* Chart component */}
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-gray-500">Chart will update based on filters</span>
            </div>
          </div>
          
          {/* More charts... */}
        </div>
      </div>
    </FilteredDashboardLayout>
  );
};

// Helper component to show applied filters on individual charts
const FilterIndicator: React.FC = () => {
  const { hasActiveFilters, getActiveFilterCount } = useFilterStore();

  if (!hasActiveFilters()) return null;

  return (
    <div className="flex items-center space-x-1 text-xs text-gray-500">
      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
      <span>{getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''}</span>
    </div>
  );
};