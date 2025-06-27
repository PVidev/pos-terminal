export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  stock?: number;
  discount?: number; // percentage discount
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  timestamp: Date;
  cashier?: string;
  customerInfo?: {
    name?: string;
    email?: string;
  };
}

export type PaymentMethod = 'cash' | 'card' | 'digital';

export interface DashboardStats {
  totalTransactions: number;
  totalRevenue: number;
  todayTransactions: number;
  todayRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    transactions: number;
    revenue: number;
  }>;
  paymentMethodStats: Array<{
    method: PaymentMethod;
    count: number;
    revenue: number;
  }>;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  cashier?: string;
  paymentMethod?: PaymentMethod | 'all';
  minAmount?: number;
  maxAmount?: number;
}