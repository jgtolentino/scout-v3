import React, { useState, useEffect } from 'react';
import { yummyApi, yummyHelpers, YummyInventory } from '../../services/yummy';

interface YummyInventoryPanelProps {
  className?: string;
}

export const YummyInventoryPanel: React.FC<YummyInventoryPanelProps> = ({ className = '' }) => {
  const [inventory, setInventory] = useState<YummyInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSku, setSelectedSku] = useState<string>('');

  useEffect(() => {
    loadInventoryData();
  }, [selectedSku]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await yummyApi.getInventory(selectedSku || undefined);
      setInventory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = inventory.filter(item => item.current_stock <= item.reorder_point);
  const criticalStockItems = inventory.filter(item => item.current_stock <= item.reorder_point * 0.5);

  return (
    <div className={`tbwa-chart-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary flex items-center space-x-2">
          <span>📦</span>
          <span>Yummy Inventory Intelligence</span>
        </h3>
        
        <select
          value={selectedSku}
          onChange={(e) => setSelectedSku(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All SKUs</option>
          {inventory.map(item => (
            <option key={item.sku} value={item.sku}>{item.sku}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Loading inventory insights...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
          <button 
            onClick={loadInventoryData}
            className="mt-2 text-red-700 hover:text-red-800 text-sm underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {/* Critical Alerts */}
          {criticalStockItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">🔴 Critical Stock Alerts</h4>
              <div className="space-y-1">
                {criticalStockItems.map(item => (
                  <div key={item.sku} className="text-sm text-red-700">
                    {yummyHelpers.formatInventoryAlert(item)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Warnings */}
          {lowStockItems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Low Stock Warnings</h4>
              <div className="space-y-1">
                {lowStockItems.map(item => (
                  <div key={item.sku} className="text-sm text-yellow-700">
                    {yummyHelpers.formatInventoryAlert(item)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.slice(0, 6).map(item => (
              <div key={item.sku} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900 truncate">{item.sku}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.current_stock <= item.reorder_point * 0.5
                      ? 'bg-red-100 text-red-800'
                      : item.current_stock <= item.reorder_point
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.current_stock} units
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Reorder Point:</span>
                    <span>{item.reorder_point}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lead Time:</span>
                    <span>{item.lead_time} days</span>
                  </div>
                </div>
                
                {item.recommendation && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    💡 {item.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📊 Inventory Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{inventory.length}</div>
                <div className="text-sm text-gray-600">Total SKUs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
                <div className="text-sm text-gray-600">Low Stock</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{criticalStockItems.length}</div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};