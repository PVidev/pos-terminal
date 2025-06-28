import React, { useState } from 'react';
import { PendingDish, PaymentMethod } from '../types';
import { Clock, Users, MapPin, AlertCircle, DollarSign, CreditCard, Smartphone } from 'lucide-react';

interface PendingDishesProps {
  pendingDishes: PendingDish[];
  onMarkAsPaid: (dishId: string, paymentMethod: PaymentMethod) => void;
  onRemoveDish: (dishId: string) => void;
}

export const PendingDishes: React.FC<PendingDishesProps> = ({
  pendingDishes,
  onMarkAsPaid,
  onRemoveDish
}) => {
  const [selectedDish, setSelectedDish] = useState<PendingDish | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('bg-BG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} лв`;

  const handlePayment = (paymentMethod: PaymentMethod) => {
    if (selectedDish) {
      onMarkAsPaid(selectedDish.id, paymentMethod);
      setShowPaymentModal(false);
      setSelectedDish(null);
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash': return <DollarSign className="w-5 h-5" />;
      case 'card': return <CreditCard className="w-5 h-5" />;
      case 'digital': return <Smartphone className="w-5 h-5" />;
    }
  };

  const getPaymentMethodText = (method: PaymentMethod) => {
    switch (method) {
      case 'cash': return 'В брой';
      case 'card': return 'Карта';
      case 'digital': return 'Дигитално';
    }
  };

  if (pendingDishes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl shadow-lg">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">⏳ Чакащи ястия</h1>
              <p className="text-gray-400">Ястия готови за плащане</p>
            </div>
          </div>
          
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-4">Няма чакащи ястия</h3>
            <p className="text-gray-500 text-lg">Всички ястия са платени! 🎉</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl shadow-lg">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">⏳ Чакащи ястия</h1>
            <p className="text-gray-400">Ястия готови за плащане ({pendingDishes.length})</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-400 to-green-500 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{pendingDishes.length}</div>
                <div className="text-green-100">Чакащи ястия</div>
              </div>
              <AlertCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {formatCurrency(pendingDishes.reduce((sum, dish) => sum + dish.totalPrice, 0))}
                </div>
                <div className="text-blue-100">Обща сума</div>
              </div>
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {new Set(pendingDishes.map(dish => dish.tableNumber).filter(Boolean)).size}
                </div>
                <div className="text-purple-100">Активни маси</div>
              </div>
              <MapPin className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Pending Dishes Grid */}
        <div className="grid gap-6">
          {pendingDishes.map(dish => (
            <div 
              key={dish.id} 
              className="bg-gray-800 rounded-2xl shadow-lg border-2 border-green-500/20 hover:border-green-500/40 transition-all duration-200 cursor-pointer"
              onClick={() => {
                setSelectedDish(dish);
                setShowPaymentModal(true);
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{dish.recipeName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{dish.quantity} порции</span>
                      </div>
                      {dish.tableNumber && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>Маса {dish.tableNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(dish.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      {formatCurrency(dish.totalPrice)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(dish.price)} × {dish.quantity}
                    </div>
                  </div>
                </div>

                {dish.notes && (
                  <div className="mb-4 p-3 bg-yellow-900/30 rounded-lg border border-yellow-700">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-yellow-300">Бележка:</span>
                        <p className="text-sm text-yellow-200 mt-1">{dish.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDish(dish);
                      setShowPaymentModal(true);
                    }}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Плати</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveDish(dish.id);
                    }}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Плащане</h3>
                <p className="text-gray-400">{selectedDish.recipeName}</p>
                <div className="text-3xl font-bold text-green-400 mt-2">
                  {formatCurrency(selectedDish.totalPrice)}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {(['cash', 'card', 'digital'] as PaymentMethod[]).map(method => (
                  <button
                    key={method}
                    onClick={() => handlePayment(method)}
                    className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between text-white"
                  >
                    <div className="flex items-center space-x-3">
                      {getPaymentMethodIcon(method)}
                      <span className="font-medium">{getPaymentMethodText(method)}</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full p-3 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Отказ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 