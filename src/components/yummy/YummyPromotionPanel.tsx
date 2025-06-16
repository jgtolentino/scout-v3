import React, { useState, useEffect } from 'react';
import { yummyApi, yummyHelpers, YummyPromotion } from '../../services/yummy';

interface YummyPromotionPanelProps {
  className?: string;
}

export const YummyPromotionPanel: React.FC<YummyPromotionPanelProps> = ({ className = '' }) => {
  const [promotions, setPromotions] = useState<YummyPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');

  useEffect(() => {
    loadPromotionData();
  }, [selectedCampaign]);

  const loadPromotionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await yummyApi.getPromotions(selectedCampaign || undefined);
      setPromotions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promotion data');
    } finally {
      setLoading(false);
    }
  };

  const topPerformingPromos = promotions
    .filter(promo => promo.effectiveness > 0)
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 3);

  const underperformingPromos = promotions
    .filter(promo => promo.effectiveness < 0 || promo.roi < 0)
    .slice(0, 3);

  return (
    <div className={`tbwa-chart-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary flex items-center space-x-2">
          <span>💸</span>
          <span>Yummy Promotion Intelligence</span>
        </h3>
        
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Campaigns</option>
          {promotions.map(promo => (
            <option key={promo.campaign_id} value={promo.campaign_id}>{promo.campaign_id}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Analyzing promotion performance...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
          <button 
            onClick={loadPromotionData}
            className="mt-2 text-red-700 hover:text-red-800 text-sm underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {/* Top Performing Promotions */}
          {topPerformingPromos.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">🏆 Top Performing Campaigns</h4>
              <div className="space-y-2">
                {topPerformingPromos.map(promo => (
                  <div key={promo.campaign_id} className="bg-white rounded-lg p-3 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{promo.campaign_id}</span>
                      <span className="tbwa-badge bg-green-100 text-green-800">
                        {promo.roi > 0 ? `+${promo.roi.toFixed(1)}%` : `${promo.roi.toFixed(1)}%`} ROI
                      </span>
                    </div>
                    <div className="text-sm text-green-700">
                      {yummyHelpers.formatPromotionEffectiveness(promo)}
                    </div>
                    {promo.recommendation && (
                      <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                        💡 {promo.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Underperforming Promotions */}
          {underperformingPromos.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-3">📉 Underperforming Campaigns</h4>
              <div className="space-y-2">
                {underperformingPromos.map(promo => (
                  <div key={promo.campaign_id} className="bg-white rounded-lg p-3 border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{promo.campaign_id}</span>
                      <span className="tbwa-badge bg-red-100 text-red-800">
                        {promo.roi.toFixed(1)}% ROI
                      </span>
                    </div>
                    <div className="text-sm text-red-700">
                      {yummyHelpers.formatPromotionEffectiveness(promo)}
                    </div>
                    {promo.recommendation && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                        🔧 {promo.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promotion Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.slice(0, 6).map(promo => (
              <div key={promo.campaign_id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900 truncate">{promo.campaign_id}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    promo.effectiveness > 10
                      ? 'bg-green-100 text-green-800'
                      : promo.effectiveness > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {promo.effectiveness > 0 ? '+' : ''}{promo.effectiveness.toFixed(1)}%
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>ROI:</span>
                    <span className={promo.roi > 0 ? 'text-green-600' : 'text-red-600'}>
                      {promo.roi > 0 ? '+' : ''}{promo.roi.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Effectiveness:</span>
                    <span className={promo.effectiveness > 0 ? 'text-green-600' : 'text-red-600'}>
                      {promo.effectiveness > 0 ? '📈' : '📉'} {Math.abs(promo.effectiveness).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {promo.recommendation && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    💡 {promo.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📊 Campaign Summary</h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{promotions.length}</div>
                <div className="text-sm text-gray-600">Total Campaigns</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{topPerformingPromos.length}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{underperformingPromos.length}</div>
                <div className="text-sm text-gray-600">Underperforming</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">
                  {promotions.length > 0 
                    ? (promotions.reduce((sum, p) => sum + p.roi, 0) / promotions.length).toFixed(1)
                    : '0'
                  }%
                </div>
                <div className="text-sm text-gray-600">Avg ROI</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};