import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Download,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { InventoryRevision, RevisionDifference } from '../types';

interface RevisionHistoryProps {
  revisions: InventoryRevision[];
  differences: RevisionDifference[];
  onViewRevision: (revision: InventoryRevision) => void;
  onUpdateDifferenceAction: (differenceId: string, action: RevisionDifference['action'], reason?: string) => void;
}

interface RevisionDetailsModalProps {
  revision: InventoryRevision | null;
  differences: RevisionDifference[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateDifferenceAction: (differenceId: string, action: RevisionDifference['action'], reason?: string) => void;
}

const RevisionDetailsModal: React.FC<RevisionDetailsModalProps> = ({
  revision,
  differences,
  isOpen,
  onClose,
  onUpdateDifferenceAction
}) => {
  const [selectedDifference, setSelectedDifference] = useState<RevisionDifference | null>(null);
  const [actionReason, setActionReason] = useState('');

  if (!isOpen || !revision) return null;

  const handleUpdateAction = (action: RevisionDifference['action']) => {
    if (selectedDifference) {
      onUpdateDifferenceAction(selectedDifference.id, action, actionReason);
      setSelectedDifference(null);
      setActionReason('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Ревизия #{revision.id}</h2>
              <p className="text-gray-400">
                {new Date(revision.timestamp).toLocaleDateString('bg-BG')} - {new Date(revision.timestamp).toLocaleTimeString('bg-BG')}
              </p>
              <p className="text-gray-400">Извършена от: {revision.performedBy}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Общо продукти</p>
                  <p className="text-white font-bold">{revision.summary.totalProducts}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-gray-400 text-sm">С разлики</p>
                  <p className="text-orange-400 font-bold">{revision.summary.productsWithDifferences}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-gray-400 text-sm">Общо разлики</p>
                  <p className="text-red-400 font-bold">{revision.summary.totalDifferences}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-gray-400 text-sm">Поръчани</p>
                  <p className="text-emerald-400 font-bold">{revision.summary.totalOrdered}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Differences Table */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Разлики в ревизията</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Продукт</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-300">Очаквано</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-300">Реално</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-300">Разлика</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-300">%</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-300">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {differences.map(diff => (
                    <tr key={diff.id} className="hover:bg-gray-600 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">{diff.productName}</p>
                          <p className="text-gray-400 text-sm">{diff.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-300">{diff.expectedStock}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-300">{diff.actualStock}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${
                          diff.difference > 0 ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {diff.difference > 0 ? '+' : ''}{diff.difference}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-300">{diff.percentageDifference.toFixed(1)}%</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedDifference(diff)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                          {diff.action === 'investigation' ? 'Разследване' :
                           diff.action === 'order' ? 'Поръчка' :
                           diff.action === 'adjustment' ? 'Коригиране' : 'Действие'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Modal */}
          {selectedDifference && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="bg-gray-700 rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Действие за {selectedDifference.productName}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Причина/Бележка
                    </label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      rows={3}
                      placeholder="Обяснете защо се е появила разликата..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdateAction('investigation')}
                      className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
                    >
                      Разследване
                    </button>
                    <button
                      onClick={() => handleUpdateAction('order')}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      Поръчка
                    </button>
                    <button
                      onClick={() => handleUpdateAction('adjustment')}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm transition-colors"
                    >
                      Коригиране
                    </button>
                    <button
                      onClick={() => handleUpdateAction('none')}
                      className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                    >
                      Без действие
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setSelectedDifference(null)}
                    className="w-full p-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                  >
                    Отказ
                  </button>
                </div>
              </div>
            </div>
          )}

          {revision.notes && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Бележки</h3>
              <p className="text-gray-300">{revision.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RevisionHistory: React.FC<RevisionHistoryProps> = ({
  revisions,
  differences,
  onViewRevision,
  onUpdateDifferenceAction
}) => {
  const [selectedRevision, setSelectedRevision] = useState<InventoryRevision | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterByDifferences, setFilterByDifferences] = useState(false);

  const filteredRevisions = revisions.filter(revision => {
    const matchesSearch = revision.id.includes(searchTerm) || 
                         revision.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         revision.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDateRange = (!startDate || new Date(revision.timestamp) >= new Date(startDate)) &&
                            (!endDate || new Date(revision.timestamp) <= new Date(endDate));
    
    const matchesDifferences = !filterByDifferences || revision.summary.productsWithDifferences > 0;
    
    return matchesSearch && matchesDateRange && matchesDifferences;
  });

  const handleRevisionClick = (revision: InventoryRevision) => {
    setSelectedRevision(revision);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRevision(null);
  };

  const getRevisionDifferences = (revisionId: string) => {
    return differences.filter(diff => diff.revisionId === revisionId);
  };

  const getDifferenceIcon = (difference: number) => {
    if (difference > 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    if (difference < 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    return <Package className="w-4 h-4 text-gray-400" />;
  };

  const getDifferenceColor = (difference: number) => {
    if (difference > 0) return 'text-red-400';
    if (difference < 0) return 'text-green-400';
    return 'text-gray-400';
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">История на ревизиите</h1>
          <p className="text-gray-400">Проследяване на всички ревизии и разлики в склада</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Търсене
              </label>
              <input
                type="text"
                placeholder="Търсене по номер, извършител или продукт..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                От дата
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                До дата
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filterByDifferences}
                  onChange={(e) => setFilterByDifferences(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-gray-700 border-gray-600 rounded focus:ring-emerald-600"
                />
                <span className="text-sm text-gray-300">Само с разлики</span>
              </label>
            </div>
          </div>
        </div>

        {/* Revisions List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {filteredRevisions.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Няма намерени ревизии</p>
              <p className="text-gray-500 text-sm">Опитайте с различни критерии за търсене</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Ревизия №</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Дата</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Извършител</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Продукти</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Разлики</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Поръчки</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredRevisions.map(revision => (
                    <tr key={revision.id} className="hover:bg-gray-750 transition-colors cursor-pointer" onClick={() => handleRevisionClick(revision)}>
                      <td className="px-6 py-4">
                        <span className="font-medium text-white">#{revision.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">
                            {new Date(revision.timestamp).toLocaleDateString('bg-BG')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">{revision.performedBy}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">
                            {revision.summary.totalProducts}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                          <span className="text-orange-400 font-bold">
                            {revision.summary.productsWithDifferences}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">
                            {revision.summary.totalOrdered}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Revision Details Modal */}
        <RevisionDetailsModal
          revision={selectedRevision}
          differences={selectedRevision ? getRevisionDifferences(selectedRevision.id) : []}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdateDifferenceAction={onUpdateDifferenceAction}
        />
      </div>
    </div>
  );
}; 