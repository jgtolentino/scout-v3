import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Database, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Shield
} from 'lucide-react';
import { useDataAudit } from '../../hooks/useDataAudit';

const QADashboard: React.FC = () => {
  const { auditResult, validationErrors, loading, error, runAudit } = useDataAudit();

  const getQualityColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-50';
    if (score >= 85) return 'text-yellow-600 bg-yellow-50';
    if (score >= 70) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Info className="h-4 w-4 text-blue-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Running Data Audit...</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <XCircle className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Audit Failed</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={runAudit}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry Audit
        </button>
      </div>
    );
  }

  if (!auditResult) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Data Quality Audit</h2>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {auditResult.lastUpdated}
          </span>
          <button
            onClick={runAudit}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overall Data Quality Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Data Quality</h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(auditResult.dataQualityScore)}`}>
              <CheckCircle className="h-4 w-4 mr-1" />
              {auditResult.dataQualityScore}% Quality Score
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{auditResult.dataQualityScore}%</div>
            <div className="text-sm text-gray-500">Audit Duration: {auditResult.auditDuration}ms</div>
          </div>
        </div>
      </div>

      {/* Record Counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Transactions</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900">{auditResult.totalTransactions.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Customers</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900">{auditResult.totalCustomers.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Products</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900">{auditResult.totalProducts.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Stores</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900">{auditResult.totalStores.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-teal-600" />
            <span className="text-sm font-medium text-gray-700">Brands</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900">{auditResult.totalBrands.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* KPI Validation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Revenue Validation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-500">Calculated Total</span>
            <div className="text-lg font-semibold text-gray-900">
              ₱{auditResult.revenueValidation.calculatedTotal.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Database Total</span>
            <div className="text-lg font-semibold text-gray-900">
              ₱{auditResult.revenueValidation.databaseTotal.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Variance</span>
            <div className={`text-lg font-semibold ${auditResult.revenueValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
              ₱{auditResult.revenueValidation.variance.toLocaleString()}
              {auditResult.revenueValidation.isValid ? ' ✓' : ' ⚠️'}
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Data Coverage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-500">Earliest Transaction</span>
            <div className="text-lg font-semibold text-gray-900">
              {new Date(auditResult.dateRange.earliest).toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Latest Transaction</span>
            <div className="text-lg font-semibold text-gray-900">
              {new Date(auditResult.dateRange.latest).toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Days of Data</span>
            <div className="text-lg font-semibold text-gray-900">
              {auditResult.dateRange.daysSpan} days
            </div>
          </div>
        </div>
      </div>

      {/* Data Quality Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Quality Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Missing Data</span>
            <div className={`text-lg font-semibold ${auditResult.missingDataPercentage < 5 ? 'text-green-600' : 'text-red-600'}`}>
              {auditResult.missingDataPercentage.toFixed(2)}%
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Duplicate Records</span>
            <div className={`text-lg font-semibold ${auditResult.duplicateRecords === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
              {auditResult.duplicateRecords}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Errors/Warnings */}
      {validationErrors.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Issues</h3>
          <div className="space-y-3">
            {validationErrors.map((error, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                {getErrorIcon(error.type)}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{error.message}</div>
                  <div className="text-xs text-gray-500 mt-1">Impact: {error.impact}</div>
                  {error.details && (
                    <pre className="text-xs text-gray-600 mt-2 bg-gray-100 p-2 rounded">
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QADashboard;