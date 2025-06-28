import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, BarChart3, Settings, User, Package, FileText, History, TrendingUp, Zap } from 'lucide-react';
import { UserProfile } from './RolesModal';

interface NavigationProps {
  activeView: 'pos' | 'dashboard' | 'settings' | 'inventory' | 'orders' | 'revision-history' | 'analytics' | 'automatic-actions';
  onViewChange: (view: 'pos' | 'dashboard' | 'settings' | 'inventory' | 'orders' | 'revision-history' | 'analytics' | 'automatic-actions') => void;
  cartItemsCount: number;
  newOrdersCount: number;
  onOpenRolesModal?: () => void;
  allowedViews?: string[];
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeView, 
  onViewChange, 
  cartItemsCount,
  newOrdersCount,
  onOpenRolesModal,
  allowedViews,
  currentUser,
  onLogout
}) => {
  const menuItems = [
    { id: 'pos' as const, name: 'POS', icon: ShoppingCart },
    { id: 'dashboard' as const, name: 'Дашборд', icon: BarChart3 },
    { id: 'inventory' as const, name: 'Наличност', icon: Package },
    { id: 'orders' as const, name: 'Поръчки', icon: FileText, hasNotification: newOrdersCount > 0 },
    { id: 'revision-history' as const, name: 'История', icon: History },
    { id: 'analytics' as const, name: 'Анализи', icon: TrendingUp },
    { id: 'automatic-actions' as const, name: 'Автоматика', icon: Zap },
    { id: 'settings' as const, name: 'ПиК', icon: Settings }
  ];

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 p-3 rounded-lg">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">POS Система</h1>
                <p className="text-gray-400 text-sm">Модерен терминал</p>
              </div>
            </div>
            
            <div className="flex space-x-2 overflow-x-auto">
              {menuItems.filter(item => !allowedViews || allowedViews.includes(item.id)).map(item => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-200 min-h-[48px] whitespace-nowrap relative ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } ${item.hasNotification ? 'animate-pulse-red' : ''}`}
                  >
                    <div className="relative">
                      <IconComponent className="w-5 h-5" />
                      {item.id === 'pos' && cartItemsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {cartItemsCount}
                        </span>
                      )}
                      {item.id === 'orders' && newOrdersCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                          {newOrdersCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-base">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 relative" ref={profileMenuRef}>
            {currentUser && (
              <div className="text-right mr-2">
                <div className="text-white font-semibold">{currentUser.name}</div>
                <div className="text-emerald-400 text-xs">{currentUser.role}</div>
              </div>
            )}
            <button
              className="p-3 hover:bg-gray-800 rounded-lg transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
              onClick={() => setProfileMenuOpen((open) => !open)}
            >
              <User className="w-6 h-6 text-gray-300" />
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200 animate-fade-in">
                <ul className="py-2">
                  {currentUser && currentUser.role === 'Админ' ? (
                    <>
                      <li>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 font-medium">Система</button>
                      </li>
                      <li>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 font-medium" onClick={() => { setProfileMenuOpen(false); onOpenRolesModal && onOpenRolesModal(); }}>Роли</button>
                      </li>
                      <li>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 font-medium">Отчети</button>
                      </li>
                      <li>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 font-medium">Информация</button>
                      </li>
                      <li>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-medium" onClick={() => { setProfileMenuOpen(false); onLogout && onLogout(); }}>Излез</button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-medium" onClick={() => { setProfileMenuOpen(false); onLogout && onLogout(); }}>Излез</button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};