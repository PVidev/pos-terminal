import React from 'react';

interface LegalWarningProps {
  show: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const LegalWarning: React.FC<LegalWarningProps> = ({ show, onAccept, onDecline }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            ⚠️ ПРАВНО ПРЕДУПРЕЖДЕНИЕ
          </h2>
          <div className="w-16 h-1 bg-red-600 mx-auto"></div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="font-semibold text-red-800">
              ВНИМАНИЕ: Този софтуер е строго защитен от авторски права!
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800">СТРОГО ЗАБРАНЕНО:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Копиране, модификация или разпространяване на кода</li>
              <li>Използване без валиден лиценз</li>
              <li>Тестване или демонстрация без разрешение</li>
              <li>Обратна инженерия или декомпилиране</li>
              <li>Използване в бизнес среда без лиценз</li>
              <li>Сваляне или инсталиране без разрешение</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800">ПРАВНИ ПОСЛЕДИЦИ:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>До 5 години лишаване от свобода за нарушение на авторски права</li>
              <li>Глоби до 50,000 лв. за търговско използване без лиценз</li>
              <li>Неограничени граждански щети и разходи за адвокати</li>
              <li>Конфискация на всички копия и оборудване</li>
              <li>Публикация на нарушителя в медиите</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="font-semibold text-yellow-800">
              ⚡ Всяко нарушение ще бъде автоматично детектирано и преследвано по закон!
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800">ЗА ЛЕГАЛНО ИЗПОЛЗВАНЕ:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Заявете за лиценз на: license@pos-system.com</li>
              <li>Телефон за лицензиране: +359 888 123 456</li>
              <li>Уебсайт: https://pos-system.com/license</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-blue-800">
              <strong>Декларация:</strong> Сваляйки или използвайки този софтуер, 
              вие потвърждавате, че сте прочели и разбирате всички условия на лиценза 
              и се съгласявате да ги спазвате.
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onDecline}
            className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ❌ ОТКАЗВАМ СЕ
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ✅ ПРИЕМАМ УСЛОВИЯТА
          </button>
        </div>

        <div className="text-center mt-4 text-xs text-gray-500">
          <p>
            © 2024 ПОС КУХНЕНСКА СИСТЕМА - Всички права запазени
          </p>
          <p>
            Защитена търговска марка. Всички нарушители ще бъдат преследвани по закон.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalWarning; 