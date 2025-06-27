import React from 'react';
import { BarChart3 } from 'lucide-react';

interface HourlyChartProps {
  data: Array<{
    hour: number;
    transactions: number;
    revenue: number;
  }>;
}

export const HourlyChart: React.FC<HourlyChartProps> = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxTransactions = Math.max(...data.map(d => d.transactions));

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getBarHeight = (value: number, max: number) => {
    if (max === 0) return 0;
    return Math.max((value / max) * 100, 2);
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500 rounded"></div>
          <span className="text-gray-300">Оборот (лв)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-300">Поръчки</span>
        </div>
      </div>

      {/* Chart - with narrower bars and better spacing */}
      <div className="relative h-48 bg-gray-700 rounded-lg p-4">
        <div className="flex items-end justify-between h-full space-x-0.5">
          {data.map((item, index) => {
            const revenueHeight = getBarHeight(item.revenue, maxRevenue);
            const transactionHeight = getBarHeight(item.transactions, maxTransactions);
            
            return (
              <div key={index} className="flex flex-col items-center space-y-1 group" style={{ width: '3.5%' }}>
                <div className="relative flex items-end space-x-0.5 h-32 w-full justify-center">
                  {/* Revenue Bar - narrower */}
                  <div
                    className="bg-emerald-500 rounded-t transition-all duration-300 group-hover:bg-emerald-400"
                    style={{ 
                      height: `${revenueHeight}%`,
                      width: '6px'
                    }}
                    title={`${item.revenue.toFixed(2)} лв`}
                  />
                  {/* Transactions Bar - narrower */}
                  <div
                    className="bg-blue-500 rounded-t transition-all duration-300 group-hover:bg-blue-400"
                    style={{ 
                      height: `${transactionHeight}%`,
                      width: '6px'
                    }}
                    title={`${item.transactions} поръчки`}
                  />
                </div>
                
                {/* Hour Label - smaller and rotated */}
                <span className="text-xs text-gray-400 transform -rotate-45 origin-center whitespace-nowrap" style={{ fontSize: '10px' }}>
                  {formatHour(item.hour)}
                </span>
                
                {/* Tooltip on Hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 transition-opacity">
                  <div>{formatHour(item.hour)}</div>
                  <div>{item.revenue.toFixed(2)} лв</div>
                  <div>{item.transactions} поръчки</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-400">Най-активен час</div>
          <div className="text-white font-bold">
            {(() => {
              const mostActive = data.reduce((max, current) => 
                current.transactions > max.transactions ? current : max
              );
              return formatHour(mostActive.hour);
            })()}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-400">Най-печеливш час</div>
          <div className="text-white font-bold">
            {(() => {
              const mostProfitable = data.reduce((max, current) => 
                current.revenue > max.revenue ? current : max
              );
              return formatHour(mostProfitable.hour);
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};