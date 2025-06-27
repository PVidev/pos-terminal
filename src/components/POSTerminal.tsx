import React, { useState } from 'react';
import { ProductGrid } from './ProductGrid';
import { Cart } from './Cart';
import { PaymentPanel } from './PaymentPanel';
import RecipeSelector from './RecipeSelector';
import { Product, CartItem, Transaction, Recipe } from '../types';
import { ChefHat } from 'lucide-react';

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
  onAddRecipeToKitchen?: (recipe: Recipe, quantity: number, tableNumber?: string, notes?: string) => void;
  onAddRecipeToCart?: (recipe: Recipe, quantity: number) => void;
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
  onAddRecipeToKitchen,
  onAddRecipeToCart
}) => {
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);

  const handleAddRecipeToKitchen = (recipe: Recipe, quantity: number, tableNumber?: string, notes?: string) => {
    if (onAddRecipeToKitchen) {
      onAddRecipeToKitchen(recipe, quantity, tableNumber, notes);
    }
  };

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
        {/* Recipe Button */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <button
            onClick={() => setShowRecipeSelector(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
          >
            <ChefHat className="w-5 h-5" />
            <span className="font-medium">Рецепти</span>
          </button>
        </div>
        
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

      {/* Recipe Selector Modal */}
      {showRecipeSelector && (
        <RecipeSelector
          onClose={() => setShowRecipeSelector(false)}
          onAddToKitchen={handleAddRecipeToKitchen}
          onAddToCart={onAddRecipeToCart}
          cartItems={cartItems}
        />
      )}
    </div>
  );
};