import React from 'react';
import { ShoppingCart, Clock, User, Settings } from 'lucide-react';

interface HeaderProps {
  cartItemsCount: number;
  currentTime: string;
}

export const Header: React.FC<HeaderProps> = ({ cartItemsCount, currentTime }) => {
  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">POS Терминал</h1>
            <p className="text-gray-400 text-sm">Система за продажби</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{currentTime}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-300">
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <span className="text-sm">{cartItemsCount} артикула</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <User className="w-5 h-5 text-gray-300" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};