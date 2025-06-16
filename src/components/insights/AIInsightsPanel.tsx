import React, { useState } from 'react';
import { Brain, Lightbulb, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import { AIInsight } from '../../types';
import { useTransactionData } from '../../hooks/useTransactionData';
import { useAIOpenAIStream } from '../../hooks/useAIOpenAIStream';

const AIInsightsPanel: React.FC = () => {
  const { transactions } = useTransactionData();
  const { insights, streamText, loading, error, regenerate } = useAIOpenAIStream(transactions);
  const [showStreamText, setShowStreamText] = useState(false);

  const getInsightIcon = (category: AIInsight['category']) => {
    switch (category) {
      case 'opportunity':
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'system':
        return <Brain className="h-4 w-4 text-purple-600" />;
      default:
        return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightBorderColor = (category: AIInsight['category']) => {
    switch (category) {
      case 'opportunity':
        return 'border-l-yellow-400';
      case 'alert':
        return 'border-l-red-400';
      case 'trend':
        return 'border-l-blue-400';
      case 'system':
        return 'border-l-purple-400';
      default:
        return 'border-l-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
          {loading && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600">Streaming...</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {streamText && (
            <button
              onClick={() => setShowStreamText(!showStreamText)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {showStreamText ? 'Hide' : 'Show'} Stream
            </button>
          )}
          <button
            onClick={regenerate}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {showStreamText && streamText && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-xs font-medium text-blue-700 mb-2">Live Stream Output:</h4>
          <pre className="text-xs text-blue-600 whitespace-pre-wrap font-mono">
            {streamText}
          </pre>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-l-4 border-gray-200 pl-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : insights.length > 0 ? (
          insights.map((insight, index) => (
            <div
              key={index}
              className={`border-l-4 pl-4 pb-4 ${getInsightBorderColor(insight.category)} ${
                index < insights.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-start space-x-2 mb-2">
                {getInsightIcon(insight.category)}
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">{insight.insight}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      Confidence: {Math.round(insight.confidence)}%
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                      {insight.category}
                    </span>
                  </div>
                </div>
              </div>
              
              {insight.actionItems.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">Recommended Actions:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {insight.actionItems.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No insights available</p>
            <button
              onClick={regenerate}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Generate Insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsPanel;