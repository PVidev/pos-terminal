import React, { useState, useMemo } from 'react';
import { X, Download, FileText, Calendar, Filter, Search } from 'lucide-react';
import { Transaction, ReportFilters } from '../types';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ 
  isOpen, 
  onClose, 
  transactions 
}) => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: undefined,
    endDate: undefined,
    cashier: '',
    paymentMethod: 'all',
    minAmount: undefined,
    maxAmount: undefined
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Date filter
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (new Date(transaction.timestamp) < startDate) return false;
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (new Date(transaction.timestamp) > endDate) return false;
      }

      // Payment method filter
      if (filters.paymentMethod && filters.paymentMethod !== 'all') {
        if (transaction.paymentMethod !== filters.paymentMethod) return false;
      }

      // Amount filter
      if (filters.minAmount && transaction.total < filters.minAmount) return false;
      if (filters.maxAmount && transaction.total > filters.maxAmount) return false;

      // Cashier filter
      if (filters.cashier && transaction.cashier !== filters.cashier) return false;

      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesId = transaction.id.toLowerCase().includes(searchLower);
        const matchesItems = transaction.items.some(item => 
          item.name.toLowerCase().includes(searchLower)
        );
        if (!matchesId && !matchesItems) return false;
      }

      return true;
    });
  }, [transactions, filters, searchTerm]);

  const summary = useMemo(() => {
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = filteredTransactions.length;
    const averageOrder = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    const paymentMethods = {
      cash: { count: 0, revenue: 0 },
      card: { count: 0, revenue: 0 },
      digital: { count: 0, revenue: 0 }
    };

    filteredTransactions.forEach(t => {
      paymentMethods[t.paymentMethod].count++;
      paymentMethods[t.paymentMethod].revenue += t.total;
    });

    return {
      totalRevenue,
      totalTransactions,
      averageOrder,
      paymentMethods
    };
  }, [filteredTransactions]);

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPaymentMethodName = (method: string) => {
    const methods = {
      cash: 'В брой',
      card: 'Карта',
      digital: 'Дигитално'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const exportToPDF = () => {
    // Create a simple HTML report for printing
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      const html = `
        <html>
          <head>
            <title>Справка за продажби</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
              .transactions { width: 100%; border-collapse: collapse; }
              .transactions th, .transactions td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .transactions th { background-color: #f2f2f2; }
              .total { font-weight: bold; background-color: #e8f5e8; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Справка за продажби</h1>
              <p>Генерирана на: ${new Date().toLocaleString('bg-BG')}</p>
            </div>
            
            <div class="summary">
              <h3>Обобщение</h3>
              <p>Общо транзакции: ${summary.totalTransactions}</p>
              <p>Общ оборот: ${summary.totalRevenue.toFixed(2)} лв</p>
              <p>Средна поръчка: ${summary.averageOrder.toFixed(2)} лв</p>
            </div>
            
            <table class="transactions">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Дата</th>
                  <th>Сума</th>
                  <th>Плащане</th>
                  <th>Артикули</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransactions.map(t => `
                  <tr>
                    <td>#${t.id.slice(-6)}</td>
                    <td>${formatDate(t.timestamp)}</td>
                    <td>${t.total.toFixed(2)} лв</td>
                    <td>${getPaymentMethodName(t.paymentMethod)}</td>
                    <td>${t.items.length}</td>
                  </tr>
                `).join('')}
                <tr class="total">
                  <td colspan="2">ОБЩО</td>
                  <td>${summary.totalRevenue.toFixed(2)} лв</td>
                  <td>${summary.totalTransactions} транзакции</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;
      
      reportWindow.document.write(html);
      reportWindow.document.close();
      reportWindow.print();
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Дата', 'Сума', 'Плащане', 'Артикули', 'Детайли'];
    const rows = filteredTransactions.map(t => [
      `#${t.id.slice(-6)}`,
      formatDate(t.timestamp),
      t.total.toFixed(2),
      getPaymentMethodName(t.paymentMethod),
      t.items.length.toString(),
      t.items.map(item => `${item.name} x${item.quantity}`).join('; ')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      cashier: '',
      paymentMethod: 'all',
      minAmount: undefined,
      maxAmount: undefined
    });
    setSearchTerm('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Справки и архив</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Филтри
            </h3>
            <button
              onClick={resetFilters}
              className="text-gray-400 hover:text-white text-sm"
            >
              Изчисти всички
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                От дата
              </label>
              <input
                type="date"
                value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  startDate: e.target.value ? new Date(e.target.value) : undefined 
                }))}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                До дата
              </label>
              <input
                type="date"
                value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  endDate: e.target.value ? new Date(e.target.value) : undefined 
                }))}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Метод на плащане
              </label>
              <select
                value={filters.paymentMethod || 'all'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  paymentMethod: e.target.value === 'all' ? 'all' : e.target.value as any
                }))}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">Всички</option>
                <option value="cash">В брой</option>
                <option value="card">Карта</option>
                <option value="digital">Дигитално</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Мин. сума
              </label>
              <input
                type="number"
                step="0.01"
                value={filters.minAmount || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  minAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Макс. сума
              </label>
              <input
                type="number"
                step="0.01"
                value={filters.maxAmount || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  maxAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Търсене
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="ID или продукт..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Транзакции</div>
            <div className="text-white text-xl font-bold">{summary.totalTransactions}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Общ оборот</div>
            <div className="text-emerald-400 text-xl font-bold">{summary.totalRevenue.toFixed(2)} лв</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Средна поръчка</div>
            <div className="text-white text-xl font-bold">{summary.averageOrder.toFixed(2)} лв</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Експорт</div>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={exportToPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                PDF
              </button>
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-600">
            <h3 className="text-white font-medium">
              Транзакции ({filteredTransactions.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="bg-gray-600 sticky top-0">
                <tr>
                  <th className="text-left p-3 text-gray-300 font-medium">ID</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Дата</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Сума</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Плащане</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Артикули</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Няма транзакции за показване</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(transaction => (
                    <tr key={transaction.id} className="border-b border-gray-600 hover:bg-gray-650">
                      <td className="p-3 text-white font-mono">#{transaction.id.slice(-6)}</td>
                      <td className="p-3 text-gray-300">{formatDate(transaction.timestamp)}</td>
                      <td className="p-3 text-emerald-400 font-bold">{transaction.total.toFixed(2)} лв</td>
                      <td className="p-3 text-gray-300">{getPaymentMethodName(transaction.paymentMethod)}</td>
                      <td className="p-3 text-gray-300">
                        <div className="max-w-xs">
                          <div className="text-sm">
                            {transaction.items.slice(0, 2).map(item => (
                              <div key={item.id}>{item.name} x{item.quantity}</div>
                            ))}
                            {transaction.items.length > 2 && (
                              <div className="text-gray-500">+{transaction.items.length - 2} още</div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={exportToPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Експорт PDF</span>
          </button>
          <button
            onClick={exportToCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Експорт CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};