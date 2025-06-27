import { useState, useCallback } from 'react';
import { Product } from '../types';
import { products as initialProducts } from '../data/products';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    };
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, ...updates } : product
      )
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  }, []);

  const decreaseStock = useCallback((id: string, quantity: number = 1) => {
    setProducts(prev => 
      prev.map(product => {
        if (product.id === id && product.stock !== undefined) {
          return {
            ...product,
            stock: Math.max(0, product.stock - quantity)
          };
        }
        return product;
      })
    );
  }, []);

  const increaseStock = useCallback((id: string, quantity: number = 1) => {
    setProducts(prev => 
      prev.map(product => {
        if (product.id === id && product.stock !== undefined) {
          return {
            ...product,
            stock: product.stock + quantity
          };
        }
        return product;
      })
    );
  }, []);

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    decreaseStock,
    increaseStock
  };
};