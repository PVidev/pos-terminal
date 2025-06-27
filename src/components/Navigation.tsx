import React from 'react';
import { ShoppingCart, BarChart3, Settings, User, Package, FileText, History, TrendingUp, Zap, ChefHat } from 'lucide-react';

interface NavigationProps {
  activeView: 'pos' | 'dashboard' | 'settings' | 'inventory' | 'orders' | 'revision-history' | 'analytics' | 'automatic-actions' | 'kitchen';
  onViewChange: (view: 'pos' | 'dashboard' | 'settings' | 'inventory' | 'orders' | 'revision-history' | 'analytics' | 'automatic-actions' | 'kitchen') => void;
  cartItemsCount: number;
  newOrdersCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeView, 
  onViewChange, 
  cartItemsCount,
  newOrdersCount
}) => {
  const menuItems = [
    { id: 'pos' as const, name: 'POS', icon: ShoppingCart },
    { id: 'dashboard' as const, name: 'Дашборд', icon: BarChart3 },
    { id: 'inventory' as const, name: 'Наличност', icon: Package },
    { id: 'orders' as const, name: 'Поръчки', icon: FileText, hasNotification: newOrdersCount > 0 },
    { id: 'kitchen' as const, name: 'Кухня', icon: ChefHat },
    { id: 'revision-history' as const, name: 'История', icon: History },
    { id: 'analytics' as const, name: 'Анализи', icon: TrendingUp },
    { id: 'automatic-actions' as const, name: 'Автоматика', icon: Zap },
    { id: 'settings' as const, name: 'ПиК', icon: Settings }
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 p-3 rounded-lg">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">POS Система</h1>
                <p className="text-gray-400 text-sm">Модерен терминал</p>
              </div>
            </div>
            
            <div className="flex space-x-2 overflow-x-auto">
              {menuItems.map(item => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-200 min-h-[48px] whitespace-nowrap relative ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } ${item.hasNotification ? 'animate-pulse-red' : ''}`}
                  >
                    <div className="relative">
                      <IconComponent className="w-5 h-5" />
                      {item.id === 'pos' && cartItemsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {cartItemsCount}
                        </span>
                      )}
                      {item.id === 'orders' && newOrdersCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                          {newOrdersCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-base">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-3 hover:bg-gray-800 rounded-lg transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center">
              <User className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};