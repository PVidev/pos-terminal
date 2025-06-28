import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Transaction } from '../types';

interface ReceiptModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

const FIRM_INFO = {
  name: 'Наименование на задължено лице',
  address: 'АДРЕС НА задължено лице',
  eik: '123456789',
  object: 'ОБМЕННО БЮРО',
  objectAddress: 'АДРЕС НА ОБЕКТ',
  vat: 'BG123456789',
  operatorCode: '0001',
  operatorName: '', // ще се попълва динамично
  unp: 'XX123456-0001-0000001',
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

const pad = (str: string, len: number, right = false) => {
  if (str.length >= len) return str;
  return right ? str.padEnd(len, ' ') : str.padStart(len, ' ');
};

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ 
  transaction, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  // Данни за бележката
  const firm = FIRM_INFO;
  const operator = transaction.operatorName || 'Оператор';
  const bordero = '000001';
  const client = '';
  const clientEik = '';
  const clientAddress = '';
  const currency = 'EUR';
  const rate = 1.95583;
  const totalEur = (transaction.total / rate).toFixed(2);
  const totalBgn = transaction.total.toFixed(2);
  const paymentMethod = {
    cash: 'В БРОЙ ЛВ.',
    card: 'КАРТА',
    digital: 'ДИГИТАЛНО',
  }[transaction.paymentMethod] || 'В БРОЙ ЛВ.';
  const dateStr = formatDate(transaction.timestamp);
  const bonNumber = transaction.id.slice(-6).padStart(6, '0');
  const sha1 = 'SHA-1 контролно число"';
  const qr = 'https://example.com';
  
  // Общ брой артикули (сума от количествата)
  const totalItems = transaction.items.reduce((sum, item) => sum + item.quantity, 0);

  // Продуктите се изписват като валутна операция (пример)
  const productLines = transaction.items.map(item => {
    const line = `${item.name} ${item.quantity} x ${(item.price / rate).toFixed(2)}`;
    const sum = (item.price * item.quantity).toFixed(2);
    return `${pad(line, 30, true)}${pad(sum, 8)}`;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4 max-h-[95vh] overflow-y-auto border border-gray-300 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold font-mono">ФИСКАЛЕН БОН</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div
          className="font-mono text-xs whitespace-pre text-black bg-white px-2 py-1 rounded"
          style={{ letterSpacing: '0.01em', fontFamily: 'monospace' }}
        >
{`
${firm.name}
${firm.address}
ЕИК ${firm.eik}
${firm.object}
${firm.objectAddress}
ЗДДС N ${firm.vat}
#${firm.operatorCode}    ${operator.padEnd(20)}    ${firm.operatorCode}
УНП: ${firm.unp}

#
#БОРДЕРО № ${bordero}
#ПУНКТ:
#..........
#КАСИЕР:
#..........
#КЛИЕНТ:..........
#КЛИЕНТ ЕИК:..........
#АДРЕС:..........
#${currency} Продава
${productLines.join('\n')}
----------------------------------------
ОБЩА СУМА${pad(totalBgn, 32)}
${paymentMethod.padEnd(40)}${totalBgn}
#В ЕВРО
ОБЩА СУММА${pad(totalEur, 32)}
${paymentMethod.padEnd(40)}${totalEur}
#ВАЛУТЕН КАСИЕР
#
#КЛИЕНТ
#
${bonNumber}    ${dateStr} ${totalItems} АРТИКУЛ

[ QR КОД ]

ФИСКАЛЕН БОН

${firm.unp}    ${sha1}
`}
        </div>
        <div className="flex space-x-3 mt-4">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Разпечатай</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Затвори</span>
          </button>
        </div>
      </div>
    </div>
  );
};