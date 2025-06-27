import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, Package, Download, Printer, Eye, AlertTriangle, CheckCircle, XCircle, Edit } from 'lucide-react';
import { InventoryOrder, Product } from '../types';

interface OrderManagementProps {
  orders: InventoryOrder[];
  products: Product[];
  onUpdateOrderStatus: (id: string, status: InventoryOrder['status'], cancellationReason?: string) => void;
  onDeleteOrder: (id: string) => void;
  onUpdateProductStock: (id: string, newStock: number) => void;
}

interface OrderDetailsModalProps {
  order: InventoryOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onUpdateStatus: (status: InventoryOrder['status'], cancellationReason?: string) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onPrint,
  onExportPDF,
  onExportCSV,
  onUpdateStatus
}) => {
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancellationForm, setShowCancellationForm] = useState(false);

  if (!isOpen || !order) return null;

  const getStatusColor = (status: InventoryOrder['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'ordered': return 'text-blue-400';
      case 'received': return 'text-emerald-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: InventoryOrder['status']) => {
    switch (status) {
      case 'pending': return 'Чакаща';
      case 'ordered': return 'Поръчана';
      case 'received': return 'Получена';
      case 'cancelled': return 'Отказана';
      default: return 'Неизвестен';
    }
  };

  const handleStatusUpdate = (status: InventoryOrder['status']) => {
    if (status === 'cancelled') {
      setShowCancellationForm(true);
    } else {
      onUpdateStatus(status);
    }
  };

  const handleCancellationSubmit = () => {
    if (cancellationReason.trim()) {
      onUpdateStatus('cancelled', cancellationReason);
      setCancellationReason('');
      setShowCancellationForm(false);
    }
  };

  const isReceived = order.status === 'received';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Поръчка #{order.id}</h2>
              <p className="text-gray-400">
                {new Date(order.timestamp).toLocaleDateString('bg-BG')} - {new Date(order.timestamp).toLocaleTimeString('bg-BG')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Информация за поръчката</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Статус:</span>
                  <p className={`font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Общо продукти:</span>
                  <p className="text-emerald-400 font-bold text-lg">{order.totalItems}</p>
                </div>
                {order.orderedBy && (
                  <div>
                    <span className="text-gray-400">Поръчана от:</span>
                    <p className="text-white">{order.orderedBy}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-400">Брой артикули:</span>
                  <p className="text-white">{order.items.length}</p>
                </div>
              </div>
              {order.notes && (
                <div className="mt-3">
                  <span className="text-gray-400">Бележки:</span>
                  <p className="text-white text-sm mt-1">{order.notes}</p>
                </div>
              )}
              {order.cancellationReason && (
                <div className="mt-3">
                  <span className="text-gray-400">Причина за отказ:</span>
                  <p className="text-red-400 text-sm mt-1">{order.cancellationReason}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Поръчани продукти</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-600 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.productName}</p>
                        <p className="text-gray-400 text-sm">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{item.quantity} бр.</p>
                      <p className="text-gray-400 text-sm">Налично: {item.currentStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update */}
            {!isReceived && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Промени статус</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStatusUpdate('pending')}
                    disabled={order.status === 'pending'}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      order.status === 'pending' 
                        ? 'bg-yellow-600 text-white cursor-not-allowed' 
                        : 'bg-gray-600 text-gray-300 hover:bg-yellow-600 hover:text-white'
                    }`}
                  >
                    Чакаща
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('ordered')}
                    disabled={order.status === 'ordered'}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      order.status === 'ordered' 
                        ? 'bg-blue-600 text-white cursor-not-allowed' 
                        : 'bg-gray-600 text-gray-300 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    Поръчана
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('received')}
                    disabled={order.status === 'received'}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      order.status === 'received' 
                        ? 'bg-emerald-600 text-white cursor-not-allowed' 
                        : 'bg-gray-600 text-gray-300 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    Получена
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={order.status === 'cancelled'}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      order.status === 'cancelled' 
                        ? 'bg-red-600 text-white cursor-not-allowed' 
                        : 'bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    Отказана
                  </button>
                </div>
              </div>
            )}

            {/* Cancellation Form */}
            {showCancellationForm && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Причина за отказ</h3>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  rows={3}
                  placeholder="Въведете причина за отказ на поръчката..."
                />
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={handleCancellationSubmit}
                    disabled={!cancellationReason.trim()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Откажи поръчката
                  </button>
                  <button
                    onClick={() => setShowCancellationForm(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Отказ
                  </button>
                </div>
              </div>
            )}

            {/* Received Notice */}
            {isReceived && (
              <div className="bg-emerald-600 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <p className="text-white font-medium">Поръчката е получена и количествата са добавени към склада</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={onPrint}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95"
            >
              <Printer className="w-5 h-5" />
              <span>Принтирай</span>
            </button>
            
            <button
              onClick={onExportPDF}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span>PDF</span>
            </button>
            
            <button
              onClick={onExportCSV}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OrderManagement: React.FC<OrderManagementProps> = ({ 
  orders, 
  products,
  onUpdateOrderStatus, 
  onDeleteOrder,
  onUpdateProductStock
}) => {
  const [selectedOrder, setSelectedOrder] = useState<InventoryOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InventoryOrder['status'] | 'all'>('all');
  const [newOrders, setNewOrders] = useState<Set<string>>(new Set());

  // Добавяне на нови поръчки в списъка за мигане (само чакащи и поръчани)
  useEffect(() => {
    const newOrderIds = orders
      .filter(order => order.status === 'pending' || order.status === 'ordered')
      .map(order => order.id);
    
    setNewOrders(prev => {
      const updated = new Set(prev);
      newOrderIds.forEach(id => updated.add(id));
      return updated;
    });
  }, [orders]);

  const handleOrderClick = (order: InventoryOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = (status: InventoryOrder['status'], cancellationReason?: string) => {
    if (selectedOrder) {
      const previousStatus = selectedOrder.status;
      
      // Обновяваме поръчката с новата информация
      const updatedOrder = {
        ...selectedOrder,
        status,
        cancellationReason: cancellationReason || selectedOrder.cancellationReason
      };
      
      onUpdateOrderStatus(selectedOrder.id, status, cancellationReason);
      
      // Ако статусът се променя на "Получена", обновяваме склада
      if (status === 'received' && previousStatus !== 'received') {
        console.log('Обновяване на склада за получена поръчка:', selectedOrder.id);
        selectedOrder.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const newStock = (product.stock || 0) + item.quantity;
            console.log(`Продукт: ${item.productName}, Стар склад: ${product.stock}, Добавяне: ${item.quantity}, Нов склад: ${newStock}`);
            onUpdateProductStock(item.productId, newStock);
          } else {
            console.log(`Продукт не намерен: ${item.productId}`);
          }
        });
      }
      
      setSelectedOrder(updatedOrder);
    }
  };

  const handlePrint = () => {
    if (selectedOrder) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Поръчка #${selectedOrder.id}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .order-info { margin-bottom: 20px; }
                .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .items-table th { background-color: #f2f2f2; }
                .total { margin-top: 20px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Поръчка #${selectedOrder.id}</h1>
                <p>Дата: ${new Date(selectedOrder.timestamp).toLocaleDateString('bg-BG')}</p>
                <p>Статус: ${selectedOrder.status}</p>
              </div>
              
              <div class="order-info">
                <p><strong>Общо продукти:</strong> ${selectedOrder.totalItems}</p>
                <p><strong>Брой артикули:</strong> ${selectedOrder.items.length}</p>
                ${selectedOrder.notes ? `<p><strong>Бележки:</strong> ${selectedOrder.notes}</p>` : ''}
                ${selectedOrder.cancellationReason ? `<p><strong>Причина за отказ:</strong> ${selectedOrder.cancellationReason}</p>` : ''}
              </div>
              
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Продукт</th>
                    <th>Категория</th>
                    <th>Количество</th>
                    <th>Налично</th>
                  </tr>
                </thead>
                <tbody>
                  ${selectedOrder.items.map(item => `
                    <tr>
                      <td>${item.productName}</td>
                      <td>${item.category}</td>
                      <td>${item.quantity} бр.</td>
                      <td>${item.currentStock}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="total">
                <p>Общо количество: ${selectedOrder.totalItems} бр.</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleExportPDF = () => {
    if (selectedOrder) {
      // Симулираме експорт в PDF
      const data = {
        orderId: selectedOrder.id,
        date: new Date(selectedOrder.timestamp).toLocaleDateString('bg-BG'),
        status: selectedOrder.status,
        totalItems: selectedOrder.totalItems,
        items: selectedOrder.items,
        notes: selectedOrder.notes,
        cancellationReason: selectedOrder.cancellationReason
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${selectedOrder.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleExportCSV = () => {
    if (selectedOrder) {
      const headers = ['Продукт', 'Категория', 'Количество', 'Налично'];
      const csvContent = [
        headers.join(','),
        ...selectedOrder.items.map(item => 
          [item.productName, item.category, item.quantity, item.currentStock].join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${selectedOrder.id}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getStatusIcon = (status: InventoryOrder['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'ordered': return <Package className="w-4 h-4" />;
      case 'received': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: InventoryOrder['status']) => {
    switch (status) {
      case 'pending': return 'Чакаща';
      case 'ordered': return 'Поръчана';
      case 'received': return 'Получена';
      case 'cancelled': return 'Отказана';
      default: return 'Неизвестен';
    }
  };

  const getStatusColor = (status: InventoryOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'ordered': return 'bg-blue-500';
      case 'received': return 'bg-emerald-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.includes(searchTerm) || 
                         order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Брой нови поръчки (чакащи и поръчани)
  const newOrdersCount = orders.filter(order => 
    order.status === 'pending' || order.status === 'ordered'
  ).length;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Управление на поръчките</h1>
          <p className="text-gray-400">Проследяване и управление на поръчките от ревизията</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Търсене
              </label>
              <input
                type="text"
                placeholder="Търсене по номер на поръчка или продукт..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Статус
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">Всички статуси</option>
                <option value="pending">Чакащи</option>
                <option value="ordered">Поръчани</option>
                <option value="received">Получени</option>
                <option value="cancelled">Отказани</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Няма намерени поръчки</p>
              <p className="text-gray-500 text-sm">Опитайте с различни критерии за търсене</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Поръчка №</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Дата</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Статус</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Продукти</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Общо</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredOrders.map(order => {
                    const isNewOrder = newOrders.has(order.id);
                    const isPending = order.status === 'pending';
                    const isOrdered = order.status === 'ordered';
                    
                    return (
                      <tr 
                        key={order.id} 
                        className={`hover:bg-gray-750 transition-colors cursor-pointer ${
                          isNewOrder && (isPending || isOrdered) ? 'animate-pulse-red' : ''
                        }`}
                        onClick={() => handleOrderClick(order)}
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-white">#{order.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">
                              {new Date(order.timestamp).toLocaleDateString('bg-BG')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)} ${
                              isNewOrder && (isPending || isOrdered) ? 'animate-status-pulse' : ''
                            }`}></div>
                            <span className={`text-sm font-medium ${
                              isNewOrder && (isPending || isOrdered) ? 'text-red-400 animate-status-pulse' : 'text-gray-300'
                            }`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{order.items.length}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-emerald-400 font-bold">{order.totalItems}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onPrint={handlePrint}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
}; 