import React, { useState } from 'react';
import { RotateCcw, ChevronDown, X } from 'lucide-react';
import { useFilterStore } from '@/hooks/useFilterStore';
import { DateRangeFilter } from './DateRangeFilter';
import { RegionFilter } from './RegionFilter';
import { StoreFilter } from './StoreFilter';
import { BrandFilter } from './BrandFilter';
import { CategoryFilter } from './CategoryFilter';
import { FilterPresets } from './FilterPresets';

interface ActiveFilterTag {
  id: string;
  label: string;
  value: string;
  type: 'date' | 'region' | 'store' | 'brand' | 'category';
}

export const EnhancedGlobalFilterBar: React.FC = () => {
  const { filters, setFilter, clearAllFilters, isLoading } = useFilterStore();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Generate active filter tags for visual feedback
  const generateActiveFilterTags = (): ActiveFilterTag[] => {
    const tags: ActiveFilterTag[] = [];

    // Date range tags
    if (filters.date_range?.from || filters.date_range?.to) {
      const from = filters.date_range.from ? new Date(filters.date_range.from).toLocaleDateString() : '';
      const to = filters.date_range.to ? new Date(filters.date_range.to).toLocaleDateString() : '';
      tags.push({
        id: 'date_range',
        label: from && to ? `${from} - ${to}` : from || to || 'Custom date',
        value: 'date_range',
        type: 'date'
      });
    }

    // Region tags
    filters.regions?.forEach((region, index) => {
      tags.push({
        id: `region_${index}`,
        label: region,
        value: region,
        type: 'region'
      });
    });

    // Store tags
    filters.stores?.forEach((store, index) => {
      tags.push({
        id: `store_${index}`,
        label: store,
        value: store,
        type: 'store'
      });
    });

    // Brand tags
    filters.brands?.forEach((brand, index) => {
      tags.push({
        id: `brand_${index}`,
        label: brand,
        value: brand,
        type: 'brand'
      });
    });

    // Category tags
    filters.categories?.forEach((category, index) => {
      tags.push({
        id: `category_${index}`,
        label: category,
        value: category,
        type: 'category'
      });
    });

    return tags;
  };

  const activeFilterTags = generateActiveFilterTags();

  const removeFilterTag = (tag: ActiveFilterTag) => {
    switch (tag.type) {
      case 'date':
        setFilter('date_range', { from: null, to: null });
        break;
      case 'region':
        setFilter('regions', filters.regions?.filter(r => r !== tag.value) || []);
        break;
      case 'store':
        setFilter('stores', filters.stores?.filter(s => s !== tag.value) || []);
        break;
      case 'brand':
        setFilter('brands', filters.brands?.filter(b => b !== tag.value) || []);
        break;
      case 'category':
        setFilter('categories', filters.categories?.filter(c => c !== tag.value) || []);
        break;
    }
  };

  const FilterContent = () => (
    <>
      {/* Main Filter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
        {/* Date Range Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-600 mb-1">Date Range</label>
          <DateRangeFilter
            value={filters.date_range}
            onChange={(dateRange) => setFilter('date_range', dateRange)}
            className="bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors w-full"
          />
        </div>

        {/* Region Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-600 mb-1">Region</label>
          <RegionFilter
            value={filters.regions || []}
            onChange={(regions) => setFilter('regions', regions)}
            className="bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm text-left w-full"
          />
        </div>

        {/* Store Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-600 mb-1">Store</label>
          <StoreFilter
            value={filters.stores || []}
            onChange={(stores) => setFilter('stores', stores)}
            selectedRegions={filters.regions || []}
            className="bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm text-left w-full disabled:bg-gray-200 disabled:cursor-not-allowed"
          />
        </div>

        {/* Brand Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-600 mb-1">Brand</label>
          <BrandFilter
            value={filters.brands || []}
            onChange={(brands) => setFilter('brands', brands)}
            className="bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm text-left w-full"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-600 mb-1">Category</label>
          <CategoryFilter
            value={filters.categories || []}
            onChange={(categories) => setFilter('categories', categories)}
            className="bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm text-left w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={clearAllFilters}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-300 w-full flex items-center justify-center space-x-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET</span>
          </button>
          
          <FilterPresets />
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilterTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs font-medium text-gray-500 self-center">Active Filters:</span>
          {activeFilterTags.map((tag) => (
            <span
              key={tag.id}
              className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 flex items-center space-x-1"
            >
              <span>{tag.label}</span>
              <button
                onClick={() => removeFilterTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm z-50 sticky top-0">
      <div className="px-6 py-4">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <FilterContent />
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors flex items-center justify-between"
          >
            <span>Filter & Sort</span>
            <div className="flex items-center space-x-2">
              {activeFilterTags.length > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterTags.length}
                </span>
              )}
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Mobile Drawer Overlay */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileDrawerOpen(false)} />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <FilterContent />
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      )}
    </div>
  );
};