import React, { useState } from 'react';
import { Search, Plus, Package, Percent, AlertTriangle } from 'lucide-react';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всички');

  const categories = ['Всички', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Всички' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price * (1 - discount / 100);
  };

  const getStockStatus = (stock?: number) => {
    if (stock === undefined) return { status: 'unknown', color: 'text-gray-500', bgColor: 'bg-gray-700' };
    if (stock <= 0) return { status: 'out', color: 'text-red-400', bgColor: 'bg-red-600' };
    if (stock <= 5) return { status: 'low', color: 'text-orange-400', bgColor: 'bg-orange-600' };
    if (stock <= 10) return { status: 'medium', color: 'text-yellow-400', bgColor: 'bg-yellow-600' };
    return { status: 'good', color: 'text-green-400', bgColor: 'bg-green-600' };
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Търсене на продукти..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-lg"
            />
          </div>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-4 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 min-h-[48px] flex items-center ${
                selectedCategory === category
                  ? 'bg-emerald-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 active:scale-95'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Touch-optimized product grid - responsive for tablets */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => {
          const discountedPrice = getDiscountedPrice(product.price, product.discount);
          const hasDiscount = product.discount && product.discount > 0;
          const isOutOfStock = product.stock !== undefined && product.stock <= 0;
          const stockStatus = getStockStatus(product.stock);

          return (
            <div
              key={product.id}
              className={`bg-gray-800 rounded-xl p-4 transition-all duration-200 cursor-pointer group border-2 border-gray-700 hover:border-emerald-600 hover:shadow-xl active:scale-95 ${
                isOutOfStock ? 'opacity-50' : ''
              } ${
                stockStatus.status === 'low' ? 'border-orange-500 bg-orange-900/20' : ''
              } ${
                stockStatus.status === 'out' ? 'border-red-500 bg-red-900/20' : ''
              }`}
              onClick={() => !isOutOfStock && onAddToCart(product)}
            >
              <div className="flex flex-col h-full">
                <div className="mb-4 flex-1 relative">
                  {/* Larger image container for better touch experience */}
                  <div className="w-full h-32 bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-500" />
                    )}
                  </div>
                  
                  {hasDiscount && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                      <Percent className="w-3 h-3 mr-1" />
                      {product.discount}
                    </div>
                  )}

                  {/* Stock warning indicator - само за изчерпани продукти */}
                  {isOutOfStock && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Изчерпан
                    </div>
                  )}
                  
                  {/* Larger text for better readability */}
                  <h3 className="font-semibold text-white text-base group-hover:text-emerald-400 transition-colors leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{product.category}</p>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    {hasDiscount ? (
                      <>
                        <span className="text-emerald-400 font-bold text-xl">
                          {discountedPrice.toFixed(2)} лв
                        </span>
                        <span className="text-gray-500 line-through text-sm">
                          {product.price.toFixed(2)} лв
                        </span>
                      </>
                    ) : (
                      <span className="text-emerald-400 font-bold text-xl">
                        {product.price.toFixed(2)} лв
                      </span>
                    )}
                  </div>
                  
                  {/* Larger touch-friendly button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isOutOfStock) onAddToCart(product);
                    }}
                    disabled={isOutOfStock}
                    className={`p-4 rounded-xl transition-all duration-200 group-hover:scale-110 transform active:scale-95 min-w-[56px] min-h-[56px] flex items-center justify-center ${
                      isOutOfStock 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-emerald-600/25'
                    }`}
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </button>
                </div>
                
                {product.stock !== undefined && (
                  <div className="mt-3 text-sm text-center">
                    <span className={`font-medium ${stockStatus.color}`}>
                      {isOutOfStock ? 'Изчерпан' : `Налични: ${product.stock}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Package className="w-20 h-20 mx-auto mb-4 opacity-50" />
          <p className="text-xl mb-2">Няма намерени продукти</p>
          <p className="text-sm">Опитайте с различни критерии за търсене</p>
        </div>
      )}
    </div>
  );
};