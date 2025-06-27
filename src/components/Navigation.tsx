import React from 'react';
import { ShoppingCart, BarChart3, Settings, User } from 'lucide-react';

interface NavigationProps {
  activeView: 'pos' | 'dashboard' | 'settings';
  onViewChange: (view: 'pos' | 'dashboard' | 'settings') => void;
  cartItemsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeView, 
  onViewChange, 
  cartItemsCount 
}) => {
  const menuItems = [
    { id: 'pos' as const, name: 'POS', icon: ShoppingCart },
    { id: 'dashboard' as const, name: 'Дашборд', icon: BarChart3 },
    { id: 'settings' as const, name: 'Настройки', icon: Settings }
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">POS Система</h1>
                <p className="text-gray-400 text-sm">Модерен терминал</p>
              </div>
            </div>
            
            <div className="flex space-x-1">
              {menuItems.map(item => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="relative">
                      <IconComponent className="w-4 h-4" />
                      {item.id === 'pos' && cartItemsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {cartItemsCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <User className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};