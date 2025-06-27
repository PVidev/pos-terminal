import { useState, useCallback } from 'react';
import { InventoryOrder } from '../types';

export const useInventoryOrders = () => {
  const [orders, setOrders] = useState<InventoryOrder[]>([]);

  const addOrder = useCallback((order: Omit<InventoryOrder, 'id' | 'timestamp'>) => {
    const newOrder: InventoryOrder = {
      ...order,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, []);

  const updateOrderStatus = useCallback((id: string, status: InventoryOrder['status'], cancellationReason?: string) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === id ? { 
          ...order, 
          status,
          cancellationReason: cancellationReason || order.cancellationReason
        } : order
      )
    );
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  }, []);

  const getOrdersByStatus = useCallback((status: InventoryOrder['status']) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  return {
    orders,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    getOrdersByStatus
  };
}; 