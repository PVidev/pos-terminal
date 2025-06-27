import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package, 
  Calendar,
  Filter,
  Download,
  PieChart,
  Activity
} from 'lucide-react';
import { InventoryRevision, RevisionDifference } from '../types';

interface RevisionAnalyticsProps {
  revisions: InventoryRevision[];
  differences: RevisionDifference[];
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }>;
}

export const RevisionAnalytics: React.FC<RevisionAnalyticsProps> = ({
  revisions,
  differences
}) => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Филтриране на данните според избрания период
  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredRevisions = revisions.filter(rev => 
      new Date(rev.timestamp) >= startDate
    );

    const filteredDifferences = differences.filter(diff => {
      const revision = revisions.find(rev => rev.id === diff.revisionId);
      return revision && new Date(revision.timestamp) >= startDate;
    });

    return { revisions: filteredRevisions, differences: filteredDifferences };
  }, [revisions, differences, timeRange]);

  // Статистики за тенденции
  const trendStats = useMemo(() => {
    if (filteredData.revisions.length === 0) return null;

    const totalRevisions = filteredData.revisions.length;
    const totalDifferences = filteredData.differences.length;
    const totalProductsWithDifferences = new Set(filteredData.differences.map(d => d.productId)).size;

    // Средни стойности на ден
    const daysDiff = Math.max(1, Math.ceil((Date.now() - new Date(filteredData.revisions[filteredData.revisions.length - 1]?.timestamp || Date.now()).getTime()) / (1000 * 60 * 60 * 24)));
    
    const avgRevisionsPerDay = totalRevisions / daysDiff;
    const avgDifferencesPerDay = totalDifferences / daysDiff;

    // Тенденция на разликите
    const recentDifferences = filteredData.differences.slice(0, Math.floor(filteredData.differences.length * 0.3));
    const olderDifferences = filteredData.differences.slice(Math.floor(filteredData.differences.length * 0.7));
    
    const recentAvg = recentDifferences.length > 0 ? recentDifferences.length / Math.max(1, recentDifferences.length) : 0;
    const olderAvg = olderDifferences.length > 0 ? olderDifferences.length / Math.max(1, olderDifferences.length) : 0;
    
    const trend = recentAvg > olderAvg ? 'increasing' : recentAvg < olderAvg ? 'decreasing' : 'stable';

    return {
      totalRevisions,
      totalDifferences,
      totalProductsWithDifferences,
      avgRevisionsPerDay: avgRevisionsPerDay.toFixed(1),
      avgDifferencesPerDay: avgDifferencesPerDay.toFixed(1),
      trend,
      daysDiff
    };
  }, [filteredData]);

  // Най-проблемни продукти
  const topProblematicProducts = useMemo(() => {
    const productStats = filteredData.differences.reduce((acc, diff) => {
      if (!acc[diff.productId]) {
        acc[diff.productId] = {
          productId: diff.productId,
          productName: diff.productName,
          category: diff.category,
          count: 0,
          totalDifference: 0,
          avgDifference: 0
        };
      }
      acc[diff.productId].count++;
      acc[diff.productId].totalDifference += Math.abs(diff.difference);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productStats)
      .map(product => ({
        ...product,
        avgDifference: product.totalDifference / product.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredData.differences]);

  // Разлики по категории
  const differencesByCategory = useMemo(() => {
    const categoryStats = filteredData.differences.reduce((acc, diff) => {
      acc[diff.category] = (acc[diff.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryStats)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData.differences]);

  // Разлики по действия
  const differencesByAction = useMemo(() => {
    const actionStats = filteredData.differences.reduce((acc, diff) => {
      const action = diff.action || 'none';
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(actionStats)
      .map(([action, count]) => ({ 
        action, 
        count,
        label: action === 'investigation' ? 'Разследване' :
               action === 'order' ? 'Поръчка' :
               action === 'adjustment' ? 'Коригиране' : 'Без действие'
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData.differences]);

  // Месечна тенденция
  const monthlyTrend = useMemo(() => {
    const monthlyData = filteredData.revisions.reduce((acc, revision) => {
      const month = new Date(revision.timestamp).toLocaleDateString('bg-BG', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = {
          revisions: 0,
          differences: 0,
          productsWithDifferences: 0
        };
      }
      acc[month].revisions++;
      acc[month].productsWithDifferences += revision.summary.productsWithDifferences;
      
      const revisionDifferences = filteredData.differences.filter(d => d.revisionId === revision.id);
      acc[month].differences += revisionDifferences.length;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [filteredData]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-400" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-green-400" />;
      default:
        return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-400';
      case 'decreasing':
        return 'text-green-400';
      default:
        return 'text-blue-400';
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'Разликите се увеличават';
      case 'decreasing':
        return 'Разликите намаляват';
      default:
        return 'Разликите са стабилни';
    }
  };

  if (!trendStats) {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Няма данни за анализ</p>
            <p className="text-gray-500 text-sm">Извършете първата ревизия за да видите анализи</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Анализ на тенденциите</h1>
          <p className="text-gray-400">Анализ на разликите в склада и тенденциите им</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Период
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="7days">Последните 7 дни</option>
                <option value="30days">Последните 30 дни</option>
                <option value="90days">Последните 90 дни</option>
                <option value="all">Всички</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Категория
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">Всички категории</option>
                {differencesByCategory.map(({ category }) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Общо ревизии</p>
                <p className="text-2xl font-bold text-white">{trendStats.totalRevisions}</p>
                <p className="text-gray-500 text-sm">{trendStats.avgRevisionsPerDay} на ден</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Общо разлики</p>
                <p className="text-2xl font-bold text-white">{trendStats.totalDifferences}</p>
                <p className="text-gray-500 text-sm">{trendStats.avgDifferencesPerDay} на ден</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Продукти с разлики</p>
                <p className="text-2xl font-bold text-white">{trendStats.totalProductsWithDifferences}</p>
                <p className="text-gray-500 text-sm">уникални продукти</p>
              </div>
              <Package className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Тенденция</p>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trendStats.trend)}
                  <p className={`text-lg font-bold ${getTrendColor(trendStats.trend)}`}>
                    {getTrendText(trendStats.trend)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Problematic Products */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Най-проблемни продукти</h3>
            <div className="space-y-3">
              {topProblematicProducts.slice(0, 5).map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-red-500' :
                      index === 1 ? 'bg-orange-500' :
                      index === 2 ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{product.productName}</p>
                      <p className="text-gray-400 text-sm">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{product.count}</p>
                    <p className="text-gray-400 text-sm">разлики</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Differences by Category */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Разлики по категории</h3>
            <div className="space-y-3">
              {differencesByCategory.slice(0, 5).map(({ category, count }, index) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">{category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{count}</p>
                    <p className="text-gray-400 text-sm">разлики</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Месечна тенденция</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Месец</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-300">Ревизии</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-300">Разлики</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-300">Продукти с разлики</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-300">Средно разлики/ревизия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {monthlyTrend.map(({ month, revisions, differences, productsWithDifferences }) => (
                  <tr key={month} className="hover:bg-gray-750 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{month}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-300">{revisions}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-orange-400 font-bold">{differences}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-red-400 font-bold">{productsWithDifferences}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-300">
                        {revisions > 0 ? (differences / revisions).toFixed(1) : '0'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Разпределение на действията</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {differencesByAction.map(({ action, count, label }) => (
              <div key={action} className="bg-gray-700 rounded-lg p-4 text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  action === 'investigation' ? 'bg-yellow-500' :
                  action === 'order' ? 'bg-blue-500' :
                  action === 'adjustment' ? 'bg-emerald-500' : 'bg-gray-500'
                }`}>
                  {action === 'investigation' ? <AlertTriangle className="w-6 h-6 text-white" /> :
                   action === 'order' ? <TrendingUp className="w-6 h-6 text-white" /> :
                   action === 'adjustment' ? <Package className="w-6 h-6 text-white" /> :
                   <BarChart3 className="w-6 h-6 text-white" />}
                </div>
                <p className="text-white font-bold text-lg">{count}</p>
                <p className="text-gray-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 