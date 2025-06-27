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
import Kitchen from './components/Kitchen';
import { useCart } from './hooks/useCart';
import { useTime } from './hooks/useTime';
import { useDashboard } from './hooks/useDashboard';
import { useProducts } from './hooks/useProducts';
import { useCategories } from './hooks/useCategories';
import { useInventoryOrders } from './hooks/useInventoryOrders';
import { useInventoryRevisions } from './hooks/useInventoryRevisions';
import { useRecipes } from './hooks/useRecipes';
import { useKitchenOrders } from './hooks/useKitchenOrders';
import { Transaction, InventoryOrder, InventoryRevision, RevisionDifference } from './types';

function App() {
  const [activeView, setActiveView] = useState<'pos' | 'dashboard' | 'settings' | 'inventory' | 'orders' | 'revision-history' | 'analytics' | 'automatic-actions' | 'kitchen'>('pos');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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

  // Кухненски hooks
  const {
    recipes,
    ingredients,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    decreaseIngredientStock,
    getRecipeById,
    getIngredientById,
    getRecipesByCategory,
    getActiveRecipes
  } = useRecipes();

  const {
    orders: kitchenOrders,
    completedOrders: kitchenCompletedOrders,
    addOrder: addKitchenOrder,
    updateOrderStatus: updateKitchenOrderStatus,
    moveToCompleted,
    getPendingOrders,
    getPreparingOrders,
    getReadyOrders,
    getCompletedOrders,
    getKitchenStats
  } = useKitchenOrders();

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
    setTransactions(prev => [transaction, ...prev]);
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

  const handleAddRecipeToKitchen = (recipe: Recipe, quantity: number, tableNumber?: string, notes?: string) => {
    // Добавяме поръчка в кухнята
    addKitchenOrder({
      recipeId: recipe.id,
      recipeName: recipe.name,
      quantity,
      priority: 'normal',
      tableNumber,
      notes,
      estimatedTime: recipe.preparationTime
    });

    // Намаляваме склада на основните ингредиенти
    recipe.ingredients.forEach(ingredient => {
      if (ingredient.type === 'main') {
        const totalQuantity = ingredient.quantity * quantity;
        decreaseIngredientStock(ingredient.ingredientId, totalQuantity);
      }
      // Подправките не се намаляват от склада
    });

    console.log(`Добавена поръчка в кухнята: ${recipe.name} x${quantity}`);
  };

  const handleAddRecipeToCart = (recipe: Recipe, quantity: number) => {
    // Създаваме продукт от рецептата за добавяне в количката
    const recipeProduct = {
      id: recipe.id,
      name: recipe.name,
      price: recipe.price,
      category: recipe.category,
      stock: 999 // Безлимитен склад за рецепти
    };

    // Добавяме в количката
    for (let i = 0; i < quantity; i++) {
      addToCart(recipeProduct);
    }

    console.log(`Добавена рецепта в количката: ${recipe.name} x${quantity}`);
  };

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
            onAddRecipeToKitchen={handleAddRecipeToKitchen}
            onAddRecipeToCart={handleAddRecipeToCart}
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
      case 'kitchen':
        return (
          <Kitchen 
            recipes={recipes}
            ingredients={ingredients}
            orders={kitchenOrders}
            completedOrders={kitchenCompletedOrders}
            onAddOrder={addKitchenOrder}
            onUpdateOrderStatus={updateKitchenOrderStatus}
            onMoveToCompleted={moveToCompleted}
            onDecreaseIngredientStock={decreaseIngredientStock}
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
      />
      
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;