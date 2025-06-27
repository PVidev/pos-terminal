import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag, Palette } from 'lucide-react';
import { Category } from '../types';

interface CategoryManagementProps {
  categories: Category[];
  onAdd: (category: Omit<Category, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Category>) => void;
  onDelete: (id: string) => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue'
  });

  const colors = [
    { name: 'blue', label: 'Синьо', class: 'bg-blue-600' },
    { name: 'green', label: 'Зелено', class: 'bg-green-600' },
    { name: 'purple', label: 'Лилаво', class: 'bg-purple-600' },
    { name: 'red', label: 'Червено', class: 'bg-red-600' },
    { name: 'yellow', label: 'Жълто', class: 'bg-yellow-600' },
    { name: 'pink', label: 'Розово', class: 'bg-pink-600' },
    { name: 'indigo', label: 'Индиго', class: 'bg-indigo-600' },
    { name: 'orange', label: 'Оранжево', class: 'bg-orange-600' }
  ];

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || 'blue'
    });
    setShowForm(true);
  };

  const handleDelete = (category: Category) => {
    if (window.confirm(`Сигурни ли сте, че искате да изтриете категорията "${category.name}"?`)) {
      onDelete(category.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color
    };

    if (editingCategory) {
      onUpdate(editingCategory.id, categoryData);
    } else {
      onAdd(categoryData);
    }

    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: 'blue' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: 'blue' });
  };

  const getColorClass = (color: string) => {
    return colors.find(c => c.name === color)?.class || 'bg-blue-600';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Управление на категории</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Добави категория</span>
        </button>
      </div>

      {/* Category Form */}
      {showForm && (
        <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
          <h4 className="text-white font-medium mb-4">
            {editingCategory ? 'Редактиране на категория' : 'Добавяне на категория'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Име на категорията *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  placeholder="Въведи име на категорията"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Цвят
                </label>
                <div className="flex space-x-2">
                  {colors.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.name }))}
                      className={`w-8 h-8 rounded-full ${color.class} ${
                        formData.color === color.name ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-700' : ''
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                placeholder="Кратко описание на категорията"
                rows={2}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {editingCategory ? 'Запази промените' : 'Добави категория'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Отказ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Няма създадени категории</p>
            <p className="text-sm">Добавете първата категория за започване</p>
          </div>
        ) : (
          categories.map(category => (
            <div
              key={category.id}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors border border-gray-600"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${getColorClass(category.color || 'blue')}`} />
                  <h4 className="font-medium text-white">{category.name}</h4>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-600 hover:bg-opacity-20 rounded transition-colors"
                    title="Редактиране"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-600 hover:bg-opacity-20 rounded transition-colors"
                    title="Изтриване"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-gray-400 text-sm">{category.description}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Общо категории: {categories.length}</span>
        </div>
      </div>
    </div>
  );
};