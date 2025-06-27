import { useState, useCallback } from 'react';
import { InventoryRevision, RevisionDifference, Product } from '../types';

export const useInventoryRevisions = () => {
  const [revisions, setRevisions] = useState<InventoryRevision[]>([]);
  const [differences, setDifferences] = useState<RevisionDifference[]>([]);

  const addRevision = useCallback((revision: Omit<InventoryRevision, 'id' | 'timestamp'>) => {
    const newRevision: InventoryRevision = {
      ...revision,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setRevisions(prev => [newRevision, ...prev]);

    // Създаваме записи за разликите
    const newDifferences: RevisionDifference[] = revision.items
      .filter(item => item.difference !== 0)
      .map(item => ({
        id: `${Date.now()}-${item.productId}`,
        revisionId: newRevision.id,
        productId: item.productId,
        productName: item.productName,
        category: item.category,
        expectedStock: item.expectedStock,
        actualStock: item.actualStock,
        difference: item.difference,
        percentageDifference: item.expectedStock > 0 
          ? Math.abs((item.difference / item.expectedStock) * 100) 
          : 0,
        timestamp: new Date(),
        action: item.orderQuantity > 0 ? 'order' : 'investigation'
      }));

    setDifferences(prev => [...newDifferences, ...prev]);

    return newRevision;
  }, []);

  const getRevisionsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return revisions.filter(revision => 
      revision.timestamp >= startDate && revision.timestamp <= endDate
    );
  }, [revisions]);

  const getDifferencesByProduct = useCallback((productId: string) => {
    return differences.filter(diff => diff.productId === productId);
  }, [differences]);

  const getDifferencesByRevision = useCallback((revisionId: string) => {
    return differences.filter(diff => diff.revisionId === revisionId);
  }, [differences]);

  const updateDifferenceAction = useCallback((differenceId: string, action: RevisionDifference['action'], reason?: string) => {
    setDifferences(prev => 
      prev.map(diff => 
        diff.id === differenceId 
          ? { ...diff, action, reason } 
          : diff
      )
    );
  }, []);

  const getRevisionStats = useCallback(() => {
    if (revisions.length === 0) return null;

    const totalRevisions = revisions.length;
    const totalDifferences = differences.length;
    const totalProductsWithDifferences = new Set(differences.map(d => d.productId)).size;
    
    const averageDifferencesPerRevision = totalDifferences / totalRevisions;
    const mostProblematicProducts = differences
      .reduce((acc, diff) => {
        acc[diff.productId] = (acc[diff.productId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topProblematicProducts = Object.entries(mostProblematicProducts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([productId, count]) => ({
        productId,
        count,
        productName: differences.find(d => d.productId === productId)?.productName || 'Unknown'
      }));

    return {
      totalRevisions,
      totalDifferences,
      totalProductsWithDifferences,
      averageDifferencesPerRevision,
      topProblematicProducts
    };
  }, [revisions, differences]);

  const getDifferencesByCategory = useCallback(() => {
    return differences.reduce((acc, diff) => {
      acc[diff.category] = (acc[diff.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [differences]);

  const getDifferencesByAction = useCallback(() => {
    return differences.reduce((acc, diff) => {
      acc[diff.action || 'none'] = (acc[diff.action || 'none'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [differences]);

  return {
    revisions,
    differences,
    addRevision,
    getRevisionsByDateRange,
    getDifferencesByProduct,
    getDifferencesByRevision,
    updateDifferenceAction,
    getRevisionStats,
    getDifferencesByCategory,
    getDifferencesByAction
  };
}; 