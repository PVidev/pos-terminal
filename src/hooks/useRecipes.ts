import { useState, useCallback } from 'react';
import { Recipe, Ingredient } from '../types';

// Примерни ингредиенти
const initialIngredients: Ingredient[] = [
  { id: '1', name: 'Краставица', type: 'main', unit: 'бр.', stock: 50, category: 'Зеленчуци' },
  { id: '2', name: 'Домат', type: 'main', unit: 'бр.', stock: 100, category: 'Зеленчуци' },
  { id: '3', name: 'Лук', type: 'main', unit: 'бр.', stock: 30, category: 'Зеленчуци' },
  { id: '4', name: 'Сирене', type: 'main', unit: 'гр.', stock: 5000, category: 'Млечни продукти' },
  { id: '5', name: 'Олио', type: 'spice', unit: 'мл.', stock: 2000, category: 'Подправки' },
  { id: '6', name: 'Сол', type: 'spice', unit: 'щипка', stock: 999, category: 'Подправки' },
  { id: '7', name: 'Оцет', type: 'spice', unit: 'мл.', stock: 1000, category: 'Подправки' },
  { id: '8', name: 'Чесън', type: 'main', unit: 'бр.', stock: 20, category: 'Зеленчуци' },
  { id: '9', name: 'Пипер', type: 'spice', unit: 'щипка', stock: 999, category: 'Подправки' },
];

// Примерни рецепти
const initialRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Шопска салата',
    description: 'Класическа българска салата',
    category: 'Салати',
    preparationTime: 10,
    difficulty: 'easy',
    price: 8.50,
    isActive: true,
    ingredients: [
      { ingredientId: '1', ingredientName: 'Краставица', quantity: 1, unit: 'бр.', type: 'main' },
      { ingredientId: '2', ingredientName: 'Домат', quantity: 2, unit: 'бр.', type: 'main' },
      { ingredientId: '3', ingredientName: 'Лук', quantity: 1, unit: 'бр.', type: 'main' },
      { ingredientId: '4', ingredientName: 'Сирене', quantity: 300, unit: 'гр.', type: 'main' },
      { ingredientId: '5', ingredientName: 'Олио', quantity: 50, unit: 'мл.', type: 'spice' },
      { ingredientId: '6', ingredientName: 'Сол', quantity: 1, unit: 'щипка', type: 'spice' },
    ],
    instructions: '1. Нарежете краставицата, доматите и лука на кубчета\n2. Натрошете сиренето\n3. Смесете всички ингредиенти\n4. Добавете олио и сол на вкус'
  },
  {
    id: '2',
    name: 'Гръцка салата',
    description: 'Салата с маслини и фета сирене',
    category: 'Салати',
    preparationTime: 15,
    difficulty: 'easy',
    price: 12.00,
    isActive: true,
    ingredients: [
      { ingredientId: '2', ingredientName: 'Домат', quantity: 2, unit: 'бр.', type: 'main' },
      { ingredientId: '1', ingredientName: 'Краставица', quantity: 1, unit: 'бр.', type: 'main' },
      { ingredientId: '3', ingredientName: 'Лук', quantity: 0.5, unit: 'бр.', type: 'main' },
      { ingredientId: '5', ingredientName: 'Олио', quantity: 30, unit: 'мл.', type: 'spice' },
      { ingredientId: '6', ingredientName: 'Сол', quantity: 1, unit: 'щипка', type: 'spice' },
      { ingredientId: '9', ingredientName: 'Пипер', quantity: 1, unit: 'щипка', type: 'spice' },
    ],
    instructions: '1. Нарежете доматите и краставицата\n2. Добавете нарязан лук\n3. Поръсете с олио, сол и пипер'
  }
];

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);

  const addRecipe = useCallback((recipe: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString()
    };
    setRecipes(prev => [...prev, newRecipe]);
  }, []);

  const updateRecipe = useCallback((id: string, updates: Partial<Recipe>) => {
    setRecipes(prev => 
      prev.map(recipe => 
        recipe.id === id ? { ...recipe, ...updates } : recipe
      )
    );
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
  }, []);

  const addIngredient = useCallback((ingredient: Omit<Ingredient, 'id'>) => {
    const newIngredient: Ingredient = {
      ...ingredient,
      id: Date.now().toString()
    };
    setIngredients(prev => [...prev, newIngredient]);
  }, []);

  const updateIngredient = useCallback((id: string, updates: Partial<Ingredient>) => {
    setIngredients(prev => 
      prev.map(ingredient => 
        ingredient.id === id ? { ...ingredient, ...updates } : ingredient
      )
    );
  }, []);

  const deleteIngredient = useCallback((id: string) => {
    setIngredients(prev => prev.filter(ingredient => ingredient.id !== id));
  }, []);

  const decreaseIngredientStock = useCallback((id: string, quantity: number) => {
    setIngredients(prev => 
      prev.map(ingredient => {
        if (ingredient.id === id && ingredient.stock !== undefined) {
          return {
            ...ingredient,
            stock: Math.max(0, ingredient.stock - quantity)
          };
        }
        return ingredient;
      })
    );
  }, []);

  const getRecipeById = useCallback((id: string) => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  const getIngredientById = useCallback((id: string) => {
    return ingredients.find(ingredient => ingredient.id === id);
  }, [ingredients]);

  const getRecipesByCategory = useCallback((category: string) => {
    return recipes.filter(recipe => recipe.category === category && recipe.isActive);
  }, [recipes]);

  const getActiveRecipes = useCallback(() => {
    return recipes.filter(recipe => recipe.isActive);
  }, [recipes]);

  return {
    recipes,
    ingredients,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    decreaseIngredientStock,
    getRecipeById,
    getIngredientById,
    getRecipesByCategory,
    getActiveRecipes
  };
}; 