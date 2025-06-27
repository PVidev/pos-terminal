import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  Trash2,
  Plus,
  Zap
} from 'lucide-react';
import { RevisionDifference } from '../types';

interface AutomaticAction {
  id: string;
  name: string;
  description: string;
  conditions: {
    type: 'difference_threshold' | 'frequency' | 'category' | 'product';
    operator: 'greater_than' | 'less_than' | 'equals' | 'contains';
    value: string | number;
    category?: string;
    productId?: string;
  }[];
  actions: {
    type: 'notification' | 'auto_order' | 'adjustment' | 'investigation';
    value?: string | number;
    message?: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

interface AutomaticActionsProps {
  differences: RevisionDifference[];
  onUpdateDifferenceAction: (differenceId: string, action: RevisionDifference['action'], reason?: string) => void;
}

export const AutomaticActions: React.FC<AutomaticActionsProps> = ({
  differences,
  onUpdateDifferenceAction
}) => {
  const [actions, setActions] = useState<AutomaticAction[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAction, setEditingAction] = useState<AutomaticAction | null>(null);
  const [newAction, setNewAction] = useState<Partial<AutomaticAction>>({
    name: '',
    description: '',
    conditions: [],
    actions: [],
    isActive: true
  });

  // Зареждане на запазените действия
  useEffect(() => {
    const savedActions = localStorage.getItem('automaticActions');
    if (savedActions) {
      setActions(JSON.parse(savedActions));
    }
  }, []);

  // Запазване на действията
  const saveActions = (updatedActions: AutomaticAction[]) => {
    setActions(updatedActions);
    localStorage.setItem('automaticActions', JSON.stringify(updatedActions));
  };

  // Проверка на условията
  const checkConditions = (action: AutomaticAction, difference: RevisionDifference): boolean => {
    return action.conditions.every(condition => {
      switch (condition.type) {
        case 'difference_threshold':
          const threshold = Number(condition.value);
          if (condition.operator === 'greater_than') {
            return Math.abs(difference.difference) > threshold;
          } else if (condition.operator === 'less_than') {
            return Math.abs(difference.difference) < threshold;
          }
          break;
        
        case 'frequency':
          const frequency = Number(condition.value);
          const productDifferences = differences.filter(d => d.productId === difference.productId);
          if (condition.operator === 'greater_than') {
            return productDifferences.length > frequency;
          } else if (condition.operator === 'less_than') {
            return productDifferences.length < frequency;
          }
          break;
        
        case 'category':
          if (condition.operator === 'equals') {
            return difference.category === condition.value;
          } else if (condition.operator === 'contains') {
            return difference.category.includes(condition.value as string);
          }
          break;
        
        case 'product':
          return difference.productId === condition.productId;
      }
      return false;
    });
  };

  // Изпълнение на автоматични действия
  const executeActions = (action: AutomaticAction, difference: RevisionDifference) => {
    const updatedAction = {
      ...action,
      lastTriggered: new Date(),
      triggerCount: action.triggerCount + 1
    };

    // Обновяване на действието
    const updatedActions = actions.map(a => a.id === action.id ? updatedAction : a);
    saveActions(updatedActions);

    // Изпълнение на действията
    action.actions.forEach(actionItem => {
      switch (actionItem.type) {
        case 'notification':
          // Показване на известие
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Автоматично действие', {
              body: actionItem.message || `Действие "${action.name}" е изпълнено за ${difference.productName}`,
              icon: '/favicon.ico'
            });
          }
          break;
        
        case 'auto_order':
          // Автоматична поръчка
          const orderQuantity = actionItem.value ? Number(actionItem.value) : Math.abs(difference.difference);
          onUpdateDifferenceAction(difference.id, 'order', `Автоматична поръчка: ${orderQuantity} бр.`);
          break;
        
        case 'adjustment':
          // Автоматично коригиране
          onUpdateDifferenceAction(difference.id, 'adjustment', 'Автоматично коригиране на склада');
          break;
        
        case 'investigation':
          // Автоматично разследване
          onUpdateDifferenceAction(difference.id, 'investigation', 'Автоматично разследване');
          break;
      }
    });
  };

  // Проверка на нови разлики за автоматични действия
  useEffect(() => {
    differences.forEach(difference => {
      actions.filter(action => action.isActive).forEach(action => {
        if (checkConditions(action, difference)) {
          executeActions(action, difference);
        }
      });
    });
  }, [differences]);

  // Заявка за разрешение за известия
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  // Добавяне на условие
  const addCondition = () => {
    setNewAction(prev => ({
      ...prev,
      conditions: [...(prev.conditions || []), {
        type: 'difference_threshold',
        operator: 'greater_than',
        value: 0
      }]
    }));
  };

  // Добавяне на действие
  const addAction = () => {
    setNewAction(prev => ({
      ...prev,
      actions: [...(prev.actions || []), {
        type: 'notification',
        message: ''
      }]
    }));
  };

  // Запазване на ново действие
  const saveNewAction = () => {
    if (!newAction.name || !newAction.description) return;

    const action: AutomaticAction = {
      id: Date.now().toString(),
      name: newAction.name,
      description: newAction.description,
      conditions: newAction.conditions || [],
      actions: newAction.actions || [],
      isActive: newAction.isActive || true,
      createdAt: new Date(),
      triggerCount: 0
    };

    saveActions([...actions, action]);
    setNewAction({
      name: '',
      description: '',
      conditions: [],
      actions: [],
      isActive: true
    });
    setIsCreating(false);
  };

  // Изтриване на действие
  const deleteAction = (actionId: string) => {
    saveActions(actions.filter(a => a.id !== actionId));
  };

  // Превключване на активност
  const toggleAction = (actionId: string) => {
    const updatedActions = actions.map(a => 
      a.id === actionId ? { ...a, isActive: !a.isActive } : a
    );
    saveActions(updatedActions);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Автоматични действия</h1>
          <p className="text-gray-400">Настройка на автоматични действия при разлики в склада</p>
        </div>

        {/* Notification Permission */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Известия</h3>
                <p className="text-gray-400 text-sm">Получавайте известия за автоматични действия</p>
              </div>
            </div>
            <button
              onClick={requestNotificationPermission}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Разреши известия
            </button>
          </div>
        </div>

        {/* Actions List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Настроени действия</h2>
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Ново действие</span>
              </button>
            </div>
          </div>

          {actions.length === 0 ? (
            <div className="p-12 text-center">
              <Settings className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Няма настроени автоматични действия</p>
              <p className="text-gray-500 text-sm">Създайте първото действие за да започнете</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {actions.map(action => (
                <div key={action.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{action.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          action.isActive 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {action.isActive ? 'Активно' : 'Неактивно'}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-4">{action.description}</p>
                      
                      {/* Conditions */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Условия:</h4>
                        <div className="space-y-2">
                          {action.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <AlertTriangle className="w-4 h-4 text-orange-400" />
                              <span className="text-gray-300">
                                {condition.type === 'difference_threshold' && `Разлика ${condition.operator === 'greater_than' ? '>' : '<'} ${condition.value}`}
                                {condition.type === 'frequency' && `Честота ${condition.operator === 'greater_than' ? '>' : '<'} ${condition.value}`}
                                {condition.type === 'category' && `Категория ${condition.operator === 'equals' ? '=' : 'съдържа'} ${condition.value}`}
                                {condition.type === 'product' && 'Конкретен продукт'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Действия:</h4>
                        <div className="space-y-2">
                          {action.actions.map((actionItem, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <Zap className="w-4 h-4 text-blue-400" />
                              <span className="text-gray-300">
                                {actionItem.type === 'notification' && 'Известие'}
                                {actionItem.type === 'auto_order' && `Автоматична поръчка: ${actionItem.value} бр.`}
                                {actionItem.type === 'adjustment' && 'Коригиране на склада'}
                                {actionItem.type === 'investigation' && 'Разследване'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Създадено: {new Date(action.createdAt).toLocaleDateString('bg-BG')}</span>
                        </div>
                        {action.lastTriggered && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>Последно: {new Date(action.lastTriggered).toLocaleDateString('bg-BG')}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>Изпълнено: {action.triggerCount} пъти</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleAction(action.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          action.isActive 
                            ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {action.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteAction(action.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create New Action Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Ново автоматично действие</h2>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Име на действието
                    </label>
                    <input
                      type="text"
                      value={newAction.name}
                      onChange={(e) => setNewAction(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder="Например: Автоматична поръчка при голяма разлика"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Описание
                    </label>
                    <textarea
                      value={newAction.description}
                      onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      rows={3}
                      placeholder="Обяснете кога и какво трябва да се случи..."
                    />
                  </div>

                  {/* Conditions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Условия</h3>
                      <button
                        onClick={addCondition}
                        className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Добави условие</span>
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(newAction.conditions || []).map((condition, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg">
                          <select
                            value={condition.type}
                            onChange={(e) => {
                              const updatedConditions = [...(newAction.conditions || [])];
                              updatedConditions[index].type = e.target.value as any;
                              setNewAction(prev => ({ ...prev, conditions: updatedConditions }));
                            }}
                            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          >
                            <option value="difference_threshold">Разлика в склада</option>
                            <option value="frequency">Честота на разлики</option>
                            <option value="category">Категория</option>
                            <option value="product">Конкретен продукт</option>
                          </select>
                          
                          <select
                            value={condition.operator}
                            onChange={(e) => {
                              const updatedConditions = [...(newAction.conditions || [])];
                              updatedConditions[index].operator = e.target.value as any;
                              setNewAction(prev => ({ ...prev, conditions: updatedConditions }));
                            }}
                            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          >
                            <option value="greater_than">по-голямо от</option>
                            <option value="less_than">по-малко от</option>
                            <option value="equals">равно на</option>
                            <option value="contains">съдържа</option>
                          </select>
                          
                          <input
                            type="text"
                            value={condition.value}
                            onChange={(e) => {
                              const updatedConditions = [...(newAction.conditions || [])];
                              updatedConditions[index].value = e.target.value;
                              setNewAction(prev => ({ ...prev, conditions: updatedConditions }));
                            }}
                            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            placeholder="Стойност"
                          />
                          
                          <button
                            onClick={() => {
                              const updatedConditions = (newAction.conditions || []).filter((_, i) => i !== index);
                              setNewAction(prev => ({ ...prev, conditions: updatedConditions }));
                            }}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Действия</h3>
                      <button
                        onClick={addAction}
                        className="flex items-center space-x-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Добави действие</span>
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(newAction.actions || []).map((actionItem, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg">
                          <select
                            value={actionItem.type}
                            onChange={(e) => {
                              const updatedActions = [...(newAction.actions || [])];
                              updatedActions[index].type = e.target.value as any;
                              setNewAction(prev => ({ ...prev, actions: updatedActions }));
                            }}
                            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          >
                            <option value="notification">Известие</option>
                            <option value="auto_order">Автоматична поръчка</option>
                            <option value="adjustment">Коригиране на склада</option>
                            <option value="investigation">Разследване</option>
                          </select>
                          
                          {actionItem.type === 'auto_order' && (
                            <input
                              type="number"
                              value={actionItem.value || ''}
                              onChange={(e) => {
                                const updatedActions = [...(newAction.actions || [])];
                                updatedActions[index].value = e.target.value;
                                setNewAction(prev => ({ ...prev, actions: updatedActions }));
                              }}
                              className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                              placeholder="Количество"
                            />
                          )}
                          
                          {actionItem.type === 'notification' && (
                            <input
                              type="text"
                              value={actionItem.message || ''}
                              onChange={(e) => {
                                const updatedActions = [...(newAction.actions || [])];
                                updatedActions[index].message = e.target.value;
                                setNewAction(prev => ({ ...prev, actions: updatedActions }));
                              }}
                              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                              placeholder="Съобщение"
                            />
                          )}
                          
                          <button
                            onClick={() => {
                              const updatedActions = (newAction.actions || []).filter((_, i) => i !== index);
                              setNewAction(prev => ({ ...prev, actions: updatedActions }));
                            }}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-700">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      Отказ
                    </button>
                    <button
                      onClick={saveNewAction}
                      disabled={!newAction.name || !newAction.description}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      Запази действие
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 