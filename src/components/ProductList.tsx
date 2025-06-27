import React, { useState } from 'react';
import { Edit, Trash2, Package, Search, Percent } from 'lucide-react';
import { Product, Category } from '../types';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  categories,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всички');

  const categoryNames = ['Всички', ...categories.map(c => c.name)];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Всички' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price * (1 - discount / 100);
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`Сигурни ли сте, че искате да изтриете "${product.name}"?`)) {
      onDelete(product.id);
    }
  };

  return (
    <div className="p-6">
      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Търсене на продукти..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
        >
          {categoryNames.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Няма намерени продукти</p>
            <p className="text-sm">Опитайте с различни критерии за търсене</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const discountedPrice = getDiscountedPrice(product.price, product.discount);
            const hasDiscount = product.discount && product.discount > 0;

            return (
              <div
                key={product.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors border border-gray-600"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-white text-sm truncate">
                          {product.name}
                        </h3>
                        <p className="text-gray-400 text-xs">{product.category}</p>
                      </div>
                      
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-600 hover:bg-opacity-20 rounded transition-colors"
                          title="Редактиране"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-600 hover:bg-opacity-20 rounded transition-colors"
                          title="Изтриване"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {hasDiscount ? (
                          <div className="flex items-center space-x-1">
                            <span className="text-emerald-400 font-bold text-sm">
                              {discountedPrice.toFixed(2)} лв
                            </span>
                            <span className="text-gray-500 line-through text-xs">
                              {product.price.toFixed(2)} лв
                            </span>
                            <div className="bg-red-600 text-white px-1 py-0.5 rounded text-xs flex items-center">
                              <Percent className="w-2 h-2 mr-0.5" />
                              {product.discount}
                            </div>
                          </div>
                        ) : (
                          <span className="text-emerald-400 font-bold text-sm">
                            {product.price.toFixed(2)} лв
                          </span>
                        )}
                      </div>
                      
                      {product.stock !== undefined && (
                        <span className="text-gray-400 text-xs">
                          {product.stock > 0 ? `${product.stock} бр.` : 'Изчерпан'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Общо продукти: {filteredProducts.length}</span>
          <span>Показани: {filteredProducts.length} от {products.length}</span>
        </div>
      </div>
    </div>
  );
};