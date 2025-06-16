import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DateRange {
  from: string | null;
  to: string | null;
}

interface FilterState {
  date_range: DateRange | null;
  regions: string[];
  stores: string[];
  brands: string[];
  categories: string[];
  barangays: string[];
}

interface FilterStore extends FilterState {
  isLoading: boolean;
  lastApplied: Date | null;
  
  // Actions
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearAllFilters: () => void;
  clearFilter: (key: keyof FilterState) => void;
  applyFilterPreset: (presetFilters: Partial<FilterState>) => void;
  setLoading: (loading: boolean) => void;
  
  // Getters
  hasActiveFilters: () => boolean;
  getActiveFilterCount: () => number;
  generateQueryParams: () => URLSearchParams;
}

const initialState: FilterState = {
  date_range: null,
  regions: [],
  stores: [],
  brands: [],
  categories: [],
  barangays: []
};

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      isLoading: false,
      lastApplied: null,

      setFilter: (key, value) => {
        set((state) => {
          const newState = {
            ...state,
            [key]: value
          };

          // Smart dependencies: clear dependent filters when parent changes
          if (key === 'regions') {
            // Clear stores and barangays when regions change
            newState.stores = [];
            newState.barangays = [];
          }

          if (key === 'categories') {
            // Could filter brands based on categories in the future
          }

          return newState;
        });
      },

      clearAllFilters: () => {
        set({
          ...initialState,
          isLoading: false,
          lastApplied: new Date()
        });
      },

      clearFilter: (key) => {
        set((state) => ({
          ...state,
          [key]: Array.isArray(state[key]) ? [] : null
        }));
      },

      applyFilterPreset: (presetFilters) => {
        set((state) => {
          const newState = { ...state };
          
          // Apply preset filters
          Object.entries(presetFilters).forEach(([key, value]) => {
            if (key === 'date_range' && typeof value === 'object' && 'preset' in value) {
              // Handle date presets
              const now = new Date();
              let from: Date;
              let to: Date = now;

              switch (value.preset) {
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
                default:
                  return;
              }

              newState.date_range = {
                from: from.toISOString().split('T')[0],
                to: to.toISOString().split('T')[0]
              };
            } else {
              (newState as any)[key] = value;
            }
          });

          newState.lastApplied = new Date();
          return newState;
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      hasActiveFilters: () => {
        const state = get();
        return !!(
          state.date_range?.from ||
          state.date_range?.to ||
          state.regions.length > 0 ||
          state.stores.length > 0 ||
          state.brands.length > 0 ||
          state.categories.length > 0 ||
          state.barangays.length > 0
        );
      },

      getActiveFilterCount: () => {
        const state = get();
        let count = 0;
        
        if (state.date_range?.from || state.date_range?.to) count++;
        if (state.regions.length > 0) count += state.regions.length;
        if (state.stores.length > 0) count += state.stores.length;
        if (state.brands.length > 0) count += state.brands.length;
        if (state.categories.length > 0) count += state.categories.length;
        if (state.barangays.length > 0) count += state.barangays.length;
        
        return count;
      },

      generateQueryParams: () => {
        const state = get();
        const params = new URLSearchParams();

        if (state.date_range?.from) params.append('from', state.date_range.from);
        if (state.date_range?.to) params.append('to', state.date_range.to);
        
        state.regions.forEach(region => params.append('region', region));
        state.stores.forEach(store => params.append('store', store));
        state.brands.forEach(brand => params.append('brand', brand));
        state.categories.forEach(category => params.append('category', category));
        state.barangays.forEach(barangay => params.append('barangay', barangay));

        return params;
      }
    }),
    {
      name: 'scout-filters',
      partialize: (state) => ({
        date_range: state.date_range,
        regions: state.regions,
        stores: state.stores,
        brands: state.brands,
        categories: state.categories,
        barangays: state.barangays
      })
    }
  )
);

// Hook for building Supabase query filters
export const useSupabaseFilters = () => {
  const filters = useFilterStore();
  
  const buildSupabaseQuery = (query: any) => {
    // Date range filter
    if (filters.date_range?.from) {
      query = query.gte('transaction_date', filters.date_range.from);
    }
    if (filters.date_range?.to) {
      query = query.lte('transaction_date', filters.date_range.to);
    }

    // Region filter (assuming we join with stores table)
    if (filters.regions.length > 0) {
      query = query.in('stores.region', filters.regions);
    }

    // Store filter
    if (filters.stores.length > 0) {
      query = query.in('store_id', filters.stores);
    }

    // Brand filter (assuming we join with products and brands)
    if (filters.brands.length > 0) {
      query = query.in('products.brands.name', filters.brands);
    }

    // Category filter
    if (filters.categories.length > 0) {
      query = query.in('products.category', filters.categories);
    }

    return query;
  };

  return { buildSupabaseQuery, filters };
};