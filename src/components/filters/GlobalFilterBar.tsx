import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Package, Tag, Store, Filter, X, ChevronDown } from 'lucide-react';
import { useFilterStore } from '../../store/useFilterStore';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { clsx } from 'clsx';

// TBWA Brand mapping
const TBWA_BRANDS = ['Oishi', 'Del Monte', 'Champion'];

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  'Beverages': '🧃',
  'Snacks': '🍿', 
  'Dairy': '🥛',
  'Personal Care': '🧴',
  'Household': '🧼',
  'Canned Goods': '🥫',
  'Condiments': '🍅'
};

const GlobalFilterBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [uniqueBarangays, setUniqueBarangays] = useState<string[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [uniqueBrands, setUniqueBrands] = useState<string[]>([]);
  const [uniqueStores, setUniqueStores] = useState<string[]>([]);
  const {
    dateRange,
    barangays,
    categories,
    brands,
    stores,
    setDateRange,
    setBarangays,
    setCategories,
    setBrands,
    setStores,
    getActiveFilterCount,
    resetFilters,
  } = useFilterStore();

  const activeFilters = getActiveFilterCount();

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch unique barangays
        const { data: barangayData } = await supabase
          .from('stores')
          .select('barangay');
        const uniqueBarangayList = [...new Set(barangayData?.map(b => b.barangay) || [])];
        setUniqueBarangays(uniqueBarangayList);

        // Fetch unique categories
        const { data: categoryData } = await supabase
          .from('products')
          .select('category');
        const uniqueCategoryList = [...new Set(categoryData?.map(c => c.category) || [])];
        setUniqueCategories(uniqueCategoryList);

        // Fetch unique brands - prioritize TBWA brands
        const { data: brandData } = await supabase
          .from('brands')
          .select('name');
        const allBrands = brandData?.map(b => b.name) || [];
        // Sort with TBWA brands first
        const sortedBrands = [...allBrands].sort((a, b) => {
          const aTBWA = TBWA_BRANDS.includes(a);
          const bTBWA = TBWA_BRANDS.includes(b);
          if (aTBWA && !bTBWA) return -1;
          if (!aTBWA && bTBWA) return 1;
          return a.localeCompare(b);
        });
        setUniqueBrands(sortedBrands);

        // Fetch unique stores
        const { data: storeData } = await supabase
          .from('stores')
          .select('name');
        setUniqueStores(storeData?.map(s => s.name) || []);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleMultiSelect = (
    value: string,
    currentValues: string[],
    setter: (values: string[]) => void
  ) => {
    if (currentValues.includes(value)) {
      setter(currentValues.filter(v => v !== value));
    } else {
      setter([...currentValues, value]);
    }
  };

  return (
    <div className="tbwa-header sticky top-0 z-50 px-6 py-3 lg:ml-64 bg-white border-b border-gray-200 shadow-sm">
      {/* Horizontal Filter Display */}
      <div className="flex items-center justify-between">
        {/* Left side - Active filter pills */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          {/* Date Range Pill */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full border text-xs">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600 whitespace-nowrap">
              {format(new Date(dateRange.start), 'MMM d')} - {format(new Date(dateRange.end), 'MMM d')}
            </span>
          </div>
          
          {/* Category Pills */}
          {categories.slice(0, 2).map(category => (
            <div key={category} className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200 text-xs">
              <span>{CATEGORY_ICONS[category] || '📦'}</span>
              <span className="text-blue-700 whitespace-nowrap">{category}</span>
              <button onClick={() => handleMultiSelect(category, categories, setCategories)}>
                <X className="h-3 w-3 text-blue-500 hover:text-blue-700" />
              </button>
            </div>
          ))}
          {categories.length > 2 && (
            <div className="px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200 text-xs text-blue-700">
              +{categories.length - 2} more
            </div>
          )}
          
          {/* Brand Pills */}
          {brands.slice(0, 2).map(brand => (
            <div key={brand} className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 rounded-full border border-green-200 text-xs">
              <Tag className="h-3 w-3 text-green-600" />
              <span className="text-green-700 whitespace-nowrap">{brand}</span>
              <button onClick={() => handleMultiSelect(brand, brands, setBrands)}>
                <X className="h-3 w-3 text-green-500 hover:text-green-700" />
              </button>
            </div>
          ))}
          {brands.length > 2 && (
            <div className="px-3 py-1.5 bg-green-50 rounded-full border border-green-200 text-xs text-green-700">
              +{brands.length - 2} more
            </div>
          )}
          
          {/* Region Pills */}
          {barangays.slice(0, 2).map(barangay => (
            <div key={barangay} className="flex items-center space-x-1 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-200 text-xs">
              <MapPin className="h-3 w-3 text-purple-600" />
              <span className="text-purple-700 whitespace-nowrap">{barangay}</span>
              <button onClick={() => handleMultiSelect(barangay, barangays, setBarangays)}>
                <X className="h-3 w-3 text-purple-500 hover:text-purple-700" />
              </button>
            </div>
          ))}
          {barangays.length > 2 && (
            <div className="px-3 py-1.5 bg-purple-50 rounded-full border border-purple-200 text-xs text-purple-700">
              +{barangays.length - 2} more
            </div>
          )}
        </div>
        
        {/* Right side - Filter controls */}
        <div className="flex items-center space-x-3">
          {activeFilters > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Clear all</span>
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={clsx(
              "flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium",
              isExpanded
                ? "border-tbwa-navy bg-tbwa-navy text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            )}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <ChevronDown className={clsx(
              "h-4 w-4 transition-transform duration-200",
              isExpanded ? "rotate-180" : ""
            )} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold text-tbwa-navy mb-3 uppercase tracking-wider">
              <Calendar className="inline h-4 w-4 mr-2" />
              Date Range
            </label>
            <div className="space-y-3">
              <input
                type="date"
                value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateRange(e.target.value ? new Date(e.target.value) : null, dateRange.to)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-tbwa-navy focus:border-tbwa-navy transition-colors"
                placeholder="From"
              />
              <input
                type="date"
                value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateRange(dateRange.from, e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-tbwa-navy focus:border-tbwa-navy transition-colors"
                placeholder="To"
              />
            </div>
          </div>

          {/* Barangays */}
          <div>
            <label className="block text-xs font-semibold text-tbwa-navy mb-3 uppercase tracking-wider">
              <MapPin className="inline h-4 w-4 mr-2" />
              Region
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-3 bg-gray-50">
              {uniqueBarangays.map(barangay => (
                <label key={barangay} className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-white rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={barangays.includes(barangay)}
                    onChange={() => handleMultiSelect(barangay, barangays, setBarangays)}
                    className="h-4 w-4 text-tbwa-navy rounded border-gray-300 focus:ring-tbwa-navy"
                  />
                  <span className="text-sm text-gray-700 font-medium">{barangay}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories with Icons */}
          <div>
            <label className="block text-xs font-semibold text-tbwa-navy mb-3 uppercase tracking-wider">
              <Package className="inline h-4 w-4 mr-2" />
              Category
            </label>
            <div className="space-y-2">
              {uniqueCategories.map(category => (
                <button
                  key={category}
                  onClick={() => handleMultiSelect(category, categories, setCategories)}
                  className={clsx(
                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                    categories.includes(category)
                      ? "bg-tbwa-navy text-white border-tbwa-navy shadow-md"
                      : "bg-white border-gray-200 text-gray-700 hover:border-tbwa-navy-300 hover:bg-tbwa-navy-50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{CATEGORY_ICONS[category] || '📦'}</span>
                    <span className="text-sm font-medium">{category}</span>
                  </div>
                  {categories.includes(category) && (
                    <div className="w-2 h-2 bg-tbwa-yellow rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Brands with TBWA Highlighting */}
          <div>
            <label className="block text-xs font-semibold text-tbwa-navy mb-3 uppercase tracking-wider">
              <Tag className="inline h-4 w-4 mr-2" />
              Brand
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {uniqueBrands.map(brand => {
                const isTBWA = TBWA_BRANDS.includes(brand);
                return (
                  <label 
                    key={brand} 
                    className={clsx(
                      "flex items-center space-x-3 cursor-pointer p-2 rounded-lg transition-colors",
                      isTBWA ? "bg-tbwa-yellow-50 border border-tbwa-yellow-200" : "hover:bg-gray-50",
                      brands.includes(brand) && "bg-tbwa-navy-50 border-tbwa-navy-200"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={brands.includes(brand)}
                      onChange={() => handleMultiSelect(brand, brands, setBrands)}
                      className="h-4 w-4 text-tbwa-navy rounded border-gray-300 focus:ring-tbwa-navy"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{isTBWA ? '⭐' : '🏷️'}</span>
                      <span className={clsx(
                        "text-sm font-medium",
                        isTBWA ? "text-tbwa-navy font-semibold" : "text-gray-700"
                      )}>
                        {brand}
                      </span>
                      {isTBWA && <span className="tbwa-badge-yellow text-xs">TBWA</span>}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Stores */}
          <div>
            <label className="block text-xs font-semibold text-tbwa-navy mb-3 uppercase tracking-wider">
              <Store className="inline h-4 w-4 mr-2" />
              Store
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-3 bg-gray-50">
              {uniqueStores.map(store => (
                <label key={store} className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-white rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={stores.includes(store)}
                    onChange={() => handleMultiSelect(store, stores, setStores)}
                    className="h-4 w-4 text-tbwa-navy rounded border-gray-300 focus:ring-tbwa-navy"
                  />
                  <span className="text-sm text-gray-700 font-medium">{store}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalFilterBar;