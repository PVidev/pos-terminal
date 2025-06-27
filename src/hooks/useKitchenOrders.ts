import { useState, useCallback } from 'react';
import { KitchenOrder } from '../types';

export const useKitchenOrders = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<KitchenOrder[]>([]);

  const addOrder = useCallback((order: Omit<KitchenOrder, 'id' | 'timestamp'>) => {
    const newOrder: KitchenOrder = {
      ...order,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'pending'
    };
    setOrders(prev => [...prev, newOrder]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: KitchenOrder['status'], notes?: string) => {
    setOrders(prev => 
      prev.map(order => {
        if (order.id === orderId) {
          const updates: Partial<KitchenOrder> = { status };
          
          if (status === 'preparing' && !order.startedAt) {
            updates.startedAt = new Date();
          }
          
          if (status === 'ready' && !order.completedAt) {
            updates.completedAt = new Date();
            updates.actualTime = order.startedAt 
              ? Math.round((new Date().getTime() - order.startedAt.getTime()) / 60000)
              : undefined;
          }
          
          if (notes) {
            updates.notes = notes;
          }
          
          return { ...order, ...updates };
        }
        return order;
      })
    );
  }, []);

  const moveToCompleted = useCallback((orderId: string) => {
    setOrders(prev => {
      const orderToMove = prev.find(order => order.id === orderId);
      if (orderToMove && orderToMove.status === 'ready') {
        setCompletedOrders(completed => [...completed, orderToMove]);
        return prev.filter(order => order.id !== orderId);
      }
      return prev;
    });
  }, []);

  const cancelOrder = useCallback((orderId: string, reason?: string) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled', notes: reason }
          : order
      )
    );
  }, []);

  const getOrdersByStatus = useCallback((status: KitchenOrder['status']) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  const getPendingOrders = useCallback(() => {
    return orders.filter(order => order.status === 'pending')
      .sort((a, b) => {
        // Сортиране по приоритет и време
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return a.timestamp.getTime() - b.timestamp.getTime();
      });
  }, [orders]);

  const getPreparingOrders = useCallback(() => {
    return orders.filter(order => order.status === 'preparing')
      .sort((a, b) => {
        if (!a.startedAt || !b.startedAt) return 0;
        return a.startedAt.getTime() - b.startedAt.getTime();
      });
  }, [orders]);

  const getReadyOrders = useCallback(() => {
    return orders.filter(order => order.status === 'ready')
      .sort((a, b) => {
        if (!a.completedAt || !b.completedAt) return 0;
        return a.completedAt.getTime() - b.completedAt.getTime();
      });
  }, [orders]);

  const getOrderById = useCallback((id: string) => {
    return orders.find(order => order.id === id);
  }, [orders]);

  const getCompletedOrders = useCallback(() => {
    return completedOrders.sort((a, b) => 
      b.completedAt!.getTime() - a.completedAt!.getTime()
    );
  }, [completedOrders]);

  const getOrdersByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return completedOrders.filter(order => 
      order.completedAt && 
      order.completedAt >= startDate && 
      order.completedAt <= endDate
    );
  }, [completedOrders]);

  const getKitchenStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = getOrdersByDateRange(today, tomorrow);
    
    return {
      pending: getOrdersByStatus('pending').length,
      preparing: getOrdersByStatus('preparing').length,
      ready: getOrdersByStatus('ready').length,
      completedToday: todayOrders.length,
      averagePreparationTime: todayOrders.length > 0 
        ? todayOrders.reduce((sum, order) => sum + (order.actualTime || 0), 0) / todayOrders.length
        : 0
    };
  }, [orders, getOrdersByStatus, getOrdersByDateRange]);

  return {
    orders,
    completedOrders,
    addOrder,
    updateOrderStatus,
    moveToCompleted,
    cancelOrder,
    getOrdersByStatus,
    getPendingOrders,
    getPreparingOrders,
    getReadyOrders,
    getOrderById,
    getCompletedOrders,
    getOrdersByDateRange,
    getKitchenStats
  };
}; 