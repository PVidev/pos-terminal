import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Transaction } from '../types';

interface ReceiptModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ 
  transaction, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getPaymentMethodName = (method: string) => {
    const methods = {
      cash: 'В брой',
      card: 'Банкова карта',
      digital: 'Дигитално плащане'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Касов бон #${transaction.id}</title>
              <style>
                body { font-family: 'Courier New', monospace; font-size: 12px; margin: 20px; }
                .receipt { max-width: 300px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                .item { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; font-size: 10px; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Касов бон</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div id="receipt-content" className="receipt">
          <div className="header">
            <h3 className="text-lg font-bold text-white mb-2">POS СИСТЕМА</h3>
            <p className="text-gray-400 text-sm">Модерен търговски терминал</p>
            <p className="text-gray-400 text-sm">ул. Витоша 1, София 1000</p>
            <p className="text-gray-400 text-sm">Тел: +359 2 123 4567</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Бон №:</span>
                <span className="font-mono">#{transaction.id}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Дата:</span>
                <span>{formatDate(transaction.timestamp)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Плащане:</span>
                <span>{getPaymentMethodName(transaction.paymentMethod)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-400 text-sm border-b border-gray-600 pb-2">
              <span>Продукт</span>
              <span>Сума</span>
            </div>
            {transaction.items.map(item => (
              <div key={item.id} className="item">
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{item.name}</div>
                  <div className="text-gray-400 text-xs">
                    {item.quantity} x {item.price.toFixed(2)} лв
                  </div>
                </div>
                <div className="text-emerald-400 font-bold text-sm">
                  {(item.price * item.quantity).toFixed(2)} лв
                </div>
              </div>
            ))}
          </div>

          <div className="total border-t border-gray-600 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-white">ОБЩО:</span>
              <span className="text-2xl font-bold text-emerald-400">
                {transaction.total.toFixed(2)} лв
              </span>
            </div>
            <div className="text-xs text-gray-400 text-center">
              Включено ДДС: {(transaction.total * 0.2).toFixed(2)} лв
            </div>
          </div>

          <div className="footer text-center mt-6 text-gray-500 text-xs">
            <p>Вас ви обслужи: <span className="font-semibold text-gray-700">{transaction.operatorName || 'Оператор'}</span></p>
            <p>Благодарим за покупката!</p>
            <p>Запазете бележката за гаранция</p>
            <p className="mt-2">www.pos-system.bg</p>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handlePrint}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Разпечатай</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Запази</span>
          </button>
        </div>
      </div>
    </div>
  );
};