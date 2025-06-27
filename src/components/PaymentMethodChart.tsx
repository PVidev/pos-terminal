import React from 'react';
import { CreditCard, Banknote, Smartphone } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentMethodChartProps {
  data: Array<{
    method: PaymentMethod;
    count: number;
    revenue: number;
  }>;
}

export const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ data }) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  const getMethodInfo = (method: PaymentMethod) => {
    const methods = {
      cash: { name: 'В брой', icon: Banknote, color: 'emerald' },
      card: { name: 'Карта', icon: CreditCard, color: 'blue' },
      digital: { name: 'Дигитално', icon: Smartphone, color: 'purple' }
    };
    return methods[method];
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  return (
    <div className="space-y-4">
      {/* Donut Chart Simulation */}
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#374151"
              strokeWidth="8"
            />
            {(() => {
              let offset = 0;
              return data.map((item, index) => {
                const percentage = getPercentage(item.revenue, totalRevenue);
                const strokeDasharray = `${percentage * 2.51} 251`;
                const strokeDashoffset = -offset * 2.51;
                const methodInfo = getMethodInfo(item.method);
                
                const colors = {
                  emerald: '#10b981',
                  blue: '#3b82f6',
                  purple: '#8b5cf6'
                };
                
                offset += percentage;
                
                return (
                  <circle
                    key={item.method}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={colors[methodInfo.color as keyof typeof colors]}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                );
              });
            })()}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{totalCount}</div>
              <div className="text-xs text-gray-400">поръчки</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend and Stats */}
      <div className="space-y-3">
        {data.map(item => {
          const methodInfo = getMethodInfo(item.method);
          const IconComponent = methodInfo.icon;
          const revenuePercentage = getPercentage(item.revenue, totalRevenue);
          const countPercentage = getPercentage(item.count, totalCount);
          
          const colorClasses = {
            emerald: 'text-emerald-400 bg-emerald-600',
            blue: 'text-blue-400 bg-blue-600',
            purple: 'text-purple-400 bg-purple-600'
          };
          
          return (
            <div key={item.method} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-opacity-20 ${colorClasses[methodInfo.color as keyof typeof colorClasses].split(' ')[1]}`}>
                  <IconComponent className={`w-4 h-4 ${colorClasses[methodInfo.color as keyof typeof colorClasses].split(' ')[0]}`} />
                </div>
                <div>
                  <div className="text-white font-medium">{methodInfo.name}</div>
                  <div className="text-gray-400 text-sm">
                    {item.count} поръчки ({countPercentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">
                  {item.revenue.toFixed(2)} лв
                </div>
                <div className="text-gray-400 text-sm">
                  {revenuePercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-700 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Общо оборот:</span>
          <span className="text-white font-bold">{totalRevenue.toFixed(2)} лв</span>
        </div>
      </div>
    </div>
  );
};