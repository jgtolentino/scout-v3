import React from 'react';
import { useStore } from '../utils/store';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
}

const regions = [
  { value: 'ncr', label: 'NCR' },
  { value: 'luzon', label: 'Luzon' },
  { value: 'visayas', label: 'Visayas' },
  { value: 'mindanao', label: 'Mindanao' }
];

const dateRanges = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'ytd', label: 'Year to Date' }
];

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);
  const { filters, setFilters, resetFilters } = useStore();

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = { ...filters, region: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = { ...filters, dateRange: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, brand: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters, [key]: '' };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeFilters = Object.entries(filters).filter(([_, value]) => value !== '');

  return (
    <div className="sticky top-0 z-10 bg-white shadow-sm">
      {/* Desktop Filter Bar */}
      <div className="hidden md:block p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date Range</label>
            <select
              value={filters.dateRange}
              onChange={handleDateRangeChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Date Range</option>
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📍 Region</label>
            <select
              value={filters.region}
              onChange={handleRegionChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Region</option>
              {regions.map(region => (
                <option key={region.value} value={region.value}>{region.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🏷 Brand</label>
            <input
              type="text"
              value={filters.brand}
              onChange={handleBrandChange}
              placeholder="Enter brand name"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              🎯 Reset Filters
            </button>
          </div>
        </div>

        {/* Applied Filters */}
        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">🔵 Applied Filters:</span>
            {activeFilters.map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {value}
                <button
                  onClick={() => removeFilter(key)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden p-4">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          <FunnelIcon className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      <Transition.Root show={isMobileDrawerOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsMobileDrawerOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col bg-white shadow-xl">
                      <div className="px-4 py-6 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-lg font-medium text-gray-900">
                            🧭 FILTERS
                          </Dialog.Title>
                          <button
                            type="button"
                            className="rounded-md text-gray-400 hover:text-gray-500"
                            onClick={() => setIsMobileDrawerOpen(false)}
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

                      <div className="relative flex-1 px-4 sm:px-6">
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date Range</label>
                            <select
                              value={filters.dateRange}
                              onChange={handleDateRangeChange}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                              <option value="">Select Date Range</option>
                              {dateRanges.map(range => (
                                <option key={range.value} value={range.value}>{range.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">📍 Region</label>
                            <select
                              value={filters.region}
                              onChange={handleRegionChange}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                              <option value="">Select Region</option>
                              {regions.map(region => (
                                <option key={region.value} value={region.value}>{region.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">🏷 Brand</label>
                            <input
                              type="text"
                              value={filters.brand}
                              onChange={handleBrandChange}
                              placeholder="Enter brand name"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 justify-end px-4 py-4">
                        <button
                          type="button"
                          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          onClick={resetFilters}
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          className="ml-4 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                          onClick={() => setIsMobileDrawerOpen(false)}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
} 