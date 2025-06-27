import React from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const Cart: React.FC<CartProps> = ({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart 
}) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (items.length === 0) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Количка</h2>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <ShoppingBag className="w-16 h-16 mb-4" />
          <p className="text-center">Количката е празна</p>
          <p className="text-sm text-center mt-2">Добавете продукти за започване</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Количка</h2>
        <button
          onClick={onClearCart}
          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-600 hover:bg-opacity-20 transition-all duration-200 active:scale-95"
          title="Изчисти количката"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-6">
        {items.map(item => (
          <div key={item.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-white text-sm leading-tight flex-1">
                {item.name}
              </h3>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-600 hover:bg-opacity-20 transition-all duration-200 ml-2 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              {/* Touch-optimized quantity controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                  className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg transition-all duration-200 active:scale-95"
                >
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <span className="text-white font-bold text-lg w-8 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg transition-all duration-200 active:scale-95"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
              
              <div className="text-right">
                <div className="text-emerald-400 font-bold text-base">
                  {(item.price * item.quantity).toFixed(2)} лв
                </div>
                <div className="text-gray-400 text-xs">
                  {item.price.toFixed(2)} лв/бр
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold text-white">Общо:</span>
          <span className="text-3xl font-bold text-emerald-400">
            {total.toFixed(2)} лв
          </span>
        </div>
        
        <div className="text-sm text-gray-400 mb-4">
          {items.length} артикула • {items.reduce((sum, item) => sum + item.quantity, 0)} бройки
        </div>
      </div>
    </div>
  );
};