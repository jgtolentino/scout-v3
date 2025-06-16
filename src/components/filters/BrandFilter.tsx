import React, { useState, useRef, useEffect } from 'react';
import { Tag, ChevronDown, Search, Star } from 'lucide-react';

interface BrandFilterProps {
  value: string[];
  onChange: (brands: string[]) => void;
  className?: string;
}

// Mock brand data - in real implementation, this would come from the API
const brandOptions = [
  { name: 'Oishi', isTbwa: true, category: 'Snacks' },
  { name: 'Del Monte', isTbwa: true, category: 'Canned Goods' },
  { name: 'Champion', isTbwa: true, category: 'Household' },
  { name: 'Nestle', isTbwa: false, category: 'Beverages' },
  { name: 'Unilever', isTbwa: false, category: 'Personal Care' },
  { name: 'P&G', isTbwa: false, category: 'Household' },
  { name: 'San Miguel', isTbwa: false, category: 'Beverages' },
  { name: 'Universal Robina', isTbwa: false, category: 'Snacks' },
  { name: 'Alaska', isTbwa: false, category: 'Dairy' },
  { name: 'Magnolia', isTbwa: false, category: 'Dairy' },
  { name: 'Century Pacific', isTbwa: false, category: 'Canned Goods' },
  { name: 'Rebisco', isTbwa: false, category: 'Snacks' },
  { name: 'Jack n Jill', isTbwa: false, category: 'Snacks' },
  { name: 'Kopiko', isTbwa: false, category: 'Beverages' },
  { name: 'Lucky Me', isTbwa: false, category: 'Noodles' }
];

export const BrandFilter: React.FC<BrandFilterProps> = ({
  value,
  onChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredBrands = brandOptions.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort TBWA brands first, then alphabetically
  const sortedBrands = [...filteredBrands].sort((a, b) => {
    if (a.isTbwa && !b.isTbwa) return -1;
    if (!a.isTbwa && b.isTbwa) return 1;
    return a.name.localeCompare(b.name);
  });

  const formatDisplayValue = () => {
    if (value.length === 0) {
      return "Select Brand(s)...";
    }
    
    if (value.length === 1) {
      const brand = brandOptions.find(b => b.name === value[0]);
      return brand?.isTbwa ? `⭐ ${brand.name}` : value[0];
    }
    
    if (value.length <= 2) {
      return value.map(brandName => {
        const brand = brandOptions.find(b => b.name === brandName);
        return brand?.isTbwa ? `⭐ ${brand.name}` : brandName;
      }).join(', ');
    }
    
    return `${value.length} brands selected`;
  };

  const handleBrandToggle = (brandName: string) => {
    const newValue = value.includes(brandName)
      ? value.filter(b => b !== brandName)
      : [...value, brandName];
    onChange(newValue);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} flex items-center justify-between`}
      >
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4" />
          <span className="truncate">{formatDisplayValue()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Brand List */}
          <div className="max-h-64 overflow-y-auto">
            {sortedBrands.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No brands found matching "{searchTerm}"
              </div>
            ) : (
              <div className="p-2">
                {sortedBrands.map((brand) => {
                  const isSelected = value.includes(brand.name);
                  return (
                    <button
                      key={brand.name}
                      onClick={() => handleBrandToggle(brand.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : brand.isTbwa
                          ? 'bg-orange-50 border-l-4 border-orange-400 hover:bg-orange-100'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {brand.isTbwa && <Star className="w-4 h-4 text-orange-500" />}
                        <div className="text-left">
                          <div className="font-medium">{brand.name}</div>
                          <div className="text-xs text-gray-500">{brand.category}</div>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-2 flex justify-between">
            <button
              onClick={() => onChange([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const tbwaBrands = brandOptions.filter(b => b.isTbwa).map(b => b.name);
                  onChange(tbwaBrands);
                }}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                TBWA only
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};