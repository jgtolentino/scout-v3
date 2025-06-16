import React from 'react';
import { YummyInventoryPanel } from './YummyInventoryPanel';
import { YummyPromotionPanel } from './YummyPromotionPanel';
import { YummyCompetitorPanel } from './YummyCompetitorPanel';

interface YummyDashboardProps {
  className?: string;
}

export const YummyDashboard: React.FC<YummyDashboardProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Yummy Header */}
      <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <span>🏪</span>
              <span>Yummy FMCG Intelligence Agent</span>
            </h1>
            <p className="text-blue-100 mt-1">
              Real-time FMCG category analysis, inventory optimization & competitive intelligence
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Powered by</div>
            <div className="font-semibold">TBWA × InsightPulse AI</div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="tbwa-kpi-card text-center">
          <div className="text-3xl font-bold text-primary">📦</div>
          <div className="text-lg font-semibold mt-2">Inventory Intelligence</div>
          <div className="text-sm text-gray-600">Real-time stock monitoring & alerts</div>
        </div>
        
        <div className="tbwa-kpi-card text-center">
          <div className="text-3xl font-bold text-accent">💸</div>
          <div className="text-lg font-semibold mt-2">Promotion Analytics</div>
          <div className="text-sm text-gray-600">Campaign ROI & effectiveness tracking</div>
        </div>
        
        <div className="tbwa-kpi-card text-center">
          <div className="text-3xl font-bold text-red-500">🆚</div>
          <div className="text-lg font-semibold mt-2">Competitor Intelligence</div>
          <div className="text-sm text-gray-600">Market share & threat monitoring</div>
        </div>
      </div>

      {/* Main Dashboard Panels */}
      <div className="space-y-6">
        {/* Inventory Panel */}
        <YummyInventoryPanel />

        {/* Promotions Panel */}
        <YummyPromotionPanel />

        {/* Competitor Panel */}
        <YummyCompetitorPanel />
      </div>

      {/* Yummy Agent Capabilities */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">🧠 Yummy Agent Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-lg font-medium text-gray-900 mb-2">📊 Category Analysis</div>
            <div className="text-sm text-gray-600">
              Cross-category performance insights and trend identification
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-lg font-medium text-gray-900 mb-2">🎯 SKU Optimization</div>
            <div className="text-sm text-gray-600">
              Product performance ranking and portfolio optimization
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-lg font-medium text-gray-900 mb-2">🌍 Regional Intelligence</div>
            <div className="text-sm text-gray-600">
              Location-based demand forecasting and market analysis
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-lg font-medium text-gray-900 mb-2">⚡ Real-time Alerts</div>
            <div className="text-sm text-gray-600">
              Instant notifications for critical inventory and competitor changes
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-blue-600">🔗</span>
          <span className="font-medium text-blue-800">RetailBot Integration Status</span>
        </div>
        <div className="text-sm text-blue-700">
          Yummy agent is fully integrated with Scout Analytics RetailBot. 
          Access advanced FMCG intelligence through the chat interface with context-aware responses.
        </div>
        <div className="mt-2 flex items-center space-x-4 text-xs text-blue-600">
          <span>✅ Inventory Monitoring</span>
          <span>✅ Promotion Analytics</span>
          <span>✅ Competitor Intelligence</span>
          <span>✅ Real-time Chat Integration</span>
        </div>
      </div>
    </div>
  );
};