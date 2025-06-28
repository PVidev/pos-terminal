import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { POSTerminal } from './components/POSTerminal';
import { Dashboard } from './components/Dashboard';
import { ProductManagement } from './components/ProductManagement';
import { InventoryManagement } from './components/InventoryManagement';
import { OrderManagement } from './components/OrderManagement';
import { RevisionHistory } from './components/RevisionHistory';
import { RevisionAnalytics } from './components/RevisionAnalytics';
import { AutomaticActions } from './components/AutomaticActions';
import { useCart } from './hooks/useCart';
import { useTime } from './hooks/useTime';
import { useDashboard } from './hooks/useDashboard';
import { useProducts } from './hooks/useProducts';
import { useCategories } from './hooks/useCategories';
import { useInventoryOrders } from './hooks/useInventoryOrders';
import { useInventoryRevisions } from './hooks/useInventoryRevisions';
import { Transaction, InventoryOrder, InventoryRevision, RevisionDifference } from './types';
import { RolesModal, UserProfile } from './components/RolesModal';
import { LoginWithPin } from './components/LoginWithPin';

function App() {
  const [activeView, setActiveView] = useState<'pos' | 'dashboard' | 'settings' | 'inventory' | 'orders' | 'revision-history' | 'analytics' | 'automatic-actions'>('pos');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([
    { id: '1', role: 'Касиер', name: 'Александра Иванова', phone: '0888 888 888', pin: '1234' },
    { id: '2', role: 'Касиер', name: 'Иван Иванов', phone: '0898 686 868', pin: '2121' },
    { id: '3', role: 'Мениджър обект', name: 'Нарцис Иванова', phone: '0878 655 878', pin: '0000' },
    { id: '4', role: 'Админ', name: 'ТЕСТ 1', phone: '0888 888 777', pin: '0202' },
    { id: '5', role: 'Куриер', name: 'Петко Петков', phone: '0777 878 777', pin: '4545' },
  ]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const {
    items,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    clearStockWarning,
    total,
    itemCount,
    stockWarning
  } = useCart();
  
  const currentTime = useTime();
  const dashboardStats = useDashboard(transactions);
  
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    decreaseStock,
    increaseStock
  } = useProducts();
  
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory
  } = useCategories();

  const {
    orders,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    getOrdersByStatus
  } = useInventoryOrders();

  // Брой нови поръчки (чакащи и поръчани)
  const newOrdersCount = orders.filter(order => 
    order.status === 'pending' || order.status === 'ordered'
  ).length;

  const {
    revisions,
    differences,
    addRevision,
    getRevisionsByDateRange,
    getDifferencesByProduct,
    getDifferencesByRevision,
    updateDifferenceAction,
    getRevisionStats,
    getDifferencesByCategory,
    getDifferencesByAction
  } = useInventoryRevisions();

  const handleAddToCart = (product: any) => {
    // Проверяваме дали склада е изчерпан (0)
    if (product.stock === 0) {
      // Предупреждението ще се покаже от useCart hook-а
      addToCart(product);
      return;
    }
    
    // Добавяме в количката и намаляваме склада
    addToCart(product);
    decreaseStock(product.id, 1);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    const currentItem = items.find(item => item.id === id);
    if (currentItem) {
      const quantityDifference = quantity - currentItem.quantity;
      
      // Проверяваме дали склада е изчерпан
      if (currentItem.stock === 0 && quantity > 0) {
        // Предупреждението ще се покаже от useCart hook-а
        updateQuantity(id, quantity);
        return;
      }
      
      if (quantityDifference > 0) {
        // Увеличаваме количеството - намаляваме склада
        decreaseStock(id, quantityDifference);
      } else if (quantityDifference < 0) {
        // Намаляваме количеството - увеличаваме склада
        increaseStock(id, Math.abs(quantityDifference));
      }
    }
    updateQuantity(id, quantity);
  };

  const handleRemoveItem = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      // Връщаме количеството обратно в склада
      increaseStock(id, item.quantity);
    }
    removeItem(id);
  };

  const handleClearCart = () => {
    // Връщаме всички количества обратно в склада
    items.forEach(item => {
      increaseStock(item.id, item.quantity);
    });
    clearCart();
  };

  const handlePaymentComplete = (transaction: Transaction) => {
    setTransactions(prev => [{ ...transaction, operatorName: currentUser?.name || '' }, ...prev]);
  };

  const handleUpdateStock = (id: string, newStock: number) => {
    updateProduct(id, { stock: newStock });
  };

  const handleCreateOrder = (order: Omit<InventoryOrder, 'id' | 'timestamp'>) => {
    addOrder(order);
  };

  const handleUpdateOrderStatus = (id: string, status: InventoryOrder['status'], cancellationReason?: string) => {
    updateOrderStatus(id, status, cancellationReason);
  };

  const handleDeleteOrder = (id: string) => {
    deleteOrder(id);
  };

  const handleCreateRevision = (revision: Omit<InventoryRevision, 'id' | 'timestamp'>) => {
    addRevision(revision);
  };

  const handleUpdateDifferenceAction = (differenceId: string, action: RevisionDifference['action'], reason?: string) => {
    updateDifferenceAction(differenceId, action, reason);
  };

  const handleAddProfile = (profile: Omit<UserProfile, 'id'>) => {
    setProfiles(prev => [
      { ...profile, id: Date.now().toString() },
      ...prev
    ]);
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
  };

  // Филтриране на менюто според роля
  const getAllowedViews = () => {
    if (!currentUser) return [];
    switch (currentUser.role) {
      case 'Касиер':
        return ['pos'];
      case 'Мениджър обект':
        return ['pos', 'inventory', 'orders', 'revision-history', 'settings', 'dashboard'];
      case 'Куриер':
        return ['orders'];
      case 'Админ':
        return ['pos', 'dashboard', 'settings', 'inventory', 'orders', 'revision-history', 'analytics', 'automatic-actions'];
      default:
        return [];
    }
  };

  // Ако няма логнат потребител, показваме логин
  if (!currentUser) {
    return <LoginWithPin profiles={profiles} onLogin={setCurrentUser} />;
  }

  // Ако потребителят няма достъп до текущата страница, пренасочваме към първата достъпна
  const allowedViews = getAllowedViews();
  if (!allowedViews.includes(activeView)) {
    setActiveView(allowedViews[0]);
    return null;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'pos':
        return (
          <POSTerminal
            products={products}
            cartItems={items}
            cartTotal={total}
            stockWarning={stockWarning}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onPaymentComplete={handlePaymentComplete}
            onClearStockWarning={clearStockWarning}
            operatorName={currentUser?.name || ''}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            transactions={transactions}
            stats={dashboardStats}
          />
        );
      case 'inventory':
        return (
          <InventoryManagement
            products={products}
            onUpdateStock={handleUpdateStock}
            onCreateOrder={handleCreateOrder}
            onCreateRevision={handleCreateRevision}
          />
        );
      case 'orders':
        return (
          <OrderManagement
            orders={orders}
            products={products}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onUpdateProductStock={(id, newStock) => updateProduct(id, { stock: newStock })}
          />
        );
      case 'revision-history':
        return (
          <RevisionHistory
            revisions={revisions}
            differences={differences}
            onViewRevision={() => {}}
            onUpdateDifferenceAction={handleUpdateDifferenceAction}
          />
        );
      case 'analytics':
        return (
          <RevisionAnalytics
            revisions={revisions}
            differences={differences}
          />
        );
      case 'automatic-actions':
        return (
          <AutomaticActions
            differences={differences}
            onUpdateDifferenceAction={handleUpdateDifferenceAction}
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
        newOrdersCount={newOrdersCount}
        onOpenRolesModal={() => setRolesModalOpen(true)}
        allowedViews={allowedViews}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
      />
      {rolesModalOpen && (
        <RolesModal
          open={rolesModalOpen}
          onClose={() => setRolesModalOpen(false)}
          profiles={profiles}
          onAddProfile={handleAddProfile}
          onDeleteProfile={handleDeleteProfile}
        />
      )}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;