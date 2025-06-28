import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

export type RoleType = 'Касиер' | 'Мениджър обект' | 'Админ' | 'Куриер';

export interface UserProfile {
  id: string;
  role: RoleType;
  name: string;
  phone: string;
  pin: string;
}

interface RolesModalProps {
  open: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  onAddProfile: (profile: Omit<UserProfile, 'id'>) => void;
  onDeleteProfile?: (id: string) => void;
}

export const RolesModal: React.FC<RolesModalProps> = ({ open, onClose, profiles, onAddProfile, onDeleteProfile }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Omit<UserProfile, 'id'>>({
    role: 'Касиер',
    name: '',
    phone: '',
    pin: ''
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Потребителски роли</h2>
        <div className="mb-6">
          {profiles.length === 0 ? (
            <div className="text-gray-500 text-center">Няма добавени профили.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {profiles.map((profile) => (
                <li key={profile.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between group">
                  <div>
                    <span className="font-semibold text-gray-800">{profile.role}:</span> {profile.name}<br/>
                    <span className="text-gray-500 text-sm">тел. {profile.phone}</span>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 md:mt-0">
                    <span className="bg-gray-100 px-3 py-1 rounded text-gray-700 font-mono">ПИН: {profile.pin}</span>
                    {onDeleteProfile && (
                      <button
                        className="ml-2 p-2 rounded hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors"
                        title="Изтрий профила"
                        onClick={() => setDeleteId(profile.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {showAdd ? (
          <form
            className="space-y-3"
            onSubmit={e => {
              e.preventDefault();
              if (form.name && form.phone && form.pin) {
                onAddProfile(form);
                setForm({ role: 'Касиер', name: '', phone: '', pin: '' });
                setShowAdd(false);
              }
            }}
          >
            <div>
              <label className="block text-gray-700 font-medium mb-1">Роля</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as RoleType }))}
              >
                <option value="Касиер">Касиер</option>
                <option value="Мениджър обект">Мениджър обект</option>
                <option value="Админ">Админ</option>
                <option value="Куриер">Куриер</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Име</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Телефон</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">ПИН код</label>
              <input
                className="w-full border rounded px-3 py-2 font-mono"
                value={form.pin}
                onChange={e => setForm(f => ({ ...f, pin: e.target.value }))}
                required
                maxLength={8}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowAdd(false)}
              >
                Отказ
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                Запази
              </button>
            </div>
          </form>
        ) : (
          <div className="flex justify-center">
            <button
              className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              onClick={() => setShowAdd(true)}
            >
              + Добави профил
            </button>
          </div>
        )}
        {/* Потвърждение за триене */}
        {deleteId && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full">
              <div className="text-lg font-semibold mb-4 text-center">Сигурни ли сте, че искате да изтриете този профил?</div>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setDeleteId(null)}
                >
                  Отказ
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => { onDeleteProfile && onDeleteProfile(deleteId); setDeleteId(null); }}
                >
                  Изтрий
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 