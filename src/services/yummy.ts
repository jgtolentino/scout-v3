import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Types
interface YummyInsight {
  category: string;
  trend: string;
  recommendation: string;
  confidence: number;
}

interface YummyRecommendation {
  sku: string;
  action: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
}

interface YummyTrend {
  metric: string;
  value: number;
  change: number;
  period: string;
}

interface YummyBenchmark {
  category: string;
  metric: string;
  value: number;
  benchmark: number;
  difference: number;
}

interface YummyInventory {
  sku: string;
  current_stock: number;
  reorder_point: number;
  lead_time: number;
  recommendation: string;
}

interface YummyPromotion {
  campaign_id: string;
  effectiveness: number;
  roi: number;
  recommendation: string;
}

interface YummyCompetitor {
  brand: string;
  market_share: number;
  price_position: string;
  threat_level: 'high' | 'medium' | 'low';
}

// API Endpoints
export const yummyApi = {
  // Get category insights
  async getInsights(category?: string): Promise<YummyInsight[]> {
    const { data, error } = await supabase
      .rpc('get_fmcg_category_insights', { category_name: category });
    
    if (error) throw error;
    return data;
  },

  // Get product recommendations
  async getRecommendations(sku?: string): Promise<YummyRecommendation[]> {
    const { data, error } = await supabase
      .rpc('get_fmcg_product_recommendations', { product_sku: sku });
    
    if (error) throw error;
    return data;
  },

  // Get market trends
  async getTrends(metric?: string): Promise<YummyTrend[]> {
    const { data, error } = await supabase
      .rpc('get_fmcg_market_trends', { metric_name: metric });
    
    if (error) throw error;
    return data;
  },

  // Get competitive benchmarks
  async getBenchmarks(category?: string): Promise<YummyBenchmark[]> {
    const { data, error } = await supabase
      .rpc('get_fmcg_competitive_benchmarks', { category_name: category });
    
    if (error) throw error;
    return data;
  },

  // Get inventory insights
  async getInventory(sku?: string): Promise<YummyInventory[]> {
    const { data, error } = await supabase
      .rpc('get_fmcg_inventory_insights', { product_sku: sku });
    
    if (error) throw error;
    return data;
  },

  // Get promotion analysis
  async getPromotions(campaign_id?: string): Promise<YummyPromotion[]> {
    const { data, error } = await supabase
      .rpc('get_fmcg_promotion_analysis', { campaign_id: campaign_id });
    
    if (error) throw error;
    return data;
  },

  // Get competitor analysis
  async getCompetitors(brand?: string): Promise<YummyCompetitor[]> {
    const { data, error } = await supabase
      .rpc('get_fmcg_competitor_analysis', { brand_name: brand });
    
    if (error) throw error;
    return data;
  }
};

// Helper Functions
export const yummyHelpers = {
  // Format insights for display
  formatInsight(insight: YummyInsight): string {
    return `${insight.category}: ${insight.trend} (${insight.confidence}% confidence)`;
  },

  // Calculate trend direction
  getTrendDirection(trend: YummyTrend): 'up' | 'down' | 'stable' {
    if (trend.change > 5) return 'up';
    if (trend.change < -5) return 'down';
    return 'stable';
  },

  // Prioritize recommendations
  prioritizeRecommendations(recommendations: YummyRecommendation[]): YummyRecommendation[] {
    return recommendations.sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    });
  },

  // Format inventory alert
  formatInventoryAlert(inventory: YummyInventory): string {
    if (inventory.current_stock <= inventory.reorder_point) {
      return `⚠️ Low stock alert: ${inventory.sku} (${inventory.current_stock} units)`;
    }
    return `✅ Stock level OK: ${inventory.sku} (${inventory.current_stock} units)`;
  },

  // Format promotion effectiveness
  formatPromotionEffectiveness(promotion: YummyPromotion): string {
    const effectiveness = promotion.effectiveness > 0 ? '📈' : '📉';
    return `${effectiveness} Campaign ${promotion.campaign_id}: ${promotion.effectiveness}% effectiveness (ROI: ${promotion.roi}%)`;
  },

  // Format competitor threat
  formatCompetitorThreat(competitor: YummyCompetitor): string {
    const threatEmoji = {
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    }[competitor.threat_level];
    return `${threatEmoji} ${competitor.brand}: ${competitor.market_share}% market share (${competitor.price_position} pricing)`;
  }
};

// Export types
export type {
  YummyInsight,
  YummyRecommendation,
  YummyTrend,
  YummyBenchmark,
  YummyInventory,
  YummyPromotion,
  YummyCompetitor
}; 