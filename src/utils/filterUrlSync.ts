import { useFilterStore } from '@/hooks/useFilterStore';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export const useUrlFilterSync = () => {
  const router = useRouter();
  const { 
    date_range, 
    regions, 
    stores, 
    brands, 
    categories,
    setFilter 
  } = useFilterStore();

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();

    // Add date range
    if (date_range?.from) params.set('from', date_range.from);
    if (date_range?.to) params.set('to', date_range.to);

    // Add array filters
    if (regions.length > 0) params.set('regions', regions.join(','));
    if (stores.length > 0) params.set('stores', stores.join(','));
    if (brands.length > 0) params.set('brands', brands.join(','));
    if (categories.length > 0) params.set('categories', categories.join(','));

    // Update URL without triggering navigation
    const newUrl = `${router.pathname}?${params.toString()}`;
    if (newUrl !== `${router.pathname}?${router.asPath.split('?')[1] || ''}`) {
      router.replace(newUrl, undefined, { shallow: true });
    }
  }, [date_range, regions, stores, brands, categories, router]);

  // Load filters from URL on mount
  useEffect(() => {
    if (!router.isReady) return;

    const { query } = router;

    // Parse date range
    if (query.from || query.to) {
      setFilter('date_range', {
        from: (query.from as string) || null,
        to: (query.to as string) || null
      });
    }

    // Parse array filters
    if (query.regions) {
      setFilter('regions', (query.regions as string).split(','));
    }

    if (query.stores) {
      setFilter('stores', (query.stores as string).split(','));
    }

    if (query.brands) {
      setFilter('brands', (query.brands as string).split(','));
    }

    if (query.categories) {
      setFilter('categories', (query.categories as string).split(','));
    }
  }, [router.isReady, router.query, setFilter]);

  return {
    isUrlSynced: router.isReady
  };
};

// Utility function to generate shareable filter URLs
export const generateShareableUrl = (baseUrl: string, filters: any): string => {
  const params = new URLSearchParams();

  if (filters.date_range?.from) params.set('from', filters.date_range.from);
  if (filters.date_range?.to) params.set('to', filters.date_range.to);
  if (filters.regions?.length > 0) params.set('regions', filters.regions.join(','));
  if (filters.stores?.length > 0) params.set('stores', filters.stores.join(','));
  if (filters.brands?.length > 0) params.set('brands', filters.brands.join(','));
  if (filters.categories?.length > 0) params.set('categories', filters.categories.join(','));

  return `${baseUrl}?${params.toString()}`;
};

// Utility to validate filter parameters
export const validateFilterParams = (params: URLSearchParams): boolean => {
  try {
    // Validate date format
    const from = params.get('from');
    const to = params.get('to');
    
    if (from && isNaN(Date.parse(from))) return false;
    if (to && isNaN(Date.parse(to))) return false;

    // Validate array parameters don't contain invalid characters
    const arrayParams = ['regions', 'stores', 'brands', 'categories'];
    for (const param of arrayParams) {
      const value = params.get(param);
      if (value && value.includes('<') || value?.includes('>')) {
        return false; // Prevent XSS
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};

// Hook for deep linking to specific filter states
export const useFilterDeepLink = () => {
  const generateDeepLink = (preset: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    
    const presetFilters = {
      'executive': {
        date_range: { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
        regions: ['National Capital Region (NCR)'],
        categories: ['Beverages', 'Snacks', 'Dairy']
      },
      'brand_manager': {
        date_range: { from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
        brands: ['Oishi', 'Del Monte', 'Champion']
      },
      'metro_manila': {
        regions: ['National Capital Region (NCR)', 'CALABARZON', 'Central Luzon'],
        date_range: { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
      }
    };

    const filters = presetFilters[preset as keyof typeof presetFilters];
    return filters ? generateShareableUrl(baseUrl, filters) : baseUrl;
  };

  const copyToClipboard = async (preset: string) => {
    const url = generateDeepLink(preset);
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  };

  return {
    generateDeepLink,
    copyToClipboard
  };
};