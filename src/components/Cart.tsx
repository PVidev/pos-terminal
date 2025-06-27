import React from 'react';
import { Minus, Plus, Trash2, ShoppingBag, Package } from 'lucide-react';
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
      <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Количка</h2>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <div className="relative mb-6">
            <ShoppingBag className="w-20 h-20 text-gray-600" />
            <Package className="w-8 h-8 text-gray-500 absolute -bottom-2 -right-2" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">Количката е празна</h3>
          <p className="text-center text-sm leading-relaxed">
            Добавете продукти от панела вляво<br />
            за да стартирате поръчка
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Количка</h2>
        <button
          onClick={onClearCart}
          className="text-red-400 hover:text-red-300 p-3 rounded-lg hover:bg-red-600 hover:bg-opacity-20 transition-all duration-200 active:scale-95 min-w-[48px] min-h-[48px] flex items-center justify-center"
          title="Изчисти количката"
        >
          <Trash2 className="w-6 h-6" />
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
                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-600 hover:bg-opacity-20 transition-all duration-200 ml-2 active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              {/* Touch-optimized quantity controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                  className="bg-gray-600 hover:bg-gray-500 p-3 rounded-lg transition-all duration-200 active:scale-95 min-w-[48px] min-h-[48px] flex items-center justify-center"
                >
                  <Minus className="w-5 h-5 text-white" />
                </button>
                <span className="text-white font-bold text-lg w-12 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="bg-gray-600 hover:bg-gray-500 p-3 rounded-lg transition-all duration-200 active:scale-95 min-w-[48px] min-h-[48px] flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 text-white" />
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