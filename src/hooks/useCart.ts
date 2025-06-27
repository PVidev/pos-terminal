import { useState, useCallback } from 'react';
import { CartItem, Product } from '../types';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  const addToCart = useCallback((product: Product) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const availableStock = product.stock ?? Infinity;
      
      // Проверяваме дали склада е изчерпан (0)
      if (availableStock === 0) {
        setStockWarning(`Няма наличност за ${product.name}. Продуктът е изчерпан.`);
        setTimeout(() => setStockWarning(null), 3000);
        return prevItems;
      }
      
      // Изчистваме предупреждението ако успешно добавихме
      setStockWarning(null);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } else {
      setItems(prevItems => {
        const item = prevItems.find(item => item.id === id);
        if (!item) return prevItems;
        
        const availableStock = item.stock ?? Infinity;
        
        // Проверяваме дали склада е изчерпан (0)
        if (availableStock === 0 && quantity > 0) {
          setStockWarning(`Няма наличност за ${item.name}. Продуктът е изчерпан.`);
          setTimeout(() => setStockWarning(null), 3000);
          return prevItems;
        }
        
        // Изчистваме предупреждението ако успешно променихме количеството
        setStockWarning(null);
        
        return prevItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        );
      });
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const clearStockWarning = useCallback(() => {
    setStockWarning(null);
  }, []);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    clearStockWarning,
    total,
    itemCount,
    stockWarning
  };
};