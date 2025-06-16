import { useState, useEffect } from 'react';
import { useFilterStore } from '../store/useFilterStore';
import { useTransactionData } from './useTransactionData';
import {
  getDashboardSummary,
  getLocationDistribution,
  getProductCategoriesSummary,
  getBrandPerformance,
  getHourlyTrends,
  getDailyTrends,
  getAgeDistribution,
  getGenderDistribution
} from '../lib/supabase';
import type {
  DashboardSummary,
  LocationDistribution,
  CategorySummary,
  BrandPerformance,
  HourlyTrend,
  DailyTrend,
  AgeDistribution,
  GenderDistribution
} from '../types';

export const useSupabaseData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [locationData, setLocationData] = useState<LocationDistribution[]>([]);
  const [categoryData, setCategoryData] = useState<CategorySummary[]>([]);
  const [brandData, setBrandData] = useState<BrandPerformance[]>([]);
  const [hourlyTrends, setHourlyTrends] = useState<HourlyTrend[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [ageDistribution, setAgeDistribution] = useState<AgeDistribution[]>([]);
  const [genderDistribution, setGenderDistribution] = useState<GenderDistribution[]>([]);

  const { dateRange, barangays, categories, brands, stores } = useFilterStore();
  
  // Fallback to mock data
  const mockData = useTransactionData();

  const buildFilters = () => {
    const filters: Record<string, string | string[]> = {};
    
    if (dateRange.from) filters.p_start_date = dateRange.from.toISOString();
    if (dateRange.to) filters.p_end_date = dateRange.to.toISOString();
    if (barangays.length > 0) filters.p_barangays = barangays;
    if (categories.length > 0) filters.p_categories = categories;
    if (brands.length > 0) filters.p_brands = brands;
    if (stores.length > 0) filters.p_stores = stores;
    
    return filters;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = buildFilters();
      
      // Try to fetch from Supabase first
      try {
        const [
          dashboard,
          locations,
          categoriesData,
          brandsData,
          hourly,
          daily,
          ages,
          genders
        ] = await Promise.all([
          getDashboardSummary(filters),
          getLocationDistribution(filters),
          getProductCategoriesSummary(filters),
          getBrandPerformance(filters),
          getHourlyTrends(filters),
          getDailyTrends(filters),
          getAgeDistribution(filters),
          getGenderDistribution(filters)
        ]);

        setDashboardData(dashboard);
        setLocationData(locations || []);
        setCategoryData(categoriesData || []);
        setBrandData(brandsData || []);
        setHourlyTrends(hourly || []);
        setDailyTrends(daily || []);
        setAgeDistribution(ages || []);
        setGenderDistribution(genders || []);
        
      } catch (supabaseError) {
        console.warn('Supabase functions not available, falling back to mock data:', supabaseError);
        
        // Fallback to mock data with enhanced data types
        setDashboardData(mockData.kpiData);
        setLocationData(mockData.storeData);
        setCategoryData(mockData.categoryData);
        setBrandData(mockData.brandData);
        setHourlyTrends(mockData.hourlyTrends);
        setDailyTrends(mockData.timeSeriesData);
        setAgeDistribution(mockData.ageDistribution);
        setGenderDistribution(mockData.genderDistribution);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Even on error, provide mock data as fallback with all data types
      setDashboardData(mockData.kpiData);
      setLocationData(mockData.storeData);
      setCategoryData(mockData.categoryData);
      setBrandData(mockData.brandData);
      setHourlyTrends(mockData.hourlyTrends);
      setDailyTrends(mockData.timeSeriesData);
      setAgeDistribution(mockData.ageDistribution);
      setGenderDistribution(mockData.genderDistribution);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, barangays, categories, brands, stores]);

  return {
    loading,
    error,
    dashboardData,
    locationData,
    categoryData,
    brandData,
    hourlyTrends,
    dailyTrends,
    ageDistribution,
    genderDistribution,
    refetch: fetchData
  };
};