import { createClient } from '@supabase/supabase-js'
import type {
  DashboardSummary,
  LocationDistribution,
  CategorySummary,
  BrandPerformance,
  HourlyTrend,
  DailyTrend,
  AgeDistribution,
  GenderDistribution
} from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database function calls with error handling
export const getDashboardSummary = async (filters: Record<string, string | string[]> = {}): Promise<DashboardSummary> => {
  try {
    const { data, error } = await supabase.rpc('get_dashboard_summary', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getDashboardSummary error:', error)
    throw error
  }
}

export const getLocationDistribution = async (filters: Record<string, string | string[]> = {}): Promise<LocationDistribution[]> => {
  try {
    const { data, error } = await supabase.rpc('get_location_distribution', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getLocationDistribution error:', error)
    throw error
  }
}

export const getProductCategoriesSummary = async (filters: Record<string, string | string[]> = {}): Promise<CategorySummary[]> => {
  try {
    const { data, error } = await supabase.rpc('get_product_categories_summary', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getProductCategoriesSummary error:', error)
    throw error
  }
}

export const getBrandPerformance = async (filters: Record<string, string | string[]> = {}): Promise<BrandPerformance[]> => {
  try {
    const { data, error } = await supabase.rpc('get_brand_performance', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getBrandPerformance error:', error)
    throw error
  }
}

export const getHourlyTrends = async (filters: Record<string, string | string[]> = {}): Promise<HourlyTrend[]> => {
  try {
    const { data, error } = await supabase.rpc('get_hourly_trends', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getHourlyTrends error:', error)
    throw error
  }
}

export const getDailyTrends = async (filters: Record<string, string | string[]> = {}): Promise<DailyTrend[]> => {
  try {
    const { data, error } = await supabase.rpc('get_daily_trends', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getDailyTrends error:', error)
    throw error
  }
}

export const getAgeDistribution = async (filters: Record<string, string | string[]> = {}): Promise<AgeDistribution[]> => {
  try {
    const { data, error } = await supabase.rpc('get_age_distribution_simple', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getAgeDistribution error:', error)
    throw error
  }
}

export const getGenderDistribution = async (filters: Record<string, string | string[]> = {}): Promise<GenderDistribution[]> => {
  try {
    const { data, error } = await supabase.rpc('get_gender_distribution_simple', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getGenderDistribution error:', error)
    throw error
  }
}

