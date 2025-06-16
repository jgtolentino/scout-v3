import React, { useState } from 'react';
import { YummyRetailBot } from '../components/YummyRetailBot';
import { EnhancedRetailBot } from '../components/chat/EnhancedRetailBot';
import { Bot, Sparkles, TrendingUp, MessageSquare } from 'lucide-react';

const ScoutAI: React.FC = () => {
  const [useEnhanced, setUseEnhanced] = useState(true);

  return (
    <div className="space-y-6">
      {/* TBWA Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 tbwa-gradient rounded-3xl flex items-center justify-center shadow-xl">
            <Bot className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="flex items-center justify-center space-x-4 mb-6">
          <h1 className="text-4xl font-bold text-tbwa-navy">
            Scout AI Retail Assistant
          </h1>
          <button
            onClick={() => setUseEnhanced(!useEnhanced)}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
              useEnhanced 
                ? 'tbwa-btn-primary shadow-lg transform scale-105' 
                : 'tbwa-btn-secondary hover:shadow-md'
            }`}
          >
            {useEnhanced ? '🏪 Yummy Intelligence' : '📊 Enhanced Scout'}
          </button>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {useEnhanced 
            ? 'Yummy FMCG Intelligence Agent with inventory monitoring, promotion analytics, competitive intelligence, and seamless integration with Scout RetailBot for comprehensive market analysis.'
            : 'Enhanced Scout AI with advanced analytics, predictive insights, TBWA brand intelligence, and strategic recommendations powered by real-time Philippine FMCG data.'
          }
        </p>
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-tbwa-yellow rounded-full"></div>
            <span>Real-time Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-tbwa-navy rounded-full"></div>
            <span>TBWA Intelligence</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Analytics</span>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="tbwa-card p-6 hover:border-tbwa-navy-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-tbwa-navy rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-tbwa-navy">Revenue Analysis</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Deep insights into sales performance, trends, and growth opportunities across 17 Philippine regions with real-time data integration.
          </p>
        </div>

        <div className="tbwa-card p-6 hover:border-tbwa-yellow-300 relative">
          <div className="absolute top-4 right-4">
            <span className="tbwa-badge">⭐ Premium</span>
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-tbwa-yellow rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-tbwa-navy" />
            </div>
            <h3 className="font-semibold text-tbwa-navy">Brand Intelligence</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Advanced TBWA portfolio analysis (Oishi, Del Monte, Champion) with competitive positioning, market share evolution, and strategic insights.
          </p>
        </div>

        <div className="tbwa-card p-6 hover:border-green-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-tbwa-navy">Context Aware</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Understands your applied filters and provides insights based on your current dashboard view with intelligent context switching.
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow-lg">
        {useEnhanced ? (
          <YummyRetailBot className="h-[600px]" />
        ) : (
          <EnhancedRetailBot className="h-[600px]" />
        )}
      </div>

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Pro Tips for Better Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Use filters first:</strong> Apply date ranges, regions, or brands in the filter bar above for contextual insights.
          </div>
          <div>
            <strong>Be specific:</strong> Ask "Oishi performance in NCR" instead of just "brand performance".
          </div>
          <div>
            <strong>Ask for comparisons:</strong> "Compare Visayas vs Mindanao revenue" for regional insights.
          </div>
          <div>
            <strong>Request recommendations:</strong> Ask for 3 actionable insights to improve specific metrics.
          </div>
        </div>
      </div>

      {/* Sample Questions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">🚀 Sample Questions to Get Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "What are the top 5 FMCG brands by revenue this month?",
            "How is Oishi performing compared to competitors in snacks?",
            "Which regions show the highest growth potential?",
            "What's driving the beverage category performance?",
            "Compare NCR vs CALABARZON market dynamics",
            "Give me 3 recommendations to improve Del Monte sales",
            "What's the average order value trend across regions?",
            "Which store formats are performing best for TBWA brands?"
          ].map((question, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">{question}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoutAI;