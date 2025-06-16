import React, { useState, useRef, useEffect } from 'react';
import { Bookmark, ChevronDown } from 'lucide-react';
import { useFilterStore } from '@/hooks/useFilterStore';

interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: {
    date_range?: { preset: string } | { from: string; to: string };
    regions?: string[];
    categories?: string[];
    brands?: string[];
    stores?: string[];
  };
}

const presetOptions: FilterPreset[] = [
  {
    id: 'executive_view',
    name: 'Executive Dashboard',
    description: 'High-level KPIs for leadership',
    filters: {
      date_range: { preset: '30d' },
      regions: ['National Capital Region (NCR)'],
      categories: ['Beverages', 'Snacks', 'Dairy']
    }
  },
  {
    id: 'brand_manager_view',
    name: 'Brand Performance Focus',
    description: 'Brand-specific insights and competition',
    filters: {
      date_range: { preset: '7d' },
      brands: ['Oishi', 'Del Monte', 'Champion']
    }
  },
  {
    id: 'metro_manila_view',
    name: 'Metro Manila Markets',
    description: 'NCR and surrounding areas',
    filters: {
      regions: ['National Capital Region (NCR)', 'CALABARZON', 'Central Luzon'],
      date_range: { preset: '30d' }
    }
  },
  {
    id: 'visayas_focus',
    name: 'Visayas Region Analysis',
    description: 'Central and Western Visayas markets',
    filters: {
      regions: ['Central Visayas', 'Western Visayas'],
      date_range: { preset: '30d' }
    }
  },
  {
    id: 'fmcg_essentials',
    name: 'FMCG Essentials',
    description: 'Core FMCG categories only',
    filters: {
      categories: ['Beverages', 'Snacks', 'Personal Care', 'Household'],
      date_range: { preset: '30d' }
    }
  }
];

export const FilterPresets: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { applyFilterPreset } = useFilterStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetSelection = (preset: FilterPreset) => {
    applyFilterPreset(preset.filters);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white hover:bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg text-sm text-left w-full flex items-center justify-between transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Bookmark className="w-4 h-4" />
          <span>Presets</span>
        </div>
        <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100 mb-2">
              Quick Filter Presets
            </div>
            
            {presetOptions.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelection(preset)}
                className="w-full text-left px-3 py-3 rounded-md hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="font-medium text-sm text-gray-900">{preset.name}</div>
                <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
                
                {/* Preview of applied filters */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {preset.filters.date_range && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                      {'preset' in preset.filters.date_range 
                        ? preset.filters.date_range.preset 
                        : 'Custom date'}
                    </span>
                  )}
                  {preset.filters.regions?.map((region, index) => (
                    <span key={index} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                      {region.length > 15 ? `${region.substring(0, 15)}...` : region}
                    </span>
                  ))}
                  {preset.filters.categories?.map((category, index) => (
                    <span key={index} className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">
                      {category}
                    </span>
                  ))}
                  {preset.filters.brands?.map((brand, index) => (
                    <span key={index} className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded">
                      {brand}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};