import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, Filter, RefreshCw } from 'lucide-react';
import { fetchAllTransactions, TransactionRecord } from '../services/fetchAllTransactions';
import { useFilterStore } from '../store/useFilterStore';

interface TransactionDataTableProps {
  className?: string;
}

export const TransactionDataTable: React.FC<TransactionDataTableProps> = ({ className = "" }) => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  const { regions, brands, categories, hasActiveFilters } = useFilterStore();

  // Fetch all transactions on component mount
  useEffect(() => {
    loadAllTransactions();
  }, []);

  const loadAllTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchAllTransactions();
      
      if (result.error) {
        setError(result.error);
      }
      
      setTransactions(result.transactions);
      setTotalCount(result.totalCount);
      console.log(`📊 Loaded ${result.transactions.length} transactions`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.id.toLowerCase().includes(searchLower) ||
        transaction.customers?.first_name?.toLowerCase().includes(searchLower) ||
        transaction.customers?.last_name?.toLowerCase().includes(searchLower) ||
        transaction.stores?.name?.toLowerCase().includes(searchLower) ||
        transaction.stores?.region?.toLowerCase().includes(searchLower) ||
        transaction.transaction_items_fmcg?.some(item => 
          item.products?.name?.toLowerCase().includes(searchLower) ||
          item.products?.brands?.name?.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply filter store filters
    if (regions.length > 0) {
      filtered = filtered.filter(t => 
        regions.includes(t.stores?.region || '')
      );
    }

    if (brands.length > 0) {
      filtered = filtered.filter(t =>
        t.transaction_items_fmcg?.some(item =>
          brands.includes(item.products?.brands?.name || '')
        )
      );
    }

    if (categories.length > 0) {
      filtered = filtered.filter(t =>
        t.transaction_items_fmcg?.some(item =>
          categories.includes(item.products?.category || '')
        )
      );
    }

    return filtered;
  }, [transactions, searchTerm, regions, brands, categories]);

  // Paginate results
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);

  const exportToCSV = () => {
    const headers = [
      'Transaction ID',
      'Date',
      'Amount',
      'Customer',
      'Store',
      'Region',
      'Payment Method',
      'Items Count',
      'Product Names',
      'Brand Names'
    ];

    const csvData = filteredTransactions.map(t => [
      t.id,
      new Date(t.transaction_date).toLocaleDateString(),
      `₱${t.total_amount.toFixed(2)}`,
      `${t.customers?.first_name || ''} ${t.customers?.last_name || ''}`.trim(),
      t.stores?.name || '',
      t.stores?.region || '',
      t.payment_method || '',
      t.transaction_items_fmcg?.length || 0,
      t.transaction_items_fmcg?.map(item => item.products?.name).join('; ') || '',
      t.transaction_items_fmcg?.map(item => item.products?.brands?.name).join('; ') || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scout-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading all {totalCount > 0 ? totalCount : '5,000'} transactions...</span>
        </div>
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">All Transaction Records</h2>
            <p className="text-sm text-gray-600">
              Showing {filteredTransactions.length.toLocaleString()} of {totalCount.toLocaleString()} transactions
              {hasActiveFilters() && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Filtered
                </span>
              )}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadAllTransactions}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions, customers, stores, products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={250}>250 per page</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.id.slice(0, 8)}...
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(transaction.transaction_date).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">
                    ₱{transaction.total_amount.toFixed(2)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {transaction.customers?.first_name} {transaction.customers?.last_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {transaction.customers?.age && `${transaction.customers.age}y`} {transaction.customers?.gender}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{transaction.stores?.name}</div>
                  <div className="text-xs text-gray-500">{transaction.stores?.region}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {transaction.transaction_items_fmcg?.length || 0} items
                  </div>
                  <div className="text-xs text-gray-500 max-w-xs truncate">
                    {transaction.transaction_items_fmcg?.map(item => item.products?.name).join(', ')}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {transaction.payment_method || 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};