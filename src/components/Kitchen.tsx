import React, { useState } from 'react';
import { Recipe, KitchenOrder, Ingredient } from '../types';
import { Clock, ChefHat, CheckCircle, AlertCircle, Timer, Users, MapPin } from 'lucide-react';

interface KitchenProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  orders: KitchenOrder[];
  completedOrders: KitchenOrder[];
  onAddOrder: (order: Omit<KitchenOrder, 'id' | 'timestamp'>) => void;
  onUpdateOrderStatus: (orderId: string, status: KitchenOrder['status'], notes?: string) => void;
  onMoveToCompleted: (orderId: string) => void;
  onDecreaseIngredientStock: (id: string, quantity: number) => void;
}

const Kitchen: React.FC<KitchenProps> = ({
  recipes,
  ingredients,
  orders,
  completedOrders,
  onAddOrder,
  onUpdateOrderStatus,
  onMoveToCompleted,
  onDecreaseIngredientStock
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'recipes' | 'ingredients' | 'history'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);

  // Функции за филтриране на поръчките
  const getPendingOrders = () => {
    return orders.filter(order => order.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return a.timestamp.getTime() - b.timestamp.getTime();
      });
  };

  const getPreparingOrders = () => {
    return orders.filter(order => order.status === 'preparing')
      .sort((a, b) => {
        if (!a.startedAt || !b.startedAt) return 0;
        return a.startedAt.getTime() - b.startedAt.getTime();
      });
  };

  const getReadyOrders = () => {
    return orders.filter(order => order.status === 'ready')
      .sort((a, b) => {
        if (!a.completedAt || !b.completedAt) return 0;
        return a.completedAt.getTime() - b.completedAt.getTime();
      });
  };

  const getCompletedOrders = () => {
    return completedOrders.sort((a, b) => 
      b.completedAt!.getTime() - a.completedAt!.getTime()
    );
  };

  const getActiveRecipes = () => {
    return recipes.filter(recipe => recipe.isActive);
  };

  const getKitchenStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = getCompletedOrders().filter(order => 
      order.completedAt && 
      order.completedAt >= today && 
      order.completedAt <= tomorrow
    );
    
    return {
      pending: getPendingOrders().length,
      preparing: getPreparingOrders().length,
      ready: getReadyOrders().length,
      completedToday: todayOrders.length,
      averagePreparationTime: todayOrders.length > 0 
        ? todayOrders.reduce((sum, order) => sum + (order.actualTime || 0), 0) / todayOrders.length
        : 0
    };
  };

  const handleStartPreparation = (orderId: string) => {
    onUpdateOrderStatus(orderId, 'preparing');
  };

  const handleMarkReady = (orderId: string) => {
    onUpdateOrderStatus(orderId, 'ready');
  };

  const handleCompleteOrder = (orderId: string) => {
    onMoveToCompleted(orderId);
  };

  const getPriorityColor = (priority: KitchenOrder['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityText = (priority: KitchenOrder['priority']) => {
    switch (priority) {
      case 'urgent': return 'Спешно';
      case 'high': return 'Високо';
      case 'normal': return 'Нормално';
      case 'low': return 'Ниско';
      default: return 'Нормално';
    }
  };

  const getStatusColor = (status: KitchenOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600 text-yellow-100 border-yellow-500';
      case 'preparing': return 'bg-blue-600 text-blue-100 border-blue-500';
      case 'ready': return 'bg-green-600 text-green-100 border-green-500';
      case 'cancelled': return 'bg-red-600 text-red-100 border-red-500';
      default: return 'bg-gray-600 text-gray-100 border-gray-500';
    }
  };

  const getStatusIcon = (status: KitchenOrder['status']) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('bg-BG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}мин`;
  };

  const OrderCard: React.FC<{ order: KitchenOrder }> = ({ order }) => {
    const recipe = recipes.find(r => r.id === order.recipeId);
    const timeSinceOrder = Math.floor((new Date().getTime() - order.timestamp.getTime()) / 60000);
    
    return (
      <div 
        className={`bg-gray-800 rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl cursor-pointer ${
          selectedOrder?.id === order.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-700'
        }`}
        onClick={() => setSelectedOrder(order)}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{order.recipeName}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{order.quantity} порции</span>
                </div>
                {order.tableNumber && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Маса {order.tableNumber}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(order.timestamp)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(order.priority)}`}>
                {getPriorityText(order.priority)}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)} flex items-center space-x-1`}>
                {getStatusIcon(order.status)}
                <span>
                  {order.status === 'pending' ? 'Чакаща' : 
                   order.status === 'preparing' ? 'Прави се' : 
                   order.status === 'ready' ? 'Готово' : 'Отказана'}
                </span>
              </span>
            </div>
          </div>

          {/* Time indicator */}
          {order.status === 'preparing' && order.startedAt && (
            <div className="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">
                    В процес: {formatDuration(timeSinceOrder)}
                  </span>
                </div>
                {order.estimatedTime && (
                  <span className="text-xs text-blue-400">
                    Очаквано: {order.estimatedTime} мин
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {recipe && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center space-x-1">
                <ChefHat className="w-4 h-4" />
                <span>Ингредиенти:</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {recipe.ingredients.slice(0, 6).map((ingredient, index) => (
                  <div key={index} className="flex justify-between bg-gray-700 px-2 py-1 rounded">
                    <span className="text-gray-300">{ingredient.ingredientName}</span>
                    <span className="text-gray-400 font-medium">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  </div>
                ))}
                {recipe.ingredients.length > 6 && (
                  <div className="col-span-2 text-xs text-gray-500 text-center py-1">
                    +{recipe.ingredients.length - 6} още ингредиента
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="mb-4 p-3 bg-yellow-900/30 rounded-lg border border-yellow-700">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-yellow-300">Бележка:</span>
                  <p className="text-sm text-yellow-200 mt-1">{order.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {order.status === 'pending' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartPreparation(order.id);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <ChefHat className="w-4 h-4" />
                <span>Започни</span>
              </button>
            )}
            {order.status === 'preparing' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkReady(order.id);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Готово</span>
              </button>
            )}
            {order.status === 'ready' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteOrder(order.id);
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Издай</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const stats = getKitchenStats();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl shadow-lg">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">🍳 Кухня</h1>
              <p className="text-gray-400">Управление на поръчки и рецепти</p>
            </div>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.pending}</div>
                  <div className="text-yellow-100">Чакащи</div>
                </div>
                <AlertCircle className="w-8 h-8 opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.preparing}</div>
                  <div className="text-blue-100">Правят се</div>
                </div>
                <ChefHat className="w-8 h-8 opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-400 to-green-500 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.ready}</div>
                  <div className="text-green-100">Готови</div>
                </div>
                <CheckCircle className="w-8 h-8 opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.completedToday}</div>
                  <div className="text-purple-100">Днес издадени</div>
                </div>
                <Clock className="w-8 h-8 opacity-80" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-800 p-2 rounded-2xl shadow-lg mb-8 border border-gray-700">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'orders' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              📋 Поръчки
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'recipes' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              📖 Рецепти
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'ingredients' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              🥬 Ингредиенти
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'history' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              📊 История
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'orders' && (
            <div className="space-y-8">
              {/* Pending Orders */}
              {getPendingOrders().length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span>Чакащи поръчки ({getPendingOrders().length})</span>
                  </h2>
                  <div className="grid gap-6">
                    {getPendingOrders().map(order => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                </div>
              )}

              {/* Preparing Orders */}
              {getPreparingOrders().length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>В процес ({getPreparingOrders().length})</span>
                  </h2>
                  <div className="grid gap-6">
                    {getPreparingOrders().map(order => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                </div>
              )}

              {/* Ready Orders */}
              {getReadyOrders().length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Готови за издаване ({getReadyOrders().length})</span>
                  </h2>
                  <div className="grid gap-6">
                    {getReadyOrders().map(order => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                </div>
              )}

              {getPendingOrders().length === 0 && getPreparingOrders().length === 0 && getReadyOrders().length === 0 && (
                <div className="text-center py-16">
                  <div className="text-8xl mb-6">🍽️</div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-4">Няма активни поръчки</h3>
                  <p className="text-gray-500 text-lg">Всички поръчки са обработени! 🎉</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recipes' && (
            <div className="grid gap-6">
              {getActiveRecipes().map(recipe => (
                <div key={recipe.id} className="bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-700">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{recipe.name}</h3>
                      <p className="text-gray-400 text-lg">{recipe.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-400 mb-1">{recipe.price.toFixed(2)} лв.</div>
                      <div className="text-sm text-gray-500 flex items-center justify-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.preparationTime} мин.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-300 mb-4 flex items-center space-x-2">
                        <ChefHat className="w-5 h-5" />
                        <span>Ингредиенти:</span>
                      </h4>
                      <div className="space-y-2">
                        {recipe.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-700 px-4 py-3 rounded-lg">
                            <span className="font-medium text-gray-300">{ingredient.ingredientName}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400 font-semibold">
                                {ingredient.quantity} {ingredient.unit}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                ingredient.type === 'main' ? 'bg-blue-600 text-blue-100' : 'bg-green-600 text-green-100'
                              }`}>
                                {ingredient.type === 'main' ? 'Основен' : 'Подправка'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {recipe.instructions && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-300 mb-4">Инструкции:</h4>
                        <div className="bg-gray-700 p-6 rounded-lg text-gray-300 whitespace-pre-line leading-relaxed">
                          {recipe.instructions}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="grid gap-6">
              {ingredients.map(ingredient => (
                <div key={ingredient.id} className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{ingredient.name}</h3>
                      <p className="text-gray-400">{ingredient.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400 mb-2">
                        {ingredient.stock} {ingredient.unit}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        ingredient.type === 'main' ? 'bg-blue-600 text-blue-100' : 'bg-green-600 text-green-100'
                      }`}>
                        {ingredient.type === 'main' ? 'Основен' : 'Подправка'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">История на издадените поръчки</h2>
              {getCompletedOrders().slice(0, 20).map(order => (
                <div key={order.id} className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{order.recipeName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{order.completedAt && formatTime(order.completedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{order.quantity} порции</span>
                        </div>
                        {order.tableNumber && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>Маса {order.tableNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-300 mb-1">
                        {order.actualTime ? `${order.actualTime} мин.` : 'Н/А'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.completedAt && order.completedAt.toLocaleDateString('bg-BG')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {getCompletedOrders().length === 0 && (
                <div className="text-center py-16">
                  <div className="text-8xl mb-6">📋</div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-4">Няма издадени поръчки</h3>
                  <p className="text-gray-500 text-lg">Историята ще се появи тук след издаване на първата поръчка</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Kitchen; 