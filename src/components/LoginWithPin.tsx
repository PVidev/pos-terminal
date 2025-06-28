import React, { useState } from 'react';
import { UserProfile } from './RolesModal';
import { Key } from 'lucide-react';

interface LoginWithPinProps {
  profiles: UserProfile[];
  onLogin: (profile: UserProfile) => void;
}

export const LoginWithPin: React.FC<LoginWithPinProps> = ({ profiles, onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = profiles.find(p => p.pin === pin.trim());
    if (found) {
      setError('');
      onLogin(found);
      setPin('');
    } else {
      setError('Невалиден ПИН код!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-xs flex flex-col items-center border border-gray-700"
      >
        <div className="bg-emerald-600 p-4 rounded-full mb-4">
          <Key className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">Вход с ПИН</h2>
        <p className="text-gray-400 mb-6 text-center">Въведете вашия ПИН код за достъп до системата</p>
        <input
          type="password"
          className="w-full px-4 py-3 border border-gray-700 bg-gray-900 rounded-xl text-center text-2xl font-mono mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white placeholder-gray-500"
          placeholder="ПИН код"
          value={pin}
          onChange={e => setPin(e.target.value)}
          maxLength={8}
          autoFocus
        />
        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 mt-2 bg-emerald-600 text-white rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors"
        >
          Вход
        </button>
      </form>
    </div>
  );
}; 