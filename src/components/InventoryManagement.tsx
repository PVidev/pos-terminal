import React, { useState } from 'react';
import { Save, ShoppingCart, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { Product, InventoryOrder, InventoryRevision } from '../types';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  actualStock: number;
  orderQuantity: number;
  hasDiscrepancy: boolean;
}

interface InventoryManagementProps {
  products: Product[];
  onUpdateStock: (id: string, newStock: number) => void;
  onCreateOrder: (order: Omit<InventoryOrder, 'id' | 'timestamp'>) => void;
  onCreateRevision: (revision: Omit<InventoryRevision, 'id' | 'timestamp'>) => void;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  products,
  onUpdateStock,
  onCreateOrder,
  onCreateRevision
}) => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() =>
    products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      currentStock: product.stock ?? 0,
      actualStock: product.stock ?? 0,
      orderQuantity: 0,
      hasDiscrepancy: false
    }))
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  const handleActualStockChange = (id: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setInventoryItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const hasDiscrepancy = numValue !== item.currentStock;
          return {
            ...item,
            actualStock: numValue,
            hasDiscrepancy
          };
        }
        return item;
      })
    );
  };

  const handleOrderQuantityChange = (id: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setInventoryItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, orderQuantity: numValue } : item
      )
    );
  };

  const createRevisionRecord = () => {
    const itemsWithDiscrepancy = inventoryItems.filter(item => item.hasDiscrepancy);
    
    const revisionItems = inventoryItems.map(item => ({
      productId: item.id,
      productName: item.name,
      category: item.category,
      expectedStock: item.currentStock,
      actualStock: item.actualStock,
      difference: item.actualStock - item.currentStock,
      orderQuantity: item.orderQuantity
    }));

    const summary = {
      totalProducts: inventoryItems.length,
      productsWithDifferences: itemsWithDiscrepancy.length,
      totalDifferences: itemsWithDiscrepancy.reduce((sum, item) => sum + Math.abs(item.actualStock - item.currentStock), 0),
      totalOrdered: inventoryItems.reduce((sum, item) => sum + item.orderQuantity, 0)
    };

    const revision: Omit<InventoryRevision, 'id' | 'timestamp'> = {
      items: revisionItems,
      summary,
      performedBy: 'admin',
      notes: revisionNotes || undefined
    };

    return revision;
  };

  const handleSaveInventory = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Симулираме запазване
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Създаваме запис за ревизията
      const revision = createRevisionRecord();
      onCreateRevision(revision);
      
      // Обновяваме склада за продуктите с разлики
      inventoryItems.forEach(item => {
        if (item.hasDiscrepancy) {
          onUpdateStock(item.id, item.actualStock);
        }
      });

      setSaveMessage('Ревизията е запазена успешно!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Грешка при запазване на ревизията!');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndOrder = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Симулираме запазване и поръчка
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Създаваме запис за ревизията
      const revision = createRevisionRecord();
      onCreateRevision(revision);
      
      // Обновяваме склада
      inventoryItems.forEach(item => {
        if (item.hasDiscrepancy) {
          onUpdateStock(item.id, item.actualStock);
        }
      });

      // Създаваме поръчка от продуктите с поръчка
      const itemsToOrder = inventoryItems.filter(item => item.orderQuantity > 0);
      
      if (itemsToOrder.length > 0) {
        const orderItems = itemsToOrder.map(item => ({
          productId: item.id,
          productName: item.name,
          category: item.category,
          quantity: item.orderQuantity,
          currentStock: item.actualStock
        }));

        const order: Omit<InventoryOrder, 'id' | 'timestamp'> = {
          items: orderItems,
          totalItems: itemsToOrder.reduce((sum, item) => sum + item.orderQuantity, 0),
          status: 'pending',
          notes: `Поръчка създадена от ревизия на ${new Date().toLocaleDateString('bg-BG')}`,
          orderedBy: 'admin'
        };

        onCreateOrder(order);
        setSaveMessage(`Ревизията е запазена и поръчката за ${itemsToOrder.length} продукта е създадена!`);
      } else {
        setSaveMessage('Ревизията е запазена успешно!');
      }
      
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Грешка при запазване и поръчка!');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const itemsWithDiscrepancy = inventoryItems.filter(item => item.hasDiscrepancy);
  const itemsToOrder = inventoryItems.filter(item => item.orderQuantity > 0);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Ревизия на наличността</h1>
          <p className="text-gray-400">Проверете и коригирайте наличността на продуктите</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Общо продукти</p>
                <p className="text-2xl font-bold text-white">{inventoryItems.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-gray-400 text-sm">Разлики</p>
                <p className="text-2xl font-bold text-orange-400">{itemsWithDiscrepancy.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-gray-400 text-sm">За поръчка</p>
                <p className="text-2xl font-bold text-emerald-400">{itemsToOrder.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revision Notes */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Бележки за ревизията
          </label>
          <textarea
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            rows={3}
            placeholder="Добавете бележки за ревизията (по желание)..."
          />
        </div>

        {/* Success/Error Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            saveMessage.includes('успешно') 
              ? 'bg-emerald-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{saveMessage}</span>
          </div>
        )}

        {/* Inventory Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Продукт</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Категория</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Налични</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Има</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Поръчкай</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {inventoryItems.map(item => (
                  <tr key={item.id} className={`hover:bg-gray-750 transition-colors ${
                    item.hasDiscrepancy ? 'bg-orange-900/20' : ''
                  }`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-300 font-medium">{item.currentStock}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.actualStock}
                        onChange={(e) => handleActualStockChange(item.id, e.target.value)}
                        className={`w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                          item.hasDiscrepancy ? 'border-orange-500 bg-orange-900/20' : ''
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.orderQuantity}
                        onChange={(e) => handleOrderQuantityChange(item.id, e.target.value)}
                        className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.hasDiscrepancy ? (
                        <div className="flex items-center justify-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                          <span className="text-orange-400 text-sm font-medium">Разлика</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 text-sm font-medium">OK</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSaveInventory}
            disabled={isSaving}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>Запази ревизия</span>
          </button>
          
          <button
            onClick={handleSaveAndOrder}
            disabled={isSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Запази ревизия и поръчай</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 