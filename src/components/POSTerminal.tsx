import React from 'react';
import { ProductGrid } from './ProductGrid';
import { Cart } from './Cart';
import { PaymentPanel } from './PaymentPanel';
import { Product, CartItem, Transaction } from '../types';

interface POSTerminalProps {
  products: Product[];
  cartItems: CartItem[];
  cartTotal: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onPaymentComplete: (transaction: Transaction) => void;
}

export const POSTerminal: React.FC<POSTerminalProps> = ({
  products,
  cartItems,
  cartTotal,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPaymentComplete
}) => {
  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Products section - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <ProductGrid 
          products={products} 
          onAddToCart={onAddToCart} 
        />
      </div>
      
      {/* Cart and Payment - fixed/static */}
      <div className="flex flex-shrink-0">
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