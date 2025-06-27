import React, { useState } from 'react';
import { Recipe, CartItem } from '../types';
import { ChefHat, ShoppingCart, Clock, Users, MapPin, AlertCircle } from 'lucide-react';

interface RecipePaymentModalProps {
  recipe: Recipe;
  onClose: () => void;
  onAddToCart: (recipe: Recipe, quantity: number) => void;
  onAddToKitchen: (recipe: Recipe, quantity: number, tableNumber?: string, notes?: string) => void;
  cartItems: CartItem[];
}

const RecipePaymentModal: React.FC<RecipePaymentModalProps> = ({
  recipe,
  onClose,
  onAddToCart,
  onAddToKitchen,
  cartItems
}) => {
  const [quantity, setQuantity] = useState(1);
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cart' | 'kitchen'>('cart');
  const [showKitchenOptions, setShowKitchenOptions] = useState(false);

  const totalPrice = recipe.price * quantity;
  const isInCart = cartItems.some(item => item.id === recipe.id);

  const handleAddToCart = () => {
    onAddToCart(recipe, quantity);
    onClose();
  };

  const handleAddToKitchen = () => {
    onAddToKitchen(recipe, quantity, tableNumber || undefined, notes || undefined);
    onClose();
  };

  const handlePaymentMethodChange = (method: 'cart' | 'kitchen') => {
    setPaymentMethod(method);
    if (method === 'kitchen') {
      setShowKitchenOptions(true);
    } else {
      setShowKitchenOptions(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{recipe.name}</h2>
                <p className="text-gray-600">{recipe.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ×
            </button>
          </div>

          {/* Recipe Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Детайли</span>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Категория:</span>
                    <span className="font-medium">{recipe.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Време за приготвяне:</span>
                    <span className="font-medium">{recipe.preparationTime} мин.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Сложност:</span>
                    <span className="font-medium">
                      {recipe.difficulty === 'easy' ? 'Лесно' :
                       recipe.difficulty === 'medium' ? 'Средно' : 'Трудно'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Цена за порция:</span>
                    <span className="font-bold text-blue-600">{recipe.price.toFixed(2)} лв.</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <ChefHat className="w-5 h-5" />
                  <span>Ингредиенти</span>
                </h3>
                <div className="space-y-1 text-sm">
                  {recipe.ingredients.slice(0, 5).map((ingredient, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{ingredient.ingredientName}</span>
                      <span className="text-gray-600">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </div>
                  ))}
                  {recipe.ingredients.length > 5 && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                      +{recipe.ingredients.length - 5} още ингредиента
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Quantity Selection */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Количество</span>
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-gray-800 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  Обща цена: <span className="font-bold text-blue-600 text-lg">{totalPrice.toFixed(2)} лв.</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3">Метод на плащане</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cart"
                      checked={paymentMethod === 'cart'}
                      onChange={() => handlePaymentMethodChange('cart')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Добави в количката</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="kitchen"
                      checked={paymentMethod === 'kitchen'}
                      onChange={() => handlePaymentMethodChange('kitchen')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center space-x-2">
                      <ChefHat className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Директно в кухнята</span>
                    </div>
                  </label>
                </div>

                {isInCart && paymentMethod === 'cart' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Този продукт вече е в количката
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Kitchen Options */}
              {showKitchenOptions && (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <ChefHat className="w-5 h-5" />
                    <span>Кухненски опции</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Номер на маса (по желание)
                      </label>
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="Напр. 5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Бележки (по желание)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Специални изисквания, алергии и т.н."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          {recipe.instructions && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-3">Инструкции за приготвяне</h3>
              <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {recipe.instructions}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Отказ
            </button>
            
            {paymentMethod === 'cart' ? (
              <button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 ${
                  isInCart 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{isInCart ? 'Вече в количката' : 'Добави в количката'}</span>
              </button>
            ) : (
              <button
                onClick={handleAddToKitchen}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <ChefHat className="w-5 h-5" />
                <span>Добави в кухнята</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipePaymentModal; 