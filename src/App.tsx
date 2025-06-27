import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { POSTerminal } from './components/POSTerminal';
import { Dashboard } from './components/Dashboard';
import { ProductManagement } from './components/ProductManagement';
import { useCart } from './hooks/useCart';
import { useTime } from './hooks/useTime';
import { useDashboard } from './hooks/useDashboard';
import { useProducts } from './hooks/useProducts';
import { useCategories } from './hooks/useCategories';
import { Transaction } from './types';

function App() {
  const [activeView, setActiveView] = useState<'pos' | 'dashboard' | 'settings'>('pos');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const {
    items,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    total,
    itemCount
  } = useCart();
  
  const currentTime = useTime();
  const dashboardStats = useDashboard(transactions);
  
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct
  } = useProducts();
  
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory
  } = useCategories();

  const handlePaymentComplete = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'pos':
        return (
          <POSTerminal
            products={products}
            cartItems={items}
            cartTotal={total}
            onAddToCart={addToCart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onClearCart={clearCart}
            onPaymentComplete={handlePaymentComplete}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            transactions={transactions}
            stats={dashboardStats}
          />
        );
      case 'settings':
        return (
          <ProductManagement
            products={products}
            categories={categories}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navigation
        activeView={activeView}
        onViewChange={setActiveView}
        cartItemsCount={itemCount}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;