import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';

interface RegionFilterProps {
  value: string[];
  onChange: (regions: string[]) => void;
  className?: string;
}

// Philippine regions grouped by island
const regionGroups = {
  'Luzon': [
    'National Capital Region (NCR)',
    'CALABARZON',
    'Central Luzon',
    'Ilocos Region',
    'Bicol Region',
    'Cagayan Valley',
    'Cordillera Administrative Region (CAR)',
    'Mimaropa'
  ],
  'Visayas': [
    'Western Visayas',
    'Central Visayas',
    'Eastern Visayas'
  ],
  'Mindanao': [
    'Northern Mindanao',
    'Davao Region',
    'Soccsksargen',
    'Zamboanga Peninsula',
    'Caraga',
    'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)'
  ]
};

export const RegionFilter: React.FC<RegionFilterProps> = ({
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
      return "Select Region(s)...";
    }
    
    if (value.length === 1) {
      return value[0];
    }
    
    if (value.length <= 2) {
      return value.join(', ');
    }
    
    return `${value.length} regions selected`;
  };

  const handleRegionToggle = (region: string) => {
    const newValue = value.includes(region)
      ? value.filter(r => r !== region)
      : [...value, region];
    onChange(newValue);
  };

  const handleGroupToggle = (groupName: string) => {
    const groupRegions = regionGroups[groupName as keyof typeof regionGroups];
    const allSelected = groupRegions.every(region => value.includes(region));
    
    if (allSelected) {
      // Deselect all regions in this group
      onChange(value.filter(region => !groupRegions.includes(region)));
    } else {
      // Select all regions in this group
      const newValue = [...value];
      groupRegions.forEach(region => {
        if (!newValue.includes(region)) {
          newValue.push(region);
        }
      });
      onChange(newValue);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} flex items-center justify-between`}
      >
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{formatDisplayValue()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            {Object.entries(regionGroups).map(([groupName, regions]) => {
              const groupSelected = regions.filter(region => value.includes(region)).length;
              const allGroupSelected = groupSelected === regions.length;
              const someGroupSelected = groupSelected > 0 && groupSelected < regions.length;

              return (
                <div key={groupName} className="mb-2">
                  {/* Group Header */}
                  <button
                    onClick={() => handleGroupToggle(groupName)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <span>{groupName}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">({groupSelected}/{regions.length})</span>
                      <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                        allGroupSelected ? 'bg-blue-600 border-blue-600' : 
                        someGroupSelected ? 'bg-blue-200 border-blue-400' : 'border-gray-300'
                      }`}>
                        {allGroupSelected && <Check className="w-3 h-3 text-white" />}
                        {someGroupSelected && !allGroupSelected && <div className="w-2 h-2 bg-blue-600 rounded" />}
                      </div>
                    </div>
                  </button>

                  {/* Group Options */}
                  <div className="mt-1 space-y-1">
                    {regions.map((region) => {
                      const isSelected = value.includes(region);
                      return (
                        <button
                          key={region}
                          onClick={() => handleRegionToggle(region)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'hover:bg-gray-100 border border-transparent'
                          }`}
                        >
                          <span className="text-left truncate">{region}</span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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