import React, { useState } from 'react';
import { Recipe } from '../types';
import { useRecipes } from '../hooks/useRecipes';
import RecipePaymentModal from './RecipePaymentModal';
import { ChefHat, Clock, Star } from 'lucide-react';

interface RecipeSelectorProps {
  onClose: () => void;
  onAddToKitchen: (recipe: Recipe, quantity: number, tableNumber?: string, notes?: string) => void;
  onAddToCart?: (recipe: Recipe, quantity: number) => void;
  cartItems?: any[];
}

const RecipeSelector: React.FC<RecipeSelectorProps> = ({ 
  onClose, 
  onAddToKitchen, 
  onAddToCart,
  cartItems = []
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { getActiveRecipes } = useRecipes();
  const recipes = getActiveRecipes();
  
  // Групиране на рецепти по категории
  const recipesByCategory = recipes.reduce((acc, recipe) => {
    if (!acc[recipe.category]) {
      acc[recipe.category] = [];
    }
    acc[recipe.category].push(recipe);
    return acc;
  }, {} as Record<string, Recipe[]>);

  // Филтриране на рецепти
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowPaymentModal(true);
  };

  const handleAddToKitchen = (recipe: Recipe, quantity: number, tableNumber?: string, notes?: string) => {
    onAddToKitchen(recipe, quantity, tableNumber, notes);
    setShowPaymentModal(false);
    setSelectedRecipe(null);
  };

  const handleAddToCart = (recipe: Recipe, quantity: number) => {
    if (onAddToCart) {
      onAddToCart(recipe, quantity);
    }
    setShowPaymentModal(false);
    setSelectedRecipe(null);
  };

  const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: Recipe['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'Лесно';
      case 'medium': return 'Средно';
      case 'hard': return 'Трудно';
      default: return 'Нормално';
    }
  };

  const categories = ['all', ...Object.keys(recipesByCategory)];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Избери рецепта</h2>
                  <p className="text-gray-600">Добави ястие в количката или директно в кухнята</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ×
              </button>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Търси рецепти..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                  />
                </div>
                <div className="w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'Всички категории' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Recipes Grid */}
            {filteredRecipes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map(recipe => (
                  <div
                    key={recipe.id}
                    onClick={() => handleRecipeSelect(recipe)}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{recipe.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {recipe.price.toFixed(2)} лв.
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(recipe.difficulty)}`}>
                          {getDifficultyText(recipe.difficulty)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.preparationTime} мин.</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ChefHat className="w-4 h-4" />
                          <span>{recipe.ingredients.length} ингредиента</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{recipe.category}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">
                            {recipe.difficulty === 'easy' ? '4.8' : 
                             recipe.difficulty === 'medium' ? '4.5' : '4.2'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">Няма намерени рецепти</h3>
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'Променете критериите за търсене' : 'Добавете рецепти в настройките'}
                </p>
              </div>
            )}

            {recipes.length === 0 && (
              <div className="text-center py-16">
                <div className="text-8xl mb-6">🍽️</div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">Няма налични рецепти</h3>
                <p className="text-gray-500 text-lg">Добавете рецепти в настройките</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedRecipe && (
        <RecipePaymentModal
          recipe={selectedRecipe}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedRecipe(null);
          }}
          onAddToCart={handleAddToCart}
          onAddToKitchen={handleAddToKitchen}
          cartItems={cartItems}
        />
      )}
    </>
  );
};

export default RecipeSelector; 