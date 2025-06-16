import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface AIInsight {
  insight: string;
  confidence: number;
  category: 'trend' | 'opportunity' | 'alert' | 'system';
  actionItems: string[];
}

export const useAIOpenAIStream = (transactionData: any[] | null) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [streamText, setStreamText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = useCallback(async () => {
    if (!transactionData || transactionData.length === 0) {
      // Provide default insights when no data
      setInsights([
        {
          insight: 'Welcome to Scout Analytics! Connect transaction data to see AI-powered insights.',
          confidence: 100,
          category: 'system',
          actionItems: ['Import transaction data', 'Configure data sources']
        }
      ]);
      return;
    }
    
    setLoading(true);
    setError(null);
    setStreamText('');

    try {
      // Generate insights based on transaction data analysis
      const totalRevenue = transactionData.reduce((sum, t) => sum + (t.total_amount || 0), 0);
      const avgTransaction = totalRevenue / transactionData.length;
      const recentTransactions = transactionData.filter(t => {
        const date = new Date(t.transaction_date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      });

      // Try Azure OpenAI first, fallback to rule-based insights
      try {
        const { data, error: functionError } = await supabase.functions.invoke('azure_openai_stream', {
          body: {
            prompt: 'Generate Philippine retail insights',
            transactionData: {
              total_revenue: totalRevenue,
              transaction_count: transactionData.length,
              avg_transaction: avgTransaction,
              recent_activity: recentTransactions.length
            }
          }
        });

        if (data && data.insights) {
          setInsights(data.insights);
          setLoading(false);
          return;
        }
      } catch (azureError) {
        console.log('Azure OpenAI unavailable, using rule-based insights');
      }

      // Rule-based insights using existing transaction data
      const ruleBasedInsights: AIInsight[] = [];

      // Revenue trend insight
      if (totalRevenue > 1000000) {
        ruleBasedInsights.push({
          insight: `Strong revenue performance with ₱${(totalRevenue/1000000).toFixed(1)}M total. Transaction volume indicates healthy market activity in the Philippine retail sector.`,
          confidence: 85,
          category: 'trend',
          actionItems: ['Maintain current strategies', 'Explore expansion opportunities', 'Monitor competitor activity']
        });
      } else {
        ruleBasedInsights.push({
          insight: `Revenue totals ₱${(totalRevenue/1000).toFixed(0)}K across ${transactionData.length} transactions. Consider growth strategies to increase market penetration.`,
          confidence: 75,
          category: 'opportunity',
          actionItems: ['Analyze customer acquisition', 'Review pricing strategy', 'Expand product offerings']
        });
      }

      // Transaction frequency insight
      if (recentTransactions.length > transactionData.length * 0.3) {
        ruleBasedInsights.push({
          insight: `Strong recent activity with ${recentTransactions.length} transactions in the past week. Customer engagement is trending positively.`,
          confidence: 80,
          category: 'trend',
          actionItems: ['Capitalize on momentum', 'Increase inventory', 'Launch promotional campaigns']
        });
      } else {
        ruleBasedInsights.push({
          insight: `Recent transaction activity at ${recentTransactions.length} transactions suggests slower period. Consider customer re-engagement strategies.`,
          confidence: 70,
          category: 'alert',
          actionItems: ['Launch customer retention campaign', 'Review seasonal patterns', 'Analyze customer feedback']
        });
      }

      // Average order value insight
      if (avgTransaction > 300) {
        ruleBasedInsights.push({
          insight: `High average order value of ₱${avgTransaction.toFixed(0)} indicates premium customer base. Focus on value-added services and loyalty programs.`,
          confidence: 82,
          category: 'opportunity',
          actionItems: ['Develop VIP customer programs', 'Introduce premium products', 'Enhance customer service']
        });
      } else {
        ruleBasedInsights.push({
          insight: `Average order value of ₱${avgTransaction.toFixed(0)} suggests opportunity to increase basket size through cross-selling and bundling strategies.`,
          confidence: 78,
          category: 'opportunity',
          actionItems: ['Implement product recommendations', 'Create bundle offers', 'Train staff on upselling']
        });
      }

      setInsights(ruleBasedInsights.slice(0, 3)); // Limit to 3 insights
      setLoading(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      
      // Minimal fallback insights
      setInsights([
        {
          insight: 'Analytics system processing transaction data. Manual review recommended for detailed insights.',
          confidence: 50,
          category: 'system',
          actionItems: ['Review KPI dashboard', 'Check data quality', 'Contact support if issues persist']
        }
      ]);
    }
  }, [transactionData]);

  // Auto-generate insights when transaction data changes
  useEffect(() => {
    generateInsights();
  }, [generateInsights]);

  return {
    insights,
    streamText,
    loading,
    error,
    regenerate: generateInsights
  };
};