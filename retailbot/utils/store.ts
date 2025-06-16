import { create } from 'zustand';

export interface Filters {
  dateRange: string;
  region: string;
  brand: string;
  category: string;
  store: string;
}

interface Store {
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
}

const initialFilters: Filters = {
  dateRange: '',
  region: '',
  brand: '',
  category: '',
  store: ''
};

export const useStore = create<Store>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),
  resetFilters: () => set({ filters: initialFilters })
})); 