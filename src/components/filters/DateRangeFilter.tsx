import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateRange {
  from: string | null;
  to: string | null;
}

interface DateRangeFilterProps {
  value: DateRange | null;
  onChange: (dateRange: DateRange) => void;
  className?: string;
}

const presetOptions = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "YTD", value: "ytd" },
  { label: "Custom", value: "custom" }
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
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
    if (!value || (!value.from && !value.to)) {
      return "Select date range";
    }

    if (value.from && value.to) {
      const fromDate = new Date(value.from);
      const toDate = new Date(value.to);
      return `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`;
    }

    return value.from ? new Date(value.from).toLocaleDateString() : 
           value.to ? new Date(value.to).toLocaleDateString() : "Select date range";
  };

  const handlePresetSelection = (preset: string) => {
    setSelectedPreset(preset);
    
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (preset) {
      case 'today':
        from = new Date(now);
        to = new Date(now);
        break;
      case '7d':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'ytd':
        from = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        return; // Don't auto-apply for custom
      default:
        return;
    }

    if (preset !== 'custom') {
      onChange({
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0]
      });
      setIsOpen(false);
    }
  };

  const handleCustomDateApply = () => {
    if (customFrom || customTo) {
      onChange({
        from: customFrom || null,
        to: customTo || null
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} flex items-center justify-between`}
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span className="truncate">{formatDisplayValue()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {presetOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePresetSelection(option.value)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    selectedPreset === option.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {selectedPreset === 'custom' && (
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleCustomDateApply}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Apply Custom Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};