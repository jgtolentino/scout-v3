import React, { useState, useRef, useEffect } from 'react';
import { Package, ChevronDown } from 'lucide-react';

interface CategoryFilterProps {
  value: string[];
  onChange: (categories: string[]) => void;
  className?: string;
}

const categoryOptions = [
  { name: 'Beverages', icon: '🧃', count: 25 },
  { name: 'Snacks', icon: '🍿', count: 32 },
  { name: 'Dairy', icon: '🥛', count: 18 },
  { name: 'Personal Care', icon: '🧴', count: 28 },
  { name: 'Household', icon: '🧼', count: 22 },
  { name: 'Canned Goods', icon: '🥫', count: 15 },
  { name: 'Condiments', icon: '🍅', count: 12 },
  { name: 'Tobacco', icon: '🚬', count: 8 }
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  value,
  onChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const formatDisplayValue = () => {
    if (value.length === 0) {
      return "All categories";
    }
    
    if (value.length === 1) {
      const category = categoryOptions.find(c => c.name === value[0]);
      return category ? `${category.icon} ${category.name}` : value[0];
    }
    
    return `${value.length} categories`;
  };

  const handleCategoryToggle = (categoryName: string) => {
    const newValue = value.includes(categoryName)
      ? value.filter(c => c !== categoryName)
      : [...value, categoryName];
    onChange(newValue);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} flex items-center justify-between`}
      >
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4" />
          <span className="truncate">{formatDisplayValue()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((category) => {
                const isSelected = value.includes(category.name);
                return (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryToggle(category.name)}
                    className={`flex items-center space-x-2 p-2 rounded-lg text-sm border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-100 hover:bg-gray-200 border-gray-200'
                    }`}
                  >
                    <span className="text-base">{category.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-gray-500">{category.count} products</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-2 flex justify-between">
            <button
              onClick={() => onChange([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};