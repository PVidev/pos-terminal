import React, { useState } from 'react';
import { ProductGrid } from './ProductGrid';
import { Cart } from './Cart';
import { PaymentPanel } from './PaymentPanel';
import { Product, CartItem, Transaction } from '../types';

interface POSTerminalProps {
  products: Product[];
  cartItems: CartItem[];
  cartTotal: number;
  stockWarning?: string | null;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onPaymentComplete: (transaction: Transaction) => void;
  onClearStockWarning: () => void;
  operatorName?: string;
}

export const POSTerminal: React.FC<POSTerminalProps> = ({
  products,
  cartItems,
  cartTotal,
  stockWarning,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPaymentComplete,
  onClearStockWarning,
  operatorName
}) => {
  return (
    <div className="flex flex-1 h-full overflow-hidden flex-col lg:flex-row">
      {/* Stock Warning Banner */}
      {stockWarning && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center space-x-3 animate-bounce border-2 border-red-400">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium text-lg">{stockWarning}</span>
          <button
            onClick={onClearStockWarning}
            className="ml-4 text-white hover:text-gray-200 font-bold text-xl p-1 rounded-full hover:bg-red-500 transition-colors"
          >
            ✕
          </button>
        </div>
      )}
      {/* Products section - scrollable */}
      <div className="flex-1 overflow-y-auto lg:flex-1">
        {/* Оператор */}
        {operatorName && (
          <div className="w-full bg-gray-800 text-emerald-400 text-left py-1 px-4 text-sm font-medium border-b border-gray-700 mb-2 rounded-t-xl shadow-sm">
            <span className="opacity-80">Оператор:</span> <span className="font-semibold">{operatorName}</span>
          </div>
        )}
        <ProductGrid 
          products={products} 
          onAddToCart={onAddToCart} 
        />
      </div>
      
      {/* Cart and Payment - fixed/static */}
      <div className="flex flex-shrink-0 flex-col lg:flex-row">
        <Cart
          items={cartItems}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClearCart={onClearCart}
        />
        
        <PaymentPanel
          items={cartItems}
          total={cartTotal}
          onPaymentComplete={onPaymentComplete}
          onClearCart={onClearCart}
        />
      </div>
    </div>
  );
};