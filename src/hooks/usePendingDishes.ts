import { useState, useCallback } from 'react';
import { PendingDish, PaymentMethod } from '../types';

export const usePendingDishes = () => {
  const [pendingDishes, setPendingDishes] = useState<PendingDish[]>([]);

  const addPendingDish = useCallback((dish: Omit<PendingDish, 'id' | 'timestamp' | 'isPaid'>) => {
    const newDish: PendingDish = {
      ...dish,
      id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isPaid: false
    };
    
    setPendingDishes(prev => [newDish, ...prev]);
    return newDish;
  }, []);

  const markAsPaid = useCallback((dishId: string, paymentMethod: PaymentMethod) => {
    setPendingDishes(prev => 
      prev.map(dish => 
        dish.id === dishId 
          ? { 
              ...dish, 
              isPaid: true, 
              paymentMethod, 
              paidAt: new Date() 
            }
          : dish
      )
    );
  }, []);

  const removePendingDish = useCallback((dishId: string) => {
    setPendingDishes(prev => prev.filter(dish => dish.id !== dishId));
  }, []);

  const getPendingDishes = useCallback(() => {
    return pendingDishes.filter(dish => !dish.isPaid);
  }, [pendingDishes]);

  const getPaidDishes = useCallback(() => {
    return pendingDishes.filter(dish => dish.isPaid);
  }, [pendingDishes]);

  const getPendingDishesByTable = useCallback((tableNumber: string) => {
    return pendingDishes.filter(dish => 
      !dish.isPaid && dish.tableNumber === tableNumber
    );
  }, [pendingDishes]);

  const getTotalPendingAmount = useCallback(() => {
    return pendingDishes
      .filter(dish => !dish.isPaid)
      .reduce((sum, dish) => sum + dish.totalPrice, 0);
  }, [pendingDishes]);

  return {
    pendingDishes,
    addPendingDish,
    markAsPaid,
    removePendingDish,
    getPendingDishes,
    getPaidDishes,
    getPendingDishesByTable,
    getTotalPendingAmount
  };
}; 