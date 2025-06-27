import { useMemo } from 'react';
import { Transaction, DashboardStats } from '../types';

export const useDashboard = (transactions: Transaction[]): DashboardStats => {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.timestamp);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() === today.getTime();
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const averageOrderValue = transactions.length > 0 ? totalRevenue / transactions.length : 0;

    // Calculate top products
    const productStats = new Map();
    
    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const existing = productStats.get(item.id) || {
          product: item,
          quantity: 0,
          revenue: 0
        };
        
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        
        productStats.set(item.id, existing);
      });
    });

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate hourly stats for today
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      transactions: 0,
      revenue: 0
    }));

    todayTransactions.forEach(transaction => {
      const hour = new Date(transaction.timestamp).getHours();
      hourlyStats[hour].transactions += 1;
      hourlyStats[hour].revenue += transaction.total;
    });

    // Calculate payment method stats
    const paymentMethodStats = [
      { method: 'cash' as const, count: 0, revenue: 0 },
      { method: 'card' as const, count: 0, revenue: 0 },
      { method: 'digital' as const, count: 0, revenue: 0 }
    ];

    transactions.forEach(transaction => {
      const methodStat = paymentMethodStats.find(s => s.method === transaction.paymentMethod);
      if (methodStat) {
        methodStat.count += 1;
        methodStat.revenue += transaction.total;
      }
    });

    return {
      totalTransactions: transactions.length,
      totalRevenue,
      todayTransactions: todayTransactions.length,
      todayRevenue,
      averageOrderValue,
      topProducts,
      hourlyStats,
      paymentMethodStats
    };
  }, [transactions]);
};