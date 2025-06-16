import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Supabase response types
interface LocationItem {
  barangay: string
  total_revenue: number
  transaction_count: number
}

interface BrandItem {
  brand: string
  total_revenue: number
  growth_rate?: number
}

interface CategoryItem {
  category: string
  total_revenue: number
  growth_rate?: number
}

interface DailyTrendItem {
  date: string
  date_label?: string
  transaction_count: number
  total_revenue: number
}

export interface RealTimeMetrics {
  totalTransactions: number
  totalRevenue: number
  avgTransactionValue: number
  topBrand: string
  topCategory: string
  peakHour: string
  weekendVsWeekday: {
    weekend: number
    weekday: number
  }
  genderDistribution: {
    male: number
    female: number
  }
  ageDistribution: Array<{
    ageGroup: string
    count: number
    percentage: number
  }>
  locationPerformance: Array<{
    barangay: string
    revenue: number
    transactions: number
  }>
  brandPerformance: Array<{
    brand: string
    revenue: number
    growth: number
  }>
  categoryTrends: Array<{
    category: string
    revenue: number
    growth: number
  }>
  hourlyTrends: Array<{
    hour: number
    transactions: number
    revenue: number
  }>
  dailyTrends: Array<{
    date: string
    transactions: number
    revenue: number
  }>
}

export interface FilterState {
  dateRange: { from: string; to: string }
  barangays: string[]
  categories: string[]
  brands: string[]
  stores: string[]
}

export function useRealDataAnalytics() {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRealTimeMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Use empty filter object for all analytics functions
      const filterObj = {};

      const [
        dashboardSummary,
        ageDistribution,
        genderDistribution,
        locationDistribution,
        brandPerformance,
        categoryMetrics,
        dailyTrends
      ] = await Promise.all([
        supabase.rpc('get_dashboard_summary', { filters: filterObj }),
        supabase.rpc('get_age_distribution_simple', { filters: filterObj }),
        supabase.rpc('get_gender_distribution_simple', { filters: filterObj }),
        supabase.rpc('get_location_distribution', { filters: filterObj }),
        supabase.rpc('get_brand_performance', { filters: filterObj }),
        supabase.rpc('get_product_categories_summary', { filters: filterObj }),
        supabase.rpc('get_daily_trends', { filters: filterObj })
      ])

      // Check for errors
      const errors = [
        dashboardSummary.error,
        ageDistribution.error,
        genderDistribution.error,
        locationDistribution.error,
        brandPerformance.error,
        categoryMetrics.error,
        dailyTrends.error
      ].filter(Boolean)

      if (errors.length > 0) {
        throw new Error(`Database errors: ${errors.map(e => e.message).join(', ')}`)
      }

      // Process and structure the data
      const processedMetrics: RealTimeMetrics = {
        // Dashboard summary metrics
        totalTransactions: dashboardSummary.data?.total_transactions || 0,
        totalRevenue: dashboardSummary.data?.total_revenue || 0,
        avgTransactionValue: dashboardSummary.data?.avg_transaction_value || 0,

        // Top performers
        topBrand: brandPerformance.data?.[0]?.brand || 'N/A',
        topCategory: categoryMetrics.data?.[0]?.category || 'N/A',
        peakHour: '19:00-20:00', // Static for now since hourly trends needs fixing

        // Weekend vs Weekday analysis (simplified)
        weekendVsWeekday: { weekend: 0, weekday: 0 },

        // Gender distribution
        genderDistribution: {
          male: (genderDistribution.data || []).find((item: { gender: string; count: number }) => item.gender === 'M')?.count || 0,
          female: (genderDistribution.data || []).find((item: { gender: string; count: number }) => item.gender === 'F')?.count || 0
        },

        // Age distribution
        ageDistribution: (ageDistribution.data || []).map((item: { age_group: string; count: number; percentage?: number }) => ({
          ageGroup: item.age_group,
          count: item.count || 0,
          percentage: item.percentage || 0
        })),

        // Location performance
        locationPerformance: (locationDistribution.data || []).map((item: LocationItem) => ({
          barangay: item.barangay || 'Unknown',
          revenue: item.total_revenue || 0,
          transactions: item.transaction_count || 0
        })),

        // Brand performance
        brandPerformance: (brandPerformance.data || []).map((item: BrandItem) => ({
          brand: item.brand,
          revenue: item.total_revenue || 0,
          growth: item.growth_rate || 0
        })),

        // Category trends
        categoryTrends: (categoryMetrics.data || []).map((item: CategoryItem) => ({
          category: item.category,
          revenue: item.total_revenue || 0,
          growth: item.growth_rate || 0
        })),

        // Hourly trends (simplified for now)
        hourlyTrends: [],

        // Daily trends
        dailyTrends: (dailyTrends.data || []).map((item: DailyTrendItem) => ({
          date: item.date_label || item.date,
          transactions: item.transaction_count || 0,
          revenue: item.total_revenue || 0
        }))
      }

      setMetrics(processedMetrics)
    } catch (err) {
      console.error('Failed to fetch real-time metrics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])


  // Fetch data when filters change
  useEffect(() => {
    fetchRealTimeMetrics()
  }, [fetchRealTimeMetrics])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchRealTimeMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchRealTimeMetrics])

  return {
    metrics,
    loading,
    error,
    refetch: fetchRealTimeMetrics
  }
}

// Hook for AI insights using real data
export function useAIInsights(filters: FilterState) {
  const [insights, setInsights] = useState<Array<{ insight: string; confidence: number; category: string; actionItems: string[] }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAIInsights = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateRange: filters.dateRange,
          barangays: filters.barangays,
          categories: filters.categories,
          brands: filters.brands,
          stores: filters.stores
        })
      })

      if (!response.ok) {
        throw new Error(`AI insights request failed: ${response.status}`)
      }

      const data = await response.json()
      setInsights(data.insights || [])
    } catch (err) {
      console.error('Failed to fetch AI insights:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchAIInsights()
  }, [fetchAIInsights])

  return {
    insights,
    loading,
    error,
    refetch: fetchAIInsights
  }
}