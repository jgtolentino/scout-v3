import React, { useState, useEffect } from 'react';
import { yummyApi, yummyHelpers, YummyCompetitor } from '../../services/yummy';

interface YummyCompetitorPanelProps {
  className?: string;
}

export const YummyCompetitorPanel: React.FC<YummyCompetitorPanelProps> = ({ className = '' }) => {
  const [competitors, setCompetitors] = useState<YummyCompetitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('');

  useEffect(() => {
    loadCompetitorData();
  }, [selectedBrand]);

  const loadCompetitorData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await yummyApi.getCompetitors(selectedBrand || undefined);
      setCompetitors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competitor data');
    } finally {
      setLoading(false);
    }
  };

  const highThreatCompetitors = competitors.filter(comp => comp.threat_level === 'high');
  const topMarketShareCompetitors = competitors
    .sort((a, b) => b.market_share - a.market_share)
    .slice(0, 5);

  const getThreatColor = (threatLevel: string) => {
    switch (threatLevel) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPricePositionEmoji = (position: string) => {
    switch (position.toLowerCase()) {
      case 'premium': return '💎';
      case 'mid-tier': return '⚖️';
      case 'value': return '💰';
      case 'budget': return '🔻';
      default: return '📊';
    }
  };

  return (
    <div className={`tbwa-chart-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary flex items-center space-x-2">
          <span>🆚</span>
          <span>Yummy Competitor Intelligence</span>
        </h3>
        
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Brands</option>
          {competitors.map(comp => (
            <option key={comp.brand} value={comp.brand}>{comp.brand}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Analyzing competitive landscape...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
          <button 
            onClick={loadCompetitorData}
            className="mt-2 text-red-700 hover:text-red-800 text-sm underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {/* High Threat Alerts */}
          {highThreatCompetitors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-3">🚨 High Threat Competitors</h4>
              <div className="space-y-2">
                {highThreatCompetitors.map(comp => (
                  <div key={comp.brand} className="bg-white rounded-lg p-3 border border-red-100">
                    <div className="text-sm text-red-700">
                      {yummyHelpers.formatCompetitorThreat(comp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Share Leaders */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-3">👑 Market Share Leaders</h4>
            <div className="space-y-2">
              {topMarketShareCompetitors.map((comp, index) => (
                <div key={comp.brand} className="bg-white rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                      <span className="font-medium text-gray-900">{comp.brand}</span>
                      <span className="text-sm">{getPricePositionEmoji(comp.price_position)} {comp.price_position}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-blue-600">
                        {comp.market_share.toFixed(1)}%
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getThreatColor(comp.threat_level)}`}>
                        {comp.threat_level} threat
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.slice(0, 6).map(comp => (
              <div key={comp.brand} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900 truncate">{comp.brand}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getThreatColor(comp.threat_level)}`}>
                    {comp.threat_level}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Market Share:</span>
                    <span className="font-medium text-primary">{comp.market_share.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price Position:</span>
                    <span className="text-sm font-medium">
                      {getPricePositionEmoji(comp.price_position)} {comp.price_position}
                    </span>
                  </div>
                  
                  {/* Market Share Visualization */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Market Share</span>
                      <span>{comp.market_share.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(comp.market_share, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Competitive Intelligence Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">📊 Competitive Intelligence Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{competitors.length}</div>
                <div className="text-sm text-gray-600">Total Competitors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{highThreatCompetitors.length}</div>
                <div className="text-sm text-gray-600">High Threats</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">
                  {competitors.length > 0 
                    ? (competitors.reduce((sum, c) => sum + c.market_share, 0) / competitors.length).toFixed(1)
                    : '0'
                  }%
                </div>
                <div className="text-sm text-gray-600">Avg Market Share</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {competitors.filter(c => c.price_position.toLowerCase() === 'premium').length}
                </div>
                <div className="text-sm text-gray-600">Premium Players</div>
              </div>
            </div>
          </div>

          {/* Threat Level Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">⚡ Threat Level Distribution</h4>
            <div className="space-y-2">
              {['high', 'medium', 'low'].map(level => {
                const count = competitors.filter(c => c.threat_level === level).length;
                const percentage = competitors.length > 0 ? (count / competitors.length) * 100 : 0;
                return (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${
                        level === 'high' ? 'bg-red-500' : 
                        level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></span>
                      <span className="text-sm capitalize">{level} Threat</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            level === 'high' ? 'bg-red-500' : 
                            level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};