import React, { useState } from 'react';
import { CreditCard, Banknote, Smartphone, Receipt, CheckCircle } from 'lucide-react';
import { CartItem, PaymentMethod, Transaction } from '../types';
import { ReceiptModal } from './ReceiptModal';

interface PaymentPanelProps {
  items: CartItem[];
  total: number;
  onPaymentComplete: (transaction: Transaction) => void;
  onClearCart: () => void;
  operatorName?: string;
}

export const PaymentPanel: React.FC<PaymentPanelProps> = ({ 
  items, 
  total, 
  onPaymentComplete,
  onClearCart,
  operatorName
}) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const paymentMethods = [
    { id: 'cash' as PaymentMethod, name: 'В брой', icon: Banknote, color: 'emerald' },
    { id: 'card' as PaymentMethod, name: 'Карта', icon: CreditCard, color: 'blue' },
    { id: 'digital' as PaymentMethod, name: 'Дигитално', icon: Smartphone, color: 'purple' }
  ];

  const change = selectedPayment === 'cash' && cashReceived ? 
    Math.max(0, parseFloat(cashReceived) - total) : 0;

  const canProcessPayment = () => {
    if (items.length === 0) return false;
    if (selectedPayment === 'cash') {
      return cashReceived && parseFloat(cashReceived) >= total;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!canProcessPayment()) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      items: [...items],
      total,
      paymentMethod: selectedPayment,
      timestamp: new Date(),
      cashier: 'admin', // Default cashier
      operatorName: operatorName || 'Оператор'
    };

    setLastTransaction(transaction);
    onPaymentComplete(transaction);
    onClearCart();
    setCashReceived('');
    setIsProcessing(false);
    setShowSuccess(true);
  };

  const handleNewOrder = () => {
    setShowSuccess(false);
    setLastTransaction(null);
  };

  const handleShowReceipt = () => {
    if (lastTransaction) {
      setShowReceiptModal(true);
    }
  };

  if (showSuccess && lastTransaction) {
    return (
      <>
        <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 p-6">
          <div className="text-center mb-6">
            <div className="bg-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Плащането е успешно!</h2>
            <p className="text-gray-400">Транзакция #{lastTransaction.id.slice(-6)}</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-white mb-3">Резюме на поръчката</h3>
            <div className="space-y-2 text-sm">
              {lastTransaction.items.map(item => (
                <div key={item.id} className="flex justify-between text-gray-300">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} лв</span>
                </div>
              ))}
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between font-bold text-white">
                  <span>Общо:</span>
                  <span>{lastTransaction.total.toFixed(2)} лв</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs mt-1">
                  <span>Плащане:</span>
                  <span>{paymentMethods.find(p => p.id === lastTransaction.paymentMethod)?.name}</span>
                </div>
                {selectedPayment === 'cash' && change > 0 && (
                  <div className="flex justify-between text-emerald-400 text-sm mt-1">
                    <span>Ресто:</span>
                    <span>{change.toFixed(2)} лв</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleShowReceipt}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-3 active:scale-95 min-h-[64px]"
            >
              <Receipt className="w-6 h-6" />
              <span className="text-lg">Касов бон</span>
            </button>
            
            <button
              onClick={handleNewOrder}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-5 px-4 rounded-lg font-medium transition-all duration-200 active:scale-95 min-h-[64px] text-lg"
            >
              Нова поръчка
            </button>
          </div>
        </div>

        <ReceiptModal
          transaction={{ ...lastTransaction, operatorName: operatorName || lastTransaction.operatorName || 'Оператор' }}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Плащане</h2>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <CreditCard className="w-16 h-16 mb-4" />
          <p className="text-center">Няма продукти за плащане</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-white mb-6">Плащане</h2>
      
      <div className="mb-6">
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Общо за плащане:</span>
            <span className="text-3xl font-bold text-emerald-400">
              {total.toFixed(2)} лв
            </span>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Начин на плащане:
          </label>
          {paymentMethods.map(method => {
            const IconComponent = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => {
                  setSelectedPayment(method.id);
                  setCashReceived('');
                }}
                className={`w-full p-5 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 active:scale-95 min-h-[64px] ${
                  selectedPayment === method.id
                    ? `border-${method.color}-600 bg-${method.color}-600 bg-opacity-20 shadow-lg`
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <IconComponent className={`w-7 h-7 ${
                  selectedPayment === method.id ? `text-${method.color}-400` : 'text-gray-400'
                }`} />
                <span className={`font-medium text-xl ${
                  selectedPayment === method.id ? 'text-white' : 'text-gray-300'
                }`}>
                  {method.name}
                </span>
              </button>
            );
          })}
        </div>
        
        {selectedPayment === 'cash' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Получена сума:
            </label>
            <input
              type="number"
              step="0.01"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              placeholder="0.00"
              className="w-full p-5 bg-gray-700 border border-gray-600 rounded-lg text-white text-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
            {change > 0 && (
              <div className="mt-3 p-4 bg-emerald-600 bg-opacity-20 rounded-lg text-emerald-400 text-xl font-medium">
                Ресто: {change.toFixed(2)} лв
              </div>
            )}
          </div>
        )}
      </div>
      
      <button
        onClick={handlePayment}
        disabled={!canProcessPayment() || isProcessing}
        className={`w-full py-6 px-4 rounded-lg font-bold text-2xl transition-all duration-200 min-h-[72px] flex items-center justify-center ${
          canProcessPayment() && !isProcessing
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg transform hover:scale-105 active:scale-95'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
            <span>Обработва се...</span>
          </div>
        ) : (
          'Завърши плащането'
        )}
      </button>
    </div>
  );
};