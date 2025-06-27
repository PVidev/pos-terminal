import { useState, useCallback } from 'react';
import { Category } from '../types';
import { defaultCategories } from '../data/categories';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString()
    };
    setCategories(prev => [...prev, newCategory]);
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === id ? { ...category, ...updates } : category
      )
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  }, []);

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory
  };
};