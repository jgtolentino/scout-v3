import React, { useState, useRef, useEffect } from 'react';
import { Store, ChevronDown, MapPin } from 'lucide-react';

interface StoreFilterProps {
  value: string[];
  onChange: (stores: string[]) => void;
  selectedRegions: string[];
  className?: string;
}

// Mock store data - in real implementation, this would come from the API
const mockStores = [
  { id: '1', name: 'SM North EDSA', region: 'National Capital Region (NCR)', city: 'Quezon City' },
  { id: '2', name: 'Robinsons Magnolia', region: 'National Capital Region (NCR)', city: 'Quezon City' },
  { id: '3', name: 'SM Mall of Asia', region: 'National Capital Region (NCR)', city: 'Pasay' },
  { id: '4', name: 'Greenbelt 5', region: 'National Capital Region (NCR)', city: 'Makati' },
  { id: '5', name: 'SM City Cebu', region: 'Central Visayas', city: 'Cebu City' },
  { id: '6', name: 'Ayala Center Cebu', region: 'Central Visayas', city: 'Cebu City' },
  { id: '7', name: 'SM Lanang Premier', region: 'Davao Region', city: 'Davao City' },
  { id: '8', name: 'Abreeza Mall', region: 'Davao Region', city: 'Davao City' },
  { id: '9', name: 'SM City Iloilo', region: 'Western Visayas', city: 'Iloilo City' },
  { id: '10', name: 'Robinsons Place Iloilo', region: 'Western Visayas', city: 'Iloilo City' },
  { id: '11', name: 'SM City Baguio', region: 'Cordillera Administrative Region (CAR)', city: 'Baguio City' },
  { id: '12', name: 'Session Road', region: 'Cordillera Administrative Region (CAR)', city: 'Baguio City' },
  { id: '13', name: 'SM City Pampanga', region: 'Central Luzon', city: 'San Fernando' },
  { id: '14', name: 'Robinsons Starmills', region: 'Central Luzon', city: 'San Fernando' },
  { id: '15', name: 'SM City Lipa', region: 'CALABARZON', city: 'Lipa City' },
  { id: '16', name: 'Robinsons Place Lipa', region: 'CALABARZON', city: 'Lipa City' }
];

export const StoreFilter: React.FC<StoreFilterProps> = ({
  value,
  onChange,
  selectedRegions,
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

  // Filter stores based on selected regions
  const availableStores = selectedRegions.length > 0 
    ? mockStores.filter(store => selectedRegions.includes(store.region))
    : mockStores;

  const isDisabled = selectedRegions.length === 0;

  const formatDisplayValue = () => {
    if (isDisabled) {
      return "Select region first";
    }
    
    if (value.length === 0) {
      return "Select Store(s)...";
    }
    
    if (value.length === 1) {
      const store = availableStores.find(s => s.id === value[0]);
      return store ? store.name : value[0];
    }
    
    return `${value.length} stores selected`;
  };

  const handleStoreToggle = (storeId: string) => {
    if (isDisabled) return;
    
    const newValue = value.includes(storeId)
      ? value.filter(s => s !== storeId)
      : [...value, storeId];
    onChange(newValue);
  };

  // Group stores by region
  const storesByRegion = availableStores.reduce((acc, store) => {
    if (!acc[store.region]) {
      acc[store.region] = [];
    }
    acc[store.region].push(store);
    return acc;
  }, {} as Record<string, typeof mockStores>);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`${className} flex items-center justify-between ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center space-x-2">
          <Store className="w-4 h-4" />
          <span className="truncate">{formatDisplayValue()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            {Object.entries(storesByRegion).map(([region, stores]) => (
              <div key={region} className="mb-3">
                {/* Region Header */}
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-100 rounded-md flex items-center space-x-2">
                  <MapPin className="w-3 h-3" />
                  <span>{region}</span>
                  <span className="ml-auto">({stores.length} stores)</span>
                </div>

                {/* Stores in Region */}
                <div className="mt-1 space-y-1">
                  {stores.map((store) => {
                    const isSelected = value.includes(store.id);
                    return (
                      <button
                        key={store.id}
                        onClick={() => handleStoreToggle(store.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-medium">{store.name}</div>
                          <div className="text-xs text-gray-500">{store.city}</div>
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
              </div>
            ))}

            {availableStores.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No stores available for selected regions
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