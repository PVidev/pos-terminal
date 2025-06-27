import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Calendar,
  Award,
  Clock,
  BarChart3,
  PieChart,
  FileText
} from 'lucide-react';
import { Transaction, DashboardStats } from '../types';
import { HourlyChart } from './HourlyChart';
import { PaymentMethodChart } from './PaymentMethodChart';
import { ReportsModal } from './ReportsModal';

interface DashboardProps {
  transactions: Transaction[];
  stats: DashboardStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, stats }) => {
  const [showReports, setShowReports] = useState(false);
  const recentTransactions = transactions.slice(0, 10);

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} лв`;
  
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

  return (
    <div className="p-6 space-y-6">
      {/* Header with Reports Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Дашборд</h1>
          <p className="text-gray-400">Преглед на продажби и статистики</p>
        </div>
        <button
          onClick={() => setShowReports(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Справки и архив</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Общо поръчки</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.totalTransactions}
              </p>
            </div>
            <div className="bg-blue-600 bg-opacity-20 p-3 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-400">Днес: {stats.todayTransactions}</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Общ оборот</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-emerald-600 bg-opacity-20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-400">Днес: {formatCurrency(stats.todayRevenue)}</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Средна поръчка</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(stats.averageOrderValue)}
              </p>
            </div>
            <div className="bg-purple-600 bg-opacity-20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-3 h-3 text-emerald-400 mr-1" />
            <span className="text-emerald-400">+12.5%</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Активно време</p>
              <p className="text-2xl font-bold text-white mt-1">8ч 24м</p>
            </div>
            <div className="bg-orange-600 bg-opacity-20 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Calendar className="w-3 h-3 text-gray-400 mr-1" />
            <span className="text-gray-400">Днес</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-emerald-400" />
              Продажби по часове (днес)
            </h3>
          </div>
          <div className="p-6">
            <HourlyChart data={stats.hourlyStats} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-blue-400" />
              Методи на плащане
            </h3>
          </div>
          <div className="p-6">
            <PaymentMethodChart data={stats.paymentMethodStats} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-emerald-400" />
              Последни поръчки
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Няма поръчки за показване</p>
                </div>
              ) : (
                recentTransactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">
                          Поръчка #{transaction.id.slice(-6)}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {formatCurrency(transaction.total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{formatDate(transaction.timestamp)}</span>
                        <span>{getPaymentMethodName(transaction.paymentMethod)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {transaction.items.length} артикула
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-400" />
              Топ продукти
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Няма данни за продукти</p>
                </div>
              ) : (
                stats.topProducts.map((item, index) => (
                  <div key={item.product.id} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-600 text-white' :
                        index === 1 ? 'bg-gray-500 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-600 text-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{item.product.name}</span>
                        <span className="text-emerald-400 font-bold">
                          {formatCurrency(item.revenue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{item.product.category}</span>
                        <span>{item.quantity} продадени</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Modal */}
      <ReportsModal
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        transactions={transactions}
      />
    </div>
  );
};